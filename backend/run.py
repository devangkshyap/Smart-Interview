import os
from app import create_app, db
from app.models import User, Interview, Question, Resume, InterviewTemplate

app = create_app(os.getenv('FLASK_ENV', 'development'))


@app.shell_context_processor
def make_shell_context():
    """Make models available in Flask shell"""
    return {
        'db': db,
        'User': User,
        'Interview': Interview,
        'Question': Question,
        'Resume': Resume,
        'InterviewTemplate': InterviewTemplate,
    }


@app.cli.command()
def init_db():
    """Initialize the database"""
    db.create_all()
    print('Database initialized.')


@app.cli.command()
def drop_db():
    """Drop all database tables"""
    if input('Are you sure? (y/n) ').lower() == 'y':
        db.drop_all()
        print('Database dropped.')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
