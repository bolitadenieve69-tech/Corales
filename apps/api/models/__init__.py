from .base import Base
from .user import User, UserRole
from .choir import Choir, Membership, VoicePart
from .invite import Invite
from .season import Season
from .project import Project
from .project_repertoire import ProjectRepertoire
from .work import Work
from .edition import Edition
from .asset import Asset
from .practice_progress import PracticeProgress, PracticeStatus
from .audit_log import AuditLog
from .edition_part_mapping import EditionPartMapping
from .academy import AcademyLesson, UserAcademyProgress

from .feedback import DirectFeedback

# Make sure all models are imported here so Alembic can discover them
__all__ = ["Base", "User", "UserRole", "Choir", "Membership", "VoicePart", "Invite", "Season", "Project", "ProjectRepertoire", "Work", "Edition", "Asset", "PracticeProgress", "PracticeStatus", "AuditLog", "EditionPartMapping", "AcademyLesson", "UserAcademyProgress", "DirectFeedback"]
