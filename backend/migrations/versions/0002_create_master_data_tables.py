"""create delivery sites, suppliers, and clients tables

Revision ID: 0002_create_master_data_tables
Revises: 0001_create_drivers
Create Date: 2026-11-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0002_create_master_data_tables'
down_revision: Union[str, None] = '0001_create_drivers'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def metadata_columns():
    return [
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('row_version', sa.Integer(), server_default=sa.text('1'), nullable=False),
        sa.Column('deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    op.create_table(
        'delivery_sites',
        *metadata_columns(),
        sa.Column('site_no', sa.String(length=50), nullable=False),
        sa.Column('originate', sa.String(length=200), nullable=False),
        sa.Column('destinate', sa.String(length=200), nullable=False),
        sa.Column('goods', sa.String(length=200), nullable=True),
        sa.Column('gross_prc', sa.Numeric(12, 2), nullable=True),
        sa.Column('net_prc', sa.Numeric(12, 2), nullable=True),
        sa.Column('client_no', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('site_no', name='uq_delivery_sites_site_no'),
    )
    op.create_table(
        'suppliers',
        *metadata_columns(),
        sa.Column('supplier_no', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('telephone', sa.String(length=50), nullable=True),
        sa.Column('contact', sa.String(length=200), nullable=True),
        sa.Column('goods', sa.String(length=200), nullable=True),
        sa.Column('terms', sa.String(length=200), nullable=True),
        sa.Column('curr_bal', sa.Numeric(12, 2), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('supplier_no', name='uq_suppliers_supplier_no'),
    )
    op.create_table(
        'clients',
        *metadata_columns(),
        sa.Column('client_no', sa.String(length=50), nullable=False),
        sa.Column('name_co', sa.String(length=200), nullable=False),
        sa.Column('contact', sa.String(length=200), nullable=True),
        sa.Column('contact_no', sa.String(length=50), nullable=True),
        sa.Column('address_1', sa.String(length=300), nullable=True),
        sa.Column('address_2', sa.String(length=300), nullable=True),
        sa.Column('postcode', sa.String(length=30), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('client_no', name='uq_clients_client_no'),
    )


def downgrade() -> None:
    op.drop_table('clients')
    op.drop_table('suppliers')
    op.drop_table('delivery_sites')
