from flask import Flask

from app.errors import register_error_handlers
from app.routes.master_data import create_master_data_blueprint
from app.routes.drivers import drivers_bp
from master_data_config import MASTER_DATA_CONFIG


def create_app(repository=None, session_factory=None, master_data_repositories=None):
    app = Flask(__name__)
    app.config.from_mapping(TESTING=False, MASTER_DATA_CONFIG=MASTER_DATA_CONFIG)

    if repository is None:
        if session_factory is None:
            from repositories.drivers import DriverRepository

            repository = DriverRepository()
        else:
            from repositories.sqlalchemy_drivers import SqlAlchemyDriverRepository

            repository = SqlAlchemyDriverRepository(session_factory)

    app.extensions['driver_repository'] = repository
    if master_data_repositories is None:
        if session_factory is None:
            from repositories.master_data import MasterDataRepository

            master_data_repositories = {
                resource: MasterDataRepository(config)
                for resource, config in MASTER_DATA_CONFIG.items()
            }
        else:
            from repositories.sqlalchemy_master_data import SqlAlchemyMasterDataRepository

            master_data_repositories = {
                resource: SqlAlchemyMasterDataRepository(session_factory, config)
                for resource, config in MASTER_DATA_CONFIG.items()
            }

    app.extensions['master_data_repositories'] = master_data_repositories
    if session_factory is not None:
        app.extensions['driver_session_factory'] = session_factory
    app.register_blueprint(drivers_bp, url_prefix='/api/v1/drivers')
    for resource, url_prefix in {
        'delivery_sites': '/api/v1/delivery-sites',
        'suppliers': '/api/v1/suppliers',
        'clients': '/api/v1/clients',
    }.items():
        blueprint, route_prefix = create_master_data_blueprint(resource, url_prefix)
        app.register_blueprint(blueprint, url_prefix=route_prefix)
    register_error_handlers(app)

    return app
