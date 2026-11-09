from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Integer, Uuid, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class RecordMetadata:
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
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
