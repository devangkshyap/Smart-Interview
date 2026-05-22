from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from app.models import db
from app.routes.auth import auth_bp
from app.routes.interviews import interview_bp
from app.routes.resumes import resume_bp
from app.routes.chat import bp as chat_bp
import os


def create_app(config_name='development'):
    """Application factory"""
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(chat_bp)
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized access'}), 401
    

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy'}), 200
    
    # Root endpoint - provide a small API landing message
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Smart Interview API',
            'health': '/api/health',
            'docs': '/api'
        }), 200
    # Initialize database
    with app.app_context():
        db.create_all()
        # Seed initial data
        _seed_initial_data()
    
    return app


def _seed_initial_data():
    """Seed initial interview templates"""
    from app.models import InterviewTemplate
    
    # Check if templates already exist
    if InterviewTemplate.query.first():
        return
    
    templates = [
        {
            'job_role': 'Software Engineer',
            'interview_type': 'behavioral',
            'questions': [
                "Tell me about a time when you had to work with a difficult team member.",
                "Describe a situation where you met a tight deadline.",
                "Can you share an example of when you failed?",
                "Tell me about a time you learned something new quickly.",
            ]
        },
        {
            'job_role': 'Software Engineer',
            'interview_type': 'technical',
            'questions': [
                "What is the difference between SQL and NoSQL?",
                "Explain design patterns you frequently use.",
                "How would you optimize a slow database query?",
                "Describe your approach to writing testable code.",
            ]
        }
    ]
    
    for template_data in templates:
        template = InterviewTemplate(**template_data)
        db.session.add(template)
    
    db.session.commit()
