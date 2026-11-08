from flask import Flask

from app.errors import register_error_handlers
from app.routes.drivers import drivers_bp


def create_app(repository=None, session_factory=None):
    app = Flask(__name__)
    app.config.from_mapping(TESTING=False)

    if repository is None:
        if session_factory is None:
            from repositories.drivers import DriverRepository

            repository = DriverRepository()
        else:
            from repositories.sqlalchemy_drivers import SqlAlchemyDriverRepository

            repository = SqlAlchemyDriverRepository(session_factory)

    app.extensions['driver_repository'] = repository
    if session_factory is not None:
        app.extensions['driver_session_factory'] = session_factory
    app.register_blueprint(drivers_bp, url_prefix='/api/v1/drivers')
    register_error_handlers(app)

    return app
