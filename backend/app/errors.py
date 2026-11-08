from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify(error={
            'code': 'not_found',
            'message': 'Resource not found.',
        }), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return jsonify(error={
            'code': 'method_not_allowed',
            'message': 'Method not allowed.',
        }), 405
