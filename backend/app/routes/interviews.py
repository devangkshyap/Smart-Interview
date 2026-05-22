from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Interview, Question, InterviewTemplate
from app.services.interview_service import InterviewService
from datetime import datetime
import uuid
import threading
from flask import current_app

interview_bp = Blueprint('interviews', __name__, url_prefix='/api/interviews')


@interview_bp.route('', methods=['GET'])
@jwt_required()
def get_interviews():
    """Get all interviews for current user"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    interviews = Interview.query.filter_by(user_id=user_id).order_by(
        Interview.created_at.desc()
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'interviews': [{
            'id': i.id,
            'interview_type': i.interview_type,
            'job_role': i.job_role,
            'company': i.company,
            'score': i.score,
            'status': i.status,
            'duration_seconds': i.duration_seconds,
            'created_at': i.created_at.isoformat(),
        } for i in interviews.items],
        'total': interviews.total,
        'pages': interviews.pages,
        'current_page': page
    }), 200


@interview_bp.route('/<interview_id>', methods=['GET'])
@jwt_required()
def get_interview(interview_id):
    """Get specific interview details"""
    user_id = get_jwt_identity()
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    return jsonify({
        'interview': {
            'id': interview.id,
            'interview_type': interview.interview_type,
            'job_role': interview.job_role,
            'company': interview.company,
            'num_questions': interview.num_questions,
            'score': interview.score,
            'status': interview.status,
            'duration_seconds': interview.duration_seconds,
            'feedback': interview.feedback,
            'created_at': interview.created_at.isoformat(),
            'questions': [{
                'id': q.id,
                'question_number': q.question_number,
                'question_text': q.question_text,
                'answer_text': q.answer_text,
                'confidence_score': q.confidence_score,
                'time_spent_seconds': q.time_spent_seconds,
                'is_bookmarked': q.is_bookmarked,
                'notes': q.notes,
            } for q in interview.questions]
        }
    }), 200


@interview_bp.route('', methods=['POST'])
@jwt_required()
def create_interview():
    """Create a new interview"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation
    required_fields = ['interview_type', 'job_role', 'company']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if data['interview_type'] not in ['behavioral', 'technical']:
        return jsonify({'error': 'Invalid interview type'}), 400
    
    try:
        # Create interview
        interview = Interview(
            user_id=user_id,
            interview_type=data['interview_type'],
            job_role=data['job_role'],
            company=data['company'],
            num_questions=data.get('num_questions', 10)
        )
        
        db.session.add(interview)
        db.session.flush()
        
        # Get questions from template or generate new ones
        questions = InterviewService.get_questions_for_interview(
            interview_type=data['interview_type'],
            job_role=data['job_role'],
            company=data['company'],
            num_questions=interview.num_questions
        )
        
        # Add questions to interview
        for idx, question_text in enumerate(questions, 1):
            question = Question(
                interview_id=interview.id,
                question_text=question_text,
                question_number=idx
            )
            db.session.add(question)
        
        # Update num_questions to match the actual number of generated questions
        interview.num_questions = len(questions)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Interview created successfully',
            'interview': {
                'id': interview.id,
                'interview_type': interview.interview_type,
                'job_role': interview.job_role,
                'company': interview.company,
                'num_questions': interview.num_questions,
                'questions': [{
                    'id': q.id,
                    'question_number': q.question_number,
                    'question_text': q.question_text,
                } for q in interview.questions]
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@interview_bp.route('/<interview_id>/questions/<question_id>', methods=['PUT'])
@jwt_required()
def update_question(interview_id, question_id):
    """Update question answer and metadata"""
    user_id = get_jwt_identity()
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    question = Question.query.filter_by(id=question_id, interview_id=interview_id).first()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    data = request.get_json()
    
    answer_text = data.get('answer_text')
    
    if answer_text and answer_text != question.answer_text:
        # User submitted a new answer! Evaluate it with AI
        from app.services.interview_service import InterviewService
        analysis = InterviewService.analyze_answer(question.question_text, answer_text)
        
        question.answer_text = answer_text
        question.confidence_score = analysis.get('confidence_score', 0)
        
        # We append the AI feedback to any existing notes or create new ones
        existing_notes = question.notes or ""
        ai_feedback = f"AI Evaluation: {analysis.get('feedback', '')}"
        question.notes = f"{existing_notes}\n\n{ai_feedback}".strip()
    else:
        # Fallback to standard update for non-answer metadata
        question.confidence_score = data.get('confidence_score', question.confidence_score)
        question.notes = data.get('notes', question.notes)

    question.time_spent_seconds = data.get('time_spent_seconds', question.time_spent_seconds)
    question.is_bookmarked = data.get('is_bookmarked', question.is_bookmarked)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Question updated successfully',
        'question': {
            'id': question.id,
            'question_number': question.question_number,
            'question_text': question.question_text,
            'answer_text': question.answer_text,
            'confidence_score': question.confidence_score,
            'time_spent_seconds': question.time_spent_seconds,
            'is_bookmarked': question.is_bookmarked,
            'notes': question.notes,
        }
    }), 200


