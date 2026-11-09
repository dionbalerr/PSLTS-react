from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.exc import IntegrityError


class DuplicateMasterDataError(Exception):
    pass


class SqlAlchemyMasterDataRepository:
    def __init__(self, session_factory, config):
        self._session_factory = session_factory
        self._config = config
        self._model = config['model']
        self._id_field = config['id_field']
        self._id_column = config['id_column']
        self._field_map = config['field_map']

    def list(self, search, sort, direction, page, page_size):
        if sort not in self._field_map:
            raise ValueError(f'Unsupported sort field: {sort}')
        if direction not in {'asc', 'desc'}:
            raise ValueError('Direction must be asc or desc.')

        with self._session_factory() as session:
            query = select(self._model).where(self._model.deleted.is_(False))
            columns = [getattr(self._model, field) for field in self._field_map.values()]
            if search:
                escaped_search = search.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
                search_value = f'%{escaped_search}%'
                query = query.where(or_(*[
                    cast(column, String).ilike(search_value, escape='\\')
                    for column in columns
                ]))

            sort_column = getattr(self._model, self._field_map[sort])
            if sort in self._config['money_fields']:
                order = sort_column.desc().nullslast() if direction == 'desc' else sort_column.asc().nullslast()
            else:
                sort_expression = func.coalesce(func.lower(cast(sort_column, String)), '')
                order = sort_expression.desc() if direction == 'desc' else sort_expression.asc()
            total = session.scalar(select(func.count()).select_from(query.subquery()))
            records = session.scalars(
                query.order_by(order, self._model.id.asc()).offset((page - 1) * page_size).limit(page_size)
            ).all()
            return {
                'data': [self._to_dict(record) for record in records],
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size,
                },
            }

    def get(self, record_id):
        with self._session_factory() as session:
            record = session.scalar(select(self._model).where(
                self._id_column == record_id,
                self._model.deleted.is_(False),
            ))
            return self._to_dict(record) if record else None

    def create(self, payload):
        with self._session_factory() as session:
            record = self._model(**self._to_model_fields(payload))
            session.add(record)
            try:
                session.commit()
            except IntegrityError as error:
                session.rollback()
                if self._is_duplicate(error):
                    raise DuplicateMasterDataError from error
                raise
            session.refresh(record)
            return self._to_dict(record)

    def update(self, record_id, payload):
        with self._session_factory() as session:
            record = session.scalar(select(self._model).where(self._id_column == record_id))
            if record is None or record.deleted:
                raise KeyError(record_id)
            for field, value in self._to_model_fields(payload).items():
                setattr(record, field, value)
            self._touch(record)
            try:
                session.commit()
            except IntegrityError as error:
                session.rollback()
                if self._is_duplicate(error):
                    raise DuplicateMasterDataError from error
                raise
            session.refresh(record)
            return self._to_dict(record)

    def delete(self, record_id):
        with self._session_factory() as session:
            record = session.scalar(select(self._model).where(
                self._id_column == record_id,
                self._model.deleted.is_(False),
            ))
            if record is None:
                return None
            record.deleted = True
            record.deleted_at = datetime.now(timezone.utc)
            self._touch(record)
            session.commit()
            return self._to_dict(record)

    def restore(self, record_id):
        with self._session_factory() as session:
            record = session.scalar(select(self._model).where(
                self._id_column == record_id,
                self._model.deleted.is_(True),
            ))
            if record is None:
                return None
            record.deleted = False
            record.deleted_at = None
            self._touch(record)
            session.commit()
            return self._to_dict(record)

    def _to_model_fields(self, payload):
        return {
            model_field: (
                None
                if (api_field in self._config['money_fields'] or api_field in self._config['phone_fields']) and payload[api_field] == ''
                else payload[api_field]
            )
            for api_field, model_field in self._field_map.items()
            if api_field in payload
        }

    def _to_dict(self, record):
        if record is None:
            return None
        result = {
            api_field: getattr(record, model_field)
            for api_field, model_field in self._field_map.items()
        }
        for field in self._config['money_fields']:
            value = result[field]
            result[field] = f'{value:.2f}' if isinstance(value, Decimal) else value
        result['deleted'] = record.deleted
        return result

    def _is_duplicate(self, error):
        diagnostic = getattr(error.orig, 'diag', None)
        return getattr(diagnostic, 'constraint_name', None) == self._config['constraint']

    @staticmethod
    def _touch(record):
        record.row_version += 1
        record.updated_at = datetime.now(timezone.utc)
