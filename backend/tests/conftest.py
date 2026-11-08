import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parents[1]))

from app import create_app
from repositories.drivers import DriverRepository


@pytest.fixture
def client():
    repository = DriverRepository([
        {'DRIVER_NO': 'DRV-001', 'NAME': 'Marcus Vance'},
        {'DRIVER_NO': 'DRV-002', 'NAME': 'Elena Rostova'},
    ])
    app = create_app(repository)
    app.config.update(TESTING=True)
    return app.test_client()
