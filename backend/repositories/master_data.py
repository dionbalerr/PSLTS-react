from copy import deepcopy
from decimal import Decimal


class MasterDataRepository:
    def __init__(self, config, records=None):
        self._config = config
        self._id_field = config['id_field']
        self._records = {
            record[self._id_field]: {**record, 'deleted': False}
            for record in (records or [])
        }

    def list(self, search, sort, direction, page, page_size):
        if sort not in self._config['field_map']:
            raise ValueError(f'Unsupported sort field: {sort}')
        if direction not in {'asc', 'desc'}:
            raise ValueError('Direction must be asc or desc.')

        records = [record for record in self._records.values() if not record['deleted']]
        if search:
            search = search.lower()
            records = [
                record for record in records
                if search in ' '.join(str(value or '') for key, value in record.items() if key != 'deleted').lower()
            ]

        if sort in self._config['money_fields']:
            non_null = [record for record in records if record.get(sort) not in {None, ''}]
            nulls = [record for record in records if record.get(sort) in {None, ''}]
            non_null.sort(key=lambda record: Decimal(str(record[sort])), reverse=direction == 'desc')
            records = non_null + nulls
        else:
            records.sort(key=lambda record: str(record.get(sort, '') or '').lower(), reverse=direction == 'desc')
        total = len(records)
        start = (page - 1) * page_size
        return {
            'data': deepcopy(records[start:start + page_size]),
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size,
            },
        }

    def get(self, record_id):
        record = self._records.get(record_id)
        if record is None or record['deleted']:
            return None
        return deepcopy(record)

    def create(self, payload):
        record_id = payload[self._id_field]
        if record_id in self._records:
            raise KeyError(record_id)
        record = {**self._normalize_payload(payload), 'deleted': False}
        self._records[record_id] = record
        return deepcopy(record)

    def update(self, record_id, payload):
        record = self._records.get(record_id)
        if record is None or record['deleted']:
            raise KeyError(record_id)
        next_id = payload.get(self._id_field, record_id)
        if next_id != record_id and next_id in self._records:
            raise ValueError(next_id)
        updated = {**record, **self._normalize_payload(payload), 'deleted': False}
        del self._records[record_id]
        self._records[next_id] = updated
        return deepcopy(updated)

    def delete(self, record_id):
        record = self._records.get(record_id)
        if record is None or record['deleted']:
            return None
        record['deleted'] = True
        return deepcopy(record)

    def restore(self, record_id):
        record = self._records.get(record_id)
        if record is None or not record['deleted']:
            return None
        record['deleted'] = False
        return deepcopy(record)

    def _normalize_payload(self, payload):
        empty_fields = self._config['money_fields'] | self._config['phone_fields']
        return {
            field: None if field in empty_fields and value == '' else value
            for field, value in payload.items()
        }
