from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, RecordMetadata


class Client(RecordMetadata, Base):
    __tablename__ = 'clients'
    __table_args__ = (UniqueConstraint('client_no', name='uq_clients_client_no'),)

    client_no: Mapped[str] = mapped_column(String(50), nullable=False)
    name_co: Mapped[str] = mapped_column(String(200), nullable=False)
    contact: Mapped[str | None] = mapped_column(String(200))
    contact_no: Mapped[str | None] = mapped_column(String(50))
    address_1: Mapped[str | None] = mapped_column(String(300))
    address_2: Mapped[str | None] = mapped_column(String(300))
    postcode: Mapped[str | None] = mapped_column(String(30))
    city: Mapped[str | None] = mapped_column(String(100))
