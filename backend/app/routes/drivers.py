from flask import Blueprint, current_app, jsonify, request

from repositories.sqlalchemy_drivers import DuplicateDriverError
from schemas.drivers import validate_driver


drivers_bp = Blueprint('drivers', __name__)


def error_response(code, message, fields=None, status=400):
    error = {'code': code, 'message': message}
    if fields:
        error['fields'] = fields
    return jsonify(error=error), status


def get_json_object():
    if not request.is_json:
        return None, error_response('invalid_json', 'JSON object required.')

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return None, error_response('invalid_json', 'JSON object required.')

    return payload, None


@drivers_bp.get('')
def list_drivers():
    repository = current_app.extensions['driver_repository']
    search = request.args.get('search', '').strip()
    sort = request.args.get('sort', 'DRIVER_NO')
    direction = request.args.get('direction', 'asc')

    try:
        page = max(request.args.get('page', 1, type=int), 1)
        page_size = min(max(request.args.get('page_size', 25, type=int), 1), 100)
        result = repository.list(search, sort, direction, page, page_size)
    except ValueError as error:
        return error_response('invalid_query', str(error), status=400)

    return jsonify(result), 200


@drivers_bp.post('')
def create_driver():
    payload, error = get_json_object()
    if error:
        return error

    errors = validate_driver(payload)
    if errors:
        return error_response('validation_error', 'Invalid driver data.', errors)

    repository = current_app.extensions['driver_repository']
    try:
        driver = repository.create(payload)
    except (KeyError, DuplicateDriverError):
        return error_response('duplicate_driver_no', 'Driver ID already exists.', status=409)

    return jsonify(data=driver), 201


@drivers_bp.get('/<driver_id>')
def get_driver(driver_id):
    repository = current_app.extensions['driver_repository']
    driver = repository.get(driver_id)
    if driver is None:
        return error_response('not_found', 'Driver not found.', status=404)

    return jsonify(data=driver), 200


@drivers_bp.patch('/<driver_id>')
def update_driver(driver_id):
    payload, error = get_json_object()
    if error:
        return error

    errors = validate_driver(payload, partial=True)
    if errors:
        return error_response('validation_error', 'Invalid driver data.', errors)

    repository = current_app.extensions['driver_repository']
    try:
        driver = repository.update(driver_id, payload)
    except KeyError:
        return error_response('not_found', 'Driver not found.', status=404)
    except (ValueError, DuplicateDriverError):
        return error_response('duplicate_driver_no', 'Driver ID already exists.', status=409)

    return jsonify(data=driver), 200


@drivers_bp.delete('/<driver_id>')
def delete_driver(driver_id):
    repository = current_app.extensions['driver_repository']
    driver = repository.delete(driver_id)
    if driver is None:
        return error_response('not_found', 'Driver not found.', status=404)

    return jsonify(data=driver), 200


@drivers_bp.post('/<driver_id>/restore')
def restore_driver(driver_id):
    repository = current_app.extensions['driver_repository']
    driver = repository.restore(driver_id)
    if driver is None:
        return error_response('not_found', 'Driver not found.', status=404)

    return jsonify(data=driver), 200
