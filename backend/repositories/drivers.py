from copy import deepcopy


SORT_FIELDS = {
    'DRIVER_NO',
    'NAME',
    'IC_NO',
    'LORRY_NO',
    'COMISSION',
    'BASIC',
    'ROAD_TAX',
    'INSPECTION',
}


class DriverRepository:
    def __init__(self, records=None):
        self._records = {
            record['DRIVER_NO']: {**record, 'deleted': False}
            for record in (records or [])
        }

    def list(self, search, sort, direction, page, page_size):
        if sort not in SORT_FIELDS:
            raise ValueError(f'Unsupported sort field: {sort}')
        if direction not in {'asc', 'desc'}:
            raise ValueError('Direction must be asc or desc.')

        records = [record for record in self._records.values() if not record['deleted']]
        if search:
            search = search.lower()
            records = [
                record for record in records
                if search in ' '.join(
                    str(value or '')
                    for key, value in record.items()
                    if key != 'deleted'
                ).lower()
            ]

        records.sort(key=lambda record: str(record.get(sort, '') or '').lower(), reverse=direction == 'desc')
        total = len(records)
        start = (page - 1) * page_size
        items = records[start:start + page_size]

        return {
            'data': deepcopy(items),
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size,
            },
        }

    def get(self, driver_id):
        record = self._records.get(driver_id)
        if record is None or record['deleted']:
            return None
        return deepcopy(record)

    def create(self, payload):
        driver_id = payload['DRIVER_NO']
        if driver_id in self._records:
            raise KeyError(driver_id)

        record = {**payload, 'deleted': False}
        self._records[driver_id] = record
        return deepcopy(record)

    def update(self, driver_id, payload):
        record = self._records.get(driver_id)
        if record is None or record['deleted']:
            raise KeyError(driver_id)

        next_id = payload.get('DRIVER_NO', driver_id)
        if next_id != driver_id and next_id in self._records:
            raise ValueError(next_id)

        updated = {**record, **payload, 'deleted': False}
        del self._records[driver_id]
        self._records[next_id] = updated
        return deepcopy(updated)

    def delete(self, driver_id):
        record = self._records.get(driver_id)
        if record is None or record['deleted']:
            return None

        record['deleted'] = True
        return deepcopy(record)

    def restore(self, driver_id):
        record = self._records.get(driver_id)
        if record is None or not record['deleted']:
            return None

        record['deleted'] = False
        return deepcopy(record)
