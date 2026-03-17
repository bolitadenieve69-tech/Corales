"""add level to academy lessons

Revision ID: 7d2f9a1b0c3e
Revises: 40ad839dab3d
Create Date: 2026-03-13 17:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d2f9a1b0c3e'
down_revision: Union[str, None] = '40ad839dab3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('academy_lessons', schema=None) as batch_op:
        batch_op.add_column(sa.Column('level', sa.String(), nullable=True, server_default='INICIACION'))


def downgrade() -> None:
    with op.batch_alter_table('academy_lessons', schema=None) as batch_op:
        batch_op.drop_column('level')
