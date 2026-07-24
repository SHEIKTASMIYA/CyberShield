import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Run server on port 5000 in debug mode
    app.run(
        host=os.environ.get('HOST', '0.0.0.0'),
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    )
