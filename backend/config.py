import os

from dotenv import load_dotenv


load_dotenv()


def get_database_url():
    return get_required_database_url('DATABASE_URL')


def get_test_database_url():
    return get_required_database_url('TEST_DATABASE_URL')


def get_required_database_url(variable_name):
    database_url = os.getenv(variable_name)
    if not database_url:
        raise RuntimeError(f'{variable_name} is required for database operations.')

    return database_url
