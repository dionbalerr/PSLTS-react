from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import get_database_url


def create_session_factory(database_url=None):
    engine = create_engine(database_url or get_database_url(), pool_pre_ping=True)
    return sessionmaker(bind=engine, expire_on_commit=False)
