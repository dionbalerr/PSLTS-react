from flask import Blueprint, current_app, jsonify, request

from repositories.sqlalchemy_master_data import DuplicateMasterDataError
from schemas.master_data import validate_master_data


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


def create_master_data_blueprint(resource, url_prefix):
    blueprint = Blueprint(resource, __name__)

    @blueprint.get('')
    def list_records():
        repository = current_app.extensions['master_data_repositories'][resource]
        search = request.args.get('search', '').strip()
        sort = request.args.get('sort', current_app.config['MASTER_DATA_CONFIG'][resource]['id_field'])
        direction = request.args.get('direction', 'asc')
        try:
            page = max(request.args.get('page', 1, type=int), 1)
            page_size = min(max(request.args.get('page_size', 25, type=int), 1), 100)
            result = repository.list(search, sort, direction, page, page_size)
        except ValueError as error:
            return error_response('invalid_query', str(error), status=400)
        return jsonify(result), 200

    @blueprint.post('')
    def create_record():
        payload, error = get_json_object()
        if error:
            return error
        errors = validate_master_data(resource, payload)
        if errors:
            return error_response('validation_error', f"Invalid {current_app.config['MASTER_DATA_CONFIG'][resource]['label']} data.", errors)
        try:
            record = current_app.extensions['master_data_repositories'][resource].create(payload)
        except (KeyError, DuplicateMasterDataError):
            config = current_app.config['MASTER_DATA_CONFIG'][resource]
            return error_response(config['duplicate_code'], config['duplicate_message'], status=409)
        return jsonify(data=record), 201

    @blueprint.get('/<record_id>')
    def get_record(record_id):
        record = current_app.extensions['master_data_repositories'][resource].get(record_id)
        if record is None:
            return error_response('not_found', f"{current_app.config['MASTER_DATA_CONFIG'][resource]['label'].capitalize()} not found.", status=404)
        return jsonify(data=record), 200

    @blueprint.patch('/<record_id>')
    def update_record(record_id):
        payload, error = get_json_object()
        if error:
            return error
        errors = validate_master_data(resource, payload, partial=True)
        if errors:
            return error_response('validation_error', f"Invalid {current_app.config['MASTER_DATA_CONFIG'][resource]['label']} data.", errors)
        try:
            record = current_app.extensions['master_data_repositories'][resource].update(record_id, payload)
        except KeyError:
            return error_response('not_found', f"{current_app.config['MASTER_DATA_CONFIG'][resource]['label'].capitalize()} not found.", status=404)
        except (ValueError, DuplicateMasterDataError):
            config = current_app.config['MASTER_DATA_CONFIG'][resource]
            return error_response(config['duplicate_code'], config['duplicate_message'], status=409)
        return jsonify(data=record), 200

    @blueprint.delete('/<record_id>')
    def delete_record(record_id):
        record = current_app.extensions['master_data_repositories'][resource].delete(record_id)
        if record is None:
            return error_response('not_found', f"{current_app.config['MASTER_DATA_CONFIG'][resource]['label'].capitalize()} not found.", status=404)
        return jsonify(data=record), 200

    @blueprint.post('/<record_id>/restore')
    def restore_record(record_id):
        record = current_app.extensions['master_data_repositories'][resource].restore(record_id)
        if record is None:
            return error_response('not_found', f"{current_app.config['MASTER_DATA_CONFIG'][resource]['label'].capitalize()} not found.", status=404)
        return jsonify(data=record), 200

    return blueprint, url_prefix
