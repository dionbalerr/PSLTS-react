"""create drivers table

Revision ID: 0001_create_drivers
Revises:
Create Date: 2026-11-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0001_create_drivers'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'drivers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('driver_no', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('ic_no', sa.String(length=100), nullable=True),
        sa.Column('lorry_no', sa.String(length=100), nullable=True),
        sa.Column('comission', sa.String(length=100), nullable=True),
        sa.Column('basic', sa.String(length=100), nullable=True),
        sa.Column('road_tax', sa.String(length=100), nullable=True),
        sa.Column('inspection', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('row_version', sa.Integer(), server_default=sa.text('1'), nullable=False),
        sa.Column('deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('driver_no', name='uq_drivers_driver_no'),
    )


def downgrade() -> None:
    op.drop_table('drivers')
