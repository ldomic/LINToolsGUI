from flask_script import Manager
from api import create_app, db
from api.user.models import User
import unittest

app = create_app()
manager = Manager(app)

@manager.command
def test():
    """Runs the tests without code coverage."""
    tests = unittest.TestLoader().discover('api/tests', pattern='test*.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    if result.wasSuccessful():
        return 0
    return 1

@manager.command
def init_db():
    """Initializes a database."""
    db.drop_all()
    db.create_all()
    db.session.commit()

if __name__ == '__main__':
    manager.run()
