"""Tests for pipeline infrastructure (Tarea 11).

Tests:
  - SHA-256 checksum computation
  - Error classification (retryable vs permanent)
  - Idempotent asset creation (deduplication)
"""

import os
import sys
import tempfile
import pytest

# Add parent dir to path so we can import from the api package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.pipeline.checksum import compute_sha256
from services.pipeline.retry import is_retryable, MappingRequired, UnsupportedFormatError


# ─── Checksum Tests (11.2) ───

class TestChecksum:
    def test_same_file_same_hash(self):
        """The same file content must always produce the same hash."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f:
            f.write(b"Hello, this is a test MIDI file content")
            path = f.name

        try:
            hash1 = compute_sha256(path)
            hash2 = compute_sha256(path)
            assert hash1 == hash2
            assert len(hash1) == 64  # SHA-256 hex digest is 64 chars
        finally:
            os.unlink(path)

    def test_different_content_different_hash(self):
        """Different file contents must produce different hashes."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f1:
            f1.write(b"Content A")
            path1 = f1.name
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f2:
            f2.write(b"Content B")
            path2 = f2.name

        try:
            hash1 = compute_sha256(path1)
            hash2 = compute_sha256(path2)
            assert hash1 != hash2
        finally:
            os.unlink(path1)
            os.unlink(path2)

    def test_empty_file_hash(self):
        """Empty files should produce a valid hash."""
        with tempfile.NamedTemporaryFile(delete=False) as f:
            path = f.name

        try:
            h = compute_sha256(path)
            assert len(h) == 64
            # Known SHA-256 of empty data
            assert h == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        finally:
            os.unlink(path)


# ─── Retry Classification Tests (11.4) ───

class TestRetryClassification:
    def test_connection_error_is_retryable(self):
        assert is_retryable(ConnectionError("Redis down")) is True

    def test_timeout_error_is_retryable(self):
        assert is_retryable(TimeoutError("Timed out")) is True

    def test_os_error_is_retryable(self):
        assert is_retryable(OSError("Disk full")) is True

    def test_value_error_not_retryable(self):
        """ValueError (corrupt XML) should not be retried."""
        assert is_retryable(ValueError("Invalid XML")) is False

    def test_mapping_required_not_retryable(self):
        """MappingRequired should not be retried — needs user action."""
        assert is_retryable(MappingRequired("Ambiguous parts")) is False

    def test_unsupported_format_not_retryable(self):
        assert is_retryable(UnsupportedFormatError(".doc")) is False

    def test_key_error_not_retryable(self):
        assert is_retryable(KeyError("missing_key")) is False

    def test_type_error_not_retryable(self):
        assert is_retryable(TypeError("wrong type")) is False

    def test_unknown_error_defaults_retryable(self):
        """Unknown exceptions default to retryable (conservative)."""
        assert is_retryable(RuntimeError("Unknown issue")) is True


# ─── Idempotent Asset Tests (11.2) ───

class TestIdempotentAsset:
    """Tests using an in-memory SQLite database."""

    @pytest.fixture
    def db_session(self):
        """Create an in-memory SQLite DB with the assets table."""
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from models.base import Base

        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    def test_create_new_asset(self, db_session):
        """First call creates a new asset."""
        from services.pipeline.idempotency import find_or_create_asset

        # Create a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f:
            f.write(b"MIDI file content for test")
            path = f.name

        try:
            # Need to create an edition first (foreign key)
            from models.edition import Edition
            edition = Edition(id="ed_test_1", work_id="w1", publisher="Test")
            db_session.add(edition)
            # Need a work too
            from models.work import Work
            work = Work(id="w1", title="Test Work", choir_id="c1")
            db_session.add(work)
            db_session.commit()

            asset, created = find_or_create_asset(
                db_session, "ed_test_1", "MIDI",
                path, "editions/ed_test_1/test.mid",
                "/storage/editions/ed_test_1/test.mid",
            )
            assert created is True
            assert asset.checksum is not None
            assert asset.processing_status == "OK"
            assert len(asset.checksum) == 64
        finally:
            os.unlink(path)

    def test_duplicate_asset_reuses_existing(self, db_session):
        """Second call with identical content reuses the first asset."""
        from services.pipeline.idempotency import find_or_create_asset
        from models.work import Work
        from models.edition import Edition

        work = Work(id="w2", title="Test Work 2", choir_id="c1")
        edition = Edition(id="ed_test_2", work_id="w2", publisher="Test")
        db_session.add(work)
        db_session.add(edition)
        db_session.commit()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f:
            f.write(b"Same content for dedup test")
            path = f.name

        try:
            asset1, created1 = find_or_create_asset(
                db_session, "ed_test_2", "AUDIO_TUTTI",
                path, "key1", "/url1",
            )
            asset2, created2 = find_or_create_asset(
                db_session, "ed_test_2", "AUDIO_TUTTI",
                path, "key2", "/url2",
            )

            assert created1 is True
            assert created2 is False  # Should NOT create a duplicate
            assert asset1.id == asset2.id  # Same asset reused
        finally:
            os.unlink(path)

    def test_different_type_creates_separate_asset(self, db_session):
        """Same file but different asset_type creates a new asset."""
        from services.pipeline.idempotency import find_or_create_asset
        from models.work import Work
        from models.edition import Edition

        work = Work(id="w3", title="Test Work 3", choir_id="c1")
        edition = Edition(id="ed_test_3", work_id="w3", publisher="Test")
        db_session.add(work)
        db_session.add(edition)
        db_session.commit()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as f:
            f.write(b"Content for type test")
            path = f.name

        try:
            asset1, created1 = find_or_create_asset(
                db_session, "ed_test_3", "AUDIO_SOPRANO",
                path, "key_s", "/url_s",
            )
            asset2, created2 = find_or_create_asset(
                db_session, "ed_test_3", "AUDIO_ALTO",
                path, "key_a", "/url_a",
            )

            assert created1 is True
            assert created2 is True  # Different type = new asset
            assert asset1.id != asset2.id
        finally:
            os.unlink(path)
