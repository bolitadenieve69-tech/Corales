"""make work choir_id nullable, add edition source column

Revision ID: 40ad839dab3d
Revises: 4678b9954049
Create Date: 2026-03-05 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40ad839dab3d'
down_revision: Union[str, None] = '4678b9954049'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make works.choir_id nullable (global catalog works don't belong to any choir)
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('choir_id',
                              existing_type=sa.String(),
                              nullable=True)

    # Add source column to editions (IMSLP, CPDL, etc.)
    with op.batch_alter_table('editions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('source', sa.String(), nullable=True))
        batch_op.create_index(batch_op.f('ix_editions_source'), ['source'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('editions', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_editions_source'))
        batch_op.drop_column('source')

    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('choir_id',
                              existing_type=sa.String(),
                              nullable=False)
