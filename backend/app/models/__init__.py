from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and profile management"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    profile_picture = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    interviews = db.relationship('Interview', backref='user', lazy=True, cascade='all, delete-orphan')
    resumes = db.relationship('Resume', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'


class Interview(db.Model):
    """Interview model for storing interview sessions"""
    __tablename__ = 'interviews'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    interview_type = db.Column(db.String(50), nullable=False)  # 'behavioral' or 'technical'
    job_role = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    num_questions = db.Column(db.Integer, default=10)
    score = db.Column(db.Float)
    status = db.Column(db.String(50), default='in_progress')  # 'in_progress', 'completed', 'paused'
    duration_seconds = db.Column(db.Integer, default=0)
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    questions = db.relationship('Question', backref='interview', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Interview {self.id}>'


class Question(db.Model):
    """Question model for interview questions"""
    __tablename__ = 'questions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = db.Column(db.String(36), db.ForeignKey('interviews.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    answer_text = db.Column(db.Text)
    answer_audio_url = db.Column(db.String(255))
    confidence_score = db.Column(db.Float)  # Score of confidence in answer
    time_spent_seconds = db.Column(db.Integer, default=0)
    is_bookmarked = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Question {self.id}>'


class Resume(db.Model):
    """Resume model for storing and analyzing resumes"""
    __tablename__ = 'resumes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    overall_score = db.Column(db.Float)
    ats_score = db.Column(db.Float)
    strengths = db.Column(db.JSON)
    improvements = db.Column(db.JSON)
    skills_detected = db.Column(db.JSON)
    experience_data = db.Column(db.JSON)
    keywords = db.Column(db.JSON)
    is_primary = db.Column(db.Boolean, default=False)
    analysis_status = db.Column(db.String(50), default='pending')  # 'pending', 'completed', 'failed'
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Resume {self.id}>'


class InterviewTemplate(db.Model):
    """Template for predefined interview questions"""
    __tablename__ = 'interview_templates'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_role = db.Column(db.String(100), nullable=False)
    interview_type = db.Column(db.String(50), nullable=False)  # 'behavioral' or 'technical'
    company = db.Column(db.String(100))
    questions = db.Column(db.JSON, nullable=False)  # Array of questions
    difficulty_level = db.Column(db.String(50))  # 'easy', 'medium', 'hard'
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<InterviewTemplate {self.id}>'


class InterviewFeedback(db.Model):
    """Detailed feedback for interview answers"""
    __tablename__ = 'interview_feedback'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = db.Column(db.String(36), db.ForeignKey('questions.id'), nullable=False)
    communication_score = db.Column(db.Float)  # 0-100
    technical_score = db.Column(db.Float)  # 0-100
    relevance_score = db.Column(db.Float)  # 0-100
    feedback_text = db.Column(db.Text)
    suggestions = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<InterviewFeedback {self.id}>'
