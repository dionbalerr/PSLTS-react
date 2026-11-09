from decimal import Decimal

from sqlalchemy import Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, RecordMetadata


class DeliverySite(RecordMetadata, Base):
    __tablename__ = 'delivery_sites'
    __table_args__ = (UniqueConstraint('site_no', name='uq_delivery_sites_site_no'),)

    site_no: Mapped[str] = mapped_column(String(50), nullable=False)
    originate: Mapped[str] = mapped_column(String(200), nullable=False)
    destinate: Mapped[str] = mapped_column(String(200), nullable=False)
    goods: Mapped[str | None] = mapped_column(String(200))
    gross_prc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    net_prc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    client_no: Mapped[str | None] = mapped_column(String(50))
