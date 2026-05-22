from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import db, Resume, User
from app.services.resume_service import ResumeService
import os

resume_bp = Blueprint('resumes', __name__, url_prefix='/api/resumes')

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}


def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@resume_bp.route('', methods=['GET'])
@jwt_required()
def get_resumes():
    """Get all resumes for current user"""
    user_id = get_jwt_identity()
    
    resumes = Resume.query.filter_by(user_id=user_id).order_by(
        Resume.created_at.desc()
    ).all()
    
    return jsonify({
        'resumes': [{
            'id': r.id,
            'file_name': r.file_name,
            'overall_score': r.overall_score,
            'ats_score': r.ats_score,
            'skills_detected': r.skills_detected,
            'experience_data': r.experience_data,
            'is_primary': r.is_primary,
            'analysis_status': r.analysis_status,
            'created_at': r.created_at.isoformat(),
        } for r in resumes]
    }), 200


@resume_bp.route('/<resume_id>', methods=['GET'])
@jwt_required()
def get_resume(resume_id):
    """Get specific resume with analysis"""
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    return jsonify({
        'resume': {
            'id': resume.id,
            'file_name': resume.file_name,
            'overall_score': resume.overall_score,
            'ats_score': resume.ats_score,
            'strengths': resume.strengths,
            'improvements': resume.improvements,
            'skills_detected': resume.skills_detected,
            'experience_data': resume.experience_data,
            'keywords': resume.keywords,
            'is_primary': resume.is_primary,
            'analysis_status': resume.analysis_status,
            'created_at': resume.created_at.isoformat(),
        }
    }), 200


@resume_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    """Upload and analyze a resume"""
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use PDF, DOC, DOCX, or TXT'}), 400
    
    try:
        # Save file
        filename = secure_filename(file.filename)
        upload_folder = 'uploads'
        os.makedirs(upload_folder, exist_ok=True)
        
        import uuid
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Create resume record
        resume = Resume(
            user_id=user_id,
            file_path=file_path,
            file_name=filename,
            analysis_status='pending'
        )
        
        db.session.add(resume)
        db.session.commit()
        
        # Analyze resume asynchronously (in production, use Celery)
        analysis_result = ResumeService.analyze_resume(file_path)
        
        resume.overall_score = analysis_result['overall_score']
        resume.ats_score = analysis_result['ats_score']
        resume.strengths = analysis_result['strengths']
        resume.improvements = analysis_result['improvements']
        resume.skills_detected = analysis_result['skills_detected']
        resume.experience_data = analysis_result['experience_data']
        resume.keywords = analysis_result['keywords']
        resume.analysis_status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Resume uploaded and analyzed successfully',
            'resume': {
                'id': resume.id,
                'file_name': resume.file_name,
                'overall_score': resume.overall_score,
                'ats_score': resume.ats_score,
                'strengths': resume.strengths,
                'improvements': resume.improvements,
                'skills_detected': resume.skills_detected,
                'analysis_status': resume.analysis_status,
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        # Clean up file if database operation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/<resume_id>', methods=['PUT'])
@jwt_required()
def update_resume(resume_id):
    """Update resume settings"""
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    data = request.get_json()
    
    # If setting as primary, unset other primary resumes
    if data.get('is_primary'):
        Resume.query.filter_by(user_id=user_id, is_primary=True).update({'is_primary': False})
        resume.is_primary = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Resume updated successfully',
        'resume': {
            'id': resume.id,
            'file_name': resume.file_name,
            'is_primary': resume.is_primary,
        }
    }), 200


@resume_bp.route('/<resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    """Delete a resume"""
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    db.session.delete(resume)
    db.session.commit()
    
    return jsonify({'message': 'Resume deleted successfully'}), 200


@resume_bp.route('/all', methods=['DELETE'])
@jwt_required()
def delete_all_resumes():
    """Delete all resumes for current user"""
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).all()
    
    for resume in resumes:
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        db.session.delete(resume)
        
    db.session.commit()
    
    return jsonify({'message': 'All resumes deleted successfully'}), 200
