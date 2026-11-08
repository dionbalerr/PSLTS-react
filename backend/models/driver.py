from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Integer, String, UniqueConstraint, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Driver(Base):
    __tablename__ = 'drivers'
    __table_args__ = (
        UniqueConstraint('driver_no', name='uq_drivers_driver_no'),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    driver_no: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    ic_no: Mapped[str | None] = mapped_column(String(100))
    lorry_no: Mapped[str | None] = mapped_column(String(100))
    comission: Mapped[str | None] = mapped_column(String(100))
    basic: Mapped[str | None] = mapped_column(String(100))
    road_tax: Mapped[str | None] = mapped_column(String(100))
    inspection: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text('CURRENT_TIMESTAMP'),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text('CURRENT_TIMESTAMP'),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    row_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text('1'))
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text('false'))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
