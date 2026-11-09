import re

from master_data_config import MASTER_DATA_CONFIG


MONEY_PATTERN = re.compile(r'^\d+(?:\.\d{1,2})?$')


def validate_master_data(resource, payload, partial=False):
    config = MASTER_DATA_CONFIG[resource]
    errors = {}

    if not isinstance(payload, dict):
        return {'body': 'JSON object required.'}

    known_fields = set(config['field_map'])
    for field, value in payload.items():
        if field not in known_fields:
            continue
        if value is not None and not isinstance(value, str):
            errors[field] = 'Field must be a string.'
            continue
        if field in config['max_lengths'] and isinstance(value, str) and len(value) > config['max_lengths'][field]:
            errors[field] = f"Field must be {config['max_lengths'][field]} characters or fewer."
        if field in config['phone_fields'] and isinstance(value, str) and value and not re.fullmatch(r'[0-9]+', value):
            errors[field] = 'Phone must contain digits only.'
        if field in config['money_fields'] and isinstance(value, str) and value and not MONEY_PATTERN.fullmatch(value):
            errors[field] = 'Money must contain up to two decimal places.'

    required_fields = config['required']
    fields_to_check = required_fields if not partial else required_fields.intersection(payload)
    for field in fields_to_check:
        value = payload.get(field)
        if field not in errors and (not isinstance(value, str) or not value.strip()):
            errors[field] = 'Field is required.' if not partial else 'Field cannot be blank.'

    unknown_fields = sorted(set(payload) - known_fields)
    if unknown_fields:
        errors['fields'] = f"Unknown fields: {', '.join(unknown_fields)}."

    return errors
