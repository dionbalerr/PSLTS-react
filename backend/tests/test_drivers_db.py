import os
import socket

from alembic import command
from alembic.config import Config
import pytest
from sqlalchemy import inspect, text
from sqlalchemy.engine import make_url

from app import create_app
from config import get_test_database_url
from db import create_session_factory


def assert_test_database_isolated(test_url):
    test_parts = make_url(test_url)
    if test_parts.database != 'pslts_test':
        pytest.fail('TEST_DATABASE_URL must target database pslts_test.')
    if test_parts.query:
        pytest.fail('TEST_DATABASE_URL must not include query overrides.')

    development_url = os.getenv('DATABASE_URL')
    if not development_url:
        return

    development_parts = make_url(development_url)
    if development_parts.query:
        pytest.fail('DATABASE_URL must not include query overrides during DB tests.')
    if development_parts.database == 'pslts_test':
        pytest.fail('DATABASE_URL must not target database pslts_test.')
    test_host = _resolve_host(test_parts.host)
    development_host = _resolve_host(development_parts.host)
    same_database = (
        test_host == development_host
        and (test_parts.port or 5432) == (development_parts.port or 5432)
        and test_parts.database == development_parts.database
    )
    if same_database:
        pytest.fail('TEST_DATABASE_URL must not match DATABASE_URL.')


def _resolve_host(host):
    if host in {'localhost', '127.0.0.1', '::1'}:
        return 'local'

    try:
        return socket.gethostbyname(host)
    except socket.gaierror:
        return host.lower()


def migrate_test_database(test_url):
    original_database_url = os.environ.get('DATABASE_URL')
    os.environ['DATABASE_URL'] = test_url
    try:
        alembic_config = Config('alembic.ini')
        command.upgrade(alembic_config, 'head')
    finally:
        if original_database_url is None:
            os.environ.pop('DATABASE_URL', None)
        else:
            os.environ['DATABASE_URL'] = original_database_url


@pytest.fixture
def db_client():
    try:
        test_url = get_test_database_url()
    except RuntimeError as error:
        pytest.skip(str(error))

    assert_test_database_isolated(test_url)
    session_factory = create_session_factory(test_url)
    engine = session_factory.kw['bind']
    with engine.connect() as connection:
        if connection.scalar(text('SELECT current_database()')) != 'pslts_test':
            pytest.fail('Connected database is not pslts_test.')
    migrate_test_database(test_url)
    if not inspect(engine).has_table('drivers'):
        pytest.fail('pslts_test is not migrated. Run: alembic upgrade head')

    with engine.begin() as connection:
        connection.execute(text('TRUNCATE TABLE drivers'))

    app = create_app(session_factory=session_factory)
    app.config.update(TESTING=True)
    yield app.test_client()

    with engine.begin() as connection:
        connection.execute(text('TRUNCATE TABLE drivers'))


@pytest.mark.db
def test_db_driver_persists_across_requests(db_client):
    create_response = db_client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'DB-001',
        'NAME': 'Database Driver',
    })

    assert create_response.status_code == 201
    assert db_client.get('/api/v1/drivers/DB-001').json['data']['NAME'] == 'Database Driver'


@pytest.mark.db
def test_db_duplicate_create_rolls_back_and_next_write_succeeds(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-002', 'NAME': 'First'})
    duplicate_response = db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-002', 'NAME': 'Duplicate'})

    assert duplicate_response.status_code == 409
    next_response = db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-003', 'NAME': 'Next'})
    assert next_response.status_code == 201


@pytest.mark.db
def test_db_update_duplicate_rolls_back(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-007', 'NAME': 'First'})
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-008', 'NAME': 'Second'})

    duplicate_response = db_client.patch('/api/v1/drivers/DB-007', json={'DRIVER_NO': 'DB-008'})

    assert duplicate_response.status_code == 409
    assert db_client.get('/api/v1/drivers/DB-007').status_code == 200
    assert db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-009', 'NAME': 'Next'}).status_code == 201


@pytest.mark.db
def test_db_deleted_id_remains_reserved(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-005', 'NAME': 'Deleted'})
    db_client.delete('/api/v1/drivers/DB-005')

    response = db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-005', 'NAME': 'Replacement'})

    assert response.status_code == 409


@pytest.mark.db
def test_db_delete_restore_and_deleted_id_reservation(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-004', 'NAME': 'Deleted'})
    assert db_client.delete('/api/v1/drivers/DB-004').status_code == 200
    assert db_client.get('/api/v1/drivers/DB-004').status_code == 404
    assert db_client.post('/api/v1/drivers/DB-004/restore').status_code == 200


@pytest.mark.db
def test_db_optional_field_can_be_cleared(db_client):
    db_client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'DB-006',
        'NAME': 'Nullable',
        'IC_NO': 'IC-006',
    })

    response = db_client.patch('/api/v1/drivers/DB-006', json={'IC_NO': None})

    assert response.status_code == 200
    assert response.json['data']['IC_NO'] is None


@pytest.mark.db
def test_db_rejects_length_overflow_before_write(db_client):
    response = db_client.post('/api/v1/drivers', json={
        'DRIVER_NO': 'D' * 51,
        'NAME': 'Too Long',
    })

    assert response.status_code == 400
    assert response.json['error']['code'] == 'validation_error'


@pytest.mark.db
def test_db_escapes_search_and_paginates_sort(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-010', 'NAME': '100%'})
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-011', 'NAME': '100X'})

    search_response = db_client.get('/api/v1/drivers?search=100%')
    page_response = db_client.get('/api/v1/drivers?sort=NAME&page=1&page_size=1')

    assert search_response.json['pagination']['total'] == 1
    assert page_response.json['pagination']['total'] == 2
    assert len(page_response.json['data']) == 1


@pytest.mark.db
def test_db_mutations_update_version_and_timestamps(db_client):
    db_client.post('/api/v1/drivers', json={'DRIVER_NO': 'DB-012', 'NAME': 'Versioned'})
    session_factory = db_client.application.extensions['driver_session_factory']

    with session_factory() as session:
        created = session.execute(text("SELECT row_version, created_at, updated_at, deleted_at FROM drivers WHERE driver_no = 'DB-012'")).one()

    db_client.patch('/api/v1/drivers/DB-012', json={'NAME': 'Updated'})
    db_client.delete('/api/v1/drivers/DB-012')

    with session_factory() as session:
        updated = session.execute(text("SELECT row_version, created_at, updated_at, deleted_at FROM drivers WHERE driver_no = 'DB-012'")).one()

    assert created[0] == 1
    assert updated[0] == 3
    assert updated[2] >= updated[1]
    assert updated[3] is not None
