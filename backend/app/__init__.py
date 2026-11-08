from flask import Flask

from app.errors import register_error_handlers
from app.routes.drivers import drivers_bp


def create_app(repository=None):
    app = Flask(__name__)
    app.config.from_mapping(TESTING=False)

    if repository is None:
        from repositories.drivers import DriverRepository

        repository = DriverRepository()

    app.extensions['driver_repository'] = repository
    app.register_blueprint(drivers_bp, url_prefix='/api/v1/drivers')
    register_error_handlers(app)

    return app
