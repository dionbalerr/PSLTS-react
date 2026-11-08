REQUIRED_FIELDS = {'DRIVER_NO', 'NAME'}
FIELD_MAX_LENGTHS = {
    'DRIVER_NO': 50,
    'NAME': 200,
    'IC_NO': 100,
    'LORRY_NO': 100,
    'COMISSION': 100,
    'BASIC': 100,
    'ROAD_TAX': 100,
    'INSPECTION': 100,
}
KNOWN_FIELDS = {
    'DRIVER_NO',
    'NAME',
    'IC_NO',
    'LORRY_NO',
    'COMISSION',
    'BASIC',
    'ROAD_TAX',
    'INSPECTION',
}


def validate_driver(payload, partial=False):
    errors = {}

    if not isinstance(payload, dict):
        return {'body': 'JSON object required.'}

    for field, value in payload.items():
        if field in KNOWN_FIELDS and value is not None and not isinstance(value, str):
            errors[field] = 'Field must be a string.'

        if field in FIELD_MAX_LENGTHS and isinstance(value, str) and len(value) > FIELD_MAX_LENGTHS[field]:
            errors[field] = f'Field must be {FIELD_MAX_LENGTHS[field]} characters or fewer.'

    if not partial:
        for field in REQUIRED_FIELDS:
            if field not in payload:
                errors[field] = 'Field is required.'
            elif field not in errors and not isinstance(payload[field], str):
                errors[field] = 'Field must be a string.'
            elif field not in errors and not payload[field].strip():
                errors[field] = 'Field is required.'
    else:
        for field in payload:
            if field in REQUIRED_FIELDS and field not in errors:
                if not isinstance(payload[field], str):
                    errors[field] = 'Field must be a string.'
                elif not payload[field].strip():
                    errors[field] = 'Field cannot be blank.'

    unknown_fields = sorted(set(payload) - KNOWN_FIELDS)
    if unknown_fields:
        errors['fields'] = f'Unknown fields: {", ".join(unknown_fields)}.'

    return errors
