from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from models.driver import Driver


class DuplicateDriverError(Exception):
    pass


FIELD_MAP = {
    'DRIVER_NO': Driver.driver_no,
    'NAME': Driver.name,
    'IC_NO': Driver.ic_no,
    'LORRY_NO': Driver.lorry_no,
    'COMISSION': Driver.comission,
    'BASIC': Driver.basic,
    'ROAD_TAX': Driver.road_tax,
    'INSPECTION': Driver.inspection,
}


def driver_to_dict(driver):
    return {
        'DRIVER_NO': driver.driver_no,
        'NAME': driver.name,
        'IC_NO': driver.ic_no,
        'LORRY_NO': driver.lorry_no,
        'COMISSION': driver.comission,
        'BASIC': driver.basic,
        'ROAD_TAX': driver.road_tax,
        'INSPECTION': driver.inspection,
        'deleted': driver.deleted,
    }


class SqlAlchemyDriverRepository:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    def list(self, search, sort, direction, page, page_size):
        sort_column = FIELD_MAP.get(sort)
        if sort_column is None:
            raise ValueError(f'Unsupported sort field: {sort}')
        if direction not in {'asc', 'desc'}:
            raise ValueError('Direction must be asc or desc.')

        with self._session_factory() as session:
            query = select(Driver).where(Driver.deleted.is_(False))
            if search:
                escaped_search = search.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
                search_value = f'%{escaped_search}%'
                query = query.where(or_(*[
                    column.ilike(search_value, escape='\\')
                    for column in FIELD_MAP.values()
                ]))

            sort_expression = func.coalesce(func.lower(sort_column), '')
            order = sort_expression.desc() if direction == 'desc' else sort_expression.asc()
            total = session.scalar(select(func.count()).select_from(query.subquery()))
            records = session.scalars(
                query.order_by(order, Driver.id.asc()).offset((page - 1) * page_size).limit(page_size)
            ).all()

            return {
                'data': [driver_to_dict(record) for record in records],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size,
                },
            }

    def get(self, driver_id):
        with self._session_factory() as session:
            driver = session.scalar(
                select(Driver).where(
                    Driver.driver_no == driver_id,
                    Driver.deleted.is_(False),
                )
            )
            return driver_to_dict(driver) if driver else None

    def create(self, payload):
        with self._session_factory() as session:
            driver = Driver(**self._to_model_fields(payload))
            session.add(driver)
            try:
                session.commit()
            except IntegrityError as error:
                session.rollback()
                if self._is_duplicate_driver_error(error):
                    raise DuplicateDriverError from error
                raise

            session.refresh(driver)
            return driver_to_dict(driver)

    def update(self, driver_id, payload):
        with self._session_factory() as session:
            driver = session.scalar(select(Driver).where(Driver.driver_no == driver_id))
            if driver is None or driver.deleted:
                raise KeyError(driver_id)

            for field, value in self._to_model_fields(payload).items():
                setattr(driver, field, value)

            self._touch(driver)

            try:
                session.commit()
            except IntegrityError as error:
                session.rollback()
                if self._is_duplicate_driver_error(error):
                    raise DuplicateDriverError from error
                raise

            session.refresh(driver)
            return driver_to_dict(driver)

    def delete(self, driver_id):
        with self._session_factory() as session:
            driver = session.scalar(
                select(Driver).where(
                    Driver.driver_no == driver_id,
                    Driver.deleted.is_(False),
                )
            )
            if driver is None:
                return None

            driver.deleted = True
            driver.deleted_at = datetime.now(timezone.utc)
            self._touch(driver)
            session.commit()
            return driver_to_dict(driver)

    def restore(self, driver_id):
        with self._session_factory() as session:
            driver = session.scalar(
                select(Driver).where(
                    Driver.driver_no == driver_id,
                    Driver.deleted.is_(True),
                )
            )
            if driver is None:
                return None

            driver.deleted = False
            driver.deleted_at = None
            self._touch(driver)
            session.commit()
            return driver_to_dict(driver)

    @staticmethod
    def _to_model_fields(payload):
        field_map = {
            'DRIVER_NO': 'driver_no',
            'NAME': 'name',
            'IC_NO': 'ic_no',
            'LORRY_NO': 'lorry_no',
            'COMISSION': 'comission',
            'BASIC': 'basic',
            'ROAD_TAX': 'road_tax',
            'INSPECTION': 'inspection',
        }
        return {
            model_field: payload[api_field]
            for api_field, model_field in field_map.items()
            if api_field in payload
        }

    @staticmethod
    def _is_duplicate_driver_error(error):
        diagnostic = getattr(error.orig, 'diag', None)
        return getattr(diagnostic, 'constraint_name', None) == 'uq_drivers_driver_no'

    @staticmethod
    def _touch(driver):
        driver.row_version = Driver.row_version + 1
        driver.updated_at = datetime.now(timezone.utc)
