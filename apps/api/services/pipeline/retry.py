"""Error classification for retry policy (Tarea 11.4).

Retryable errors: temporary failures that may resolve on their own
  - ConnectionError, TimeoutError, OSError (network/storage issues)
  
Non-retryable errors: require user intervention
  - ValueError (corrupt MusicXML)
  - MappingRequired (ambiguous part assignment)
  - UnsupportedFormatError (unsupported file format)
"""

import logging

logger = logging.getLogger(__name__)


class MappingRequired(Exception):
    """Raised when MusicXML parts can't be auto-mapped to SATB voices."""
    pass


class UnsupportedFormatError(Exception):
    """Raised when the input file format is not supported."""
    pass


# Exceptions that should NOT trigger a retry
_NON_RETRYABLE = (
    ValueError,
    MappingRequired,
    UnsupportedFormatError,
    KeyError,
    TypeError,
)


def is_retryable(exc: Exception) -> bool:
    """Determine if an exception is retryable (temporary) or permanent.
    
    Args:
        exc: The exception to classify
        
    Returns:
        True if the error is temporary and the job should be retried
    """
    if isinstance(exc, _NON_RETRYABLE):
        logger.info(f"Non-retryable error: {type(exc).__name__}: {exc}")
        return False
    
    # Connection, timeout, OS errors are retryable
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        logger.info(f"Retryable error: {type(exc).__name__}: {exc}")
        return True
    
    # Default: retry unknown errors (conservative approach)
    logger.warning(f"Unknown error type, defaulting to retryable: {type(exc).__name__}: {exc}")
    return True
