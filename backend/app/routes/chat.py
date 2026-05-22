from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.llm_client import gemini_llm

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@bp.route('/', methods=['POST'])
@jwt_required()
def chat():
    """Handle chat messages from the frontend chatbot"""
    try:
        user_id = get_jwt_identity()
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        system_prompt = """
        You are the official AI assistant for the 'Smart Interview' platform. 
        You must answer user questions with 100% accuracy based ONLY on the following platform rules and features:
        
        PLATFORM RULES & FEATURES:
        1. Anti-Cheat System: Users CANNOT use multiple screens, switch tabs, or minimize the browser during an interview. If they do, the interview will immediately pause and issue an anti-cheat warning.
        2. Screen Sharing: Mandatory for all interviews. The interview will not start or continue without active screen sharing.
        3. Answering Modes: Users can answer questions using Voice Dictation (speech-to-text) or by typing in the text box. Both methods are evaluated equally.
        4. Real-time AI Voice: The platform uses AI text-to-speech to read questions out loud once the interview starts.
        5. Evaluation: Answers are rigorously evaluated by AI based on accuracy, completeness, and clarity. The final score is an average of all question scores.
        6. Resume Analysis: The platform analyzes resumes against job descriptions to provide an ATS score and identify missing keywords.
        
        If a user asks about something against these rules (like using multiple screens, cheating, or bypassing screen share), firmly inform them that it is strictly prohibited and explain the platform's anti-cheat mechanics. 
        Be concise, supportive, and professional.
        """

        # Call Gemini for plain text response
        ai_response = gemini_llm.generate_text(system_prompt=system_prompt, user_prompt=user_message)
        
        if not ai_response:
            return jsonify({'error': 'Failed to generate response'}), 500

        return jsonify({
            'message': ai_response
        }), 200

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500
