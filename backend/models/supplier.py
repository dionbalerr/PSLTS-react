from decimal import Decimal

from sqlalchemy import Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, RecordMetadata


class Supplier(RecordMetadata, Base):
    __tablename__ = 'suppliers'
    __table_args__ = (UniqueConstraint('supplier_no', name='uq_suppliers_supplier_no'),)

    supplier_no: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    telephone: Mapped[str | None] = mapped_column(String(50))
    contact: Mapped[str | None] = mapped_column(String(200))
    goods: Mapped[str | None] = mapped_column(String(200))
    terms: Mapped[str | None] = mapped_column(String(200))
    curr_bal: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
