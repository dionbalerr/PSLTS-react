from app import create_app
from db import create_session_factory


app = create_app(session_factory=create_session_factory())


if __name__ == '__main__':
    app.run(debug=True)