@interview_bp.route('/<interview_id>', methods=['PUT'])
@jwt_required()
def update_interview(interview_id):
    """Update interview status and score"""
    user_id = get_jwt_identity()
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    data = request.get_json()
    
    new_status = data.get('status', interview.status)
    interview.status = new_status
    interview.duration_seconds = data.get('duration_seconds', interview.duration_seconds)

    if 'score' in data:
        interview.score = data.get('score')
    else:
        interview.score = InterviewService.calculate_interview_score(interview)

    if new_status == 'completed':
        if data.get('feedback'):
            interview.feedback = data.get('feedback')
        elif not interview.feedback or interview.feedback.strip() == '':
            # Run feedback generation in background so the UI doesn't block for 15+ seconds
            def generate_feedback_async(app, i_id):
                with app.app_context():
                    i = Interview.query.get(i_id)
                    if i:
                        i.feedback = InterviewService.generate_interview_feedback(i)
                        db.session.commit()
            
            thread = threading.Thread(target=generate_feedback_async, args=(current_app._get_current_object(), interview.id))
            thread.start()
            interview.feedback = "Generating detailed AI feedback... Please refresh in a moment."
    else:
        interview.feedback = data.get('feedback', interview.feedback)

    db.session.commit()
    
    return jsonify({
        'message': 'Interview updated successfully',
        'interview': {
            'id': interview.id,
            'status': interview.status,
            'score': interview.score,
            'duration_seconds': interview.duration_seconds,
        }
    }), 200


@interview_bp.route('/<interview_id>', methods=['DELETE'])
@jwt_required()
def delete_interview(interview_id):
    """Delete an interview"""
    user_id = get_jwt_identity()
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    
    db.session.delete(interview)
    db.session.commit()
    
    return jsonify({'message': 'Interview deleted successfully'}), 200


@interview_bp.route('/all', methods=['DELETE'])
@jwt_required()
def delete_all_interviews():
    """Delete all interviews for current user"""
    user_id = get_jwt_identity()
    interviews = Interview.query.filter_by(user_id=user_id).all()
    
    for interview in interviews:
        db.session.delete(interview)
        
    db.session.commit()
    
    return jsonify({'message': 'All interviews deleted successfully'}), 200


@interview_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get interview templates"""
    job_role = request.args.get('job_role')
    interview_type = request.args.get('interview_type')
    
    query = InterviewTemplate.query
    
    if job_role:
        query = query.filter_by(job_role=job_role)
    if interview_type:
        query = query.filter_by(interview_type=interview_type)
    
    templates = query.all()
    
    return jsonify({
        'templates': [{
            'id': t.id,
            'job_role': t.job_role,
            'interview_type': t.interview_type,
            'company': t.company,
            'difficulty_level': t.difficulty_level,
            'num_questions': len(t.questions) if t.questions else 0,
        } for t in templates]
    }), 200
