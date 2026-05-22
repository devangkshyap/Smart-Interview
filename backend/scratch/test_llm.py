from app import create_app
from app.utils.llm_client import llm
from app.services.interview_service import InterviewService

app = create_app()
with app.app_context():
    res = llm.generate_json(
        system_prompt='Return {"status": "ok", "count": 5} and only JSON.',
        user_prompt='Hello'
    )
    print('LLM Response JSON:', res)
    
    ans_res = InterviewService.analyze_answer(
        question_text='What is a microservice?',
        answer_text='It is a small service that does one thing.'
    )
    print('Interview Analyze Response:', ans_res)
