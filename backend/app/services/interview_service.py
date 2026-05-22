import json
from app.models import InterviewTemplate, db
import random


class InterviewService:
    """Service for interview-related operations"""
    
    # Default questions for different roles
    BEHAVIORAL_QUESTIONS = [
        "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
        "Describe a situation where you had to meet a tight deadline. What was your approach?",
        "Can you share an example of when you failed at something? What did you learn from it?",
        "Tell me about a time when you had to learn a new technology or skill quickly.",
        "Describe a project you're particularly proud of and explain why.",
        "Give an example of when you had to prioritize multiple tasks. How did you decide what to focus on?",
        "Tell me about a time when you disagreed with your manager. How did you handle it?",
        "Describe a situation where you had to communicate a complex idea to a non-technical person.",
        "Tell me about your most significant career achievement.",
        "Describe a time when you had to adapt to unexpected changes.",
        "Tell me about a time you discovered a critical flaw in a project right before launch. How did you manage the fallout?",
        "Describe a situation where you had to lead a cross-functional team through a major conflict of interest.",
        "Tell me about a time you had to push back on an executive or senior leader's decision. What was the outcome?",
        "Give an example of a time when you had to navigate severe ambiguity without clear requirements or leadership direction.",
        "Describe a time you inherited a failing project and successfully turned it around. What was your strategy?"
    ]
    TECHNICAL_QUESTIONS = {
        'Cyber Security': [
            "Explain the difference between symmetric and asymmetric encryption.",
            "Walk me through how you would secure a web application against SQL injection and XSS.",
            "What is the difference between an IDS and an IPS?",
            "Explain the concept of Zero Trust architecture.",
            "How do you handle a suspected security breach or incident?",
            "What is OAuth 2.0 and how does it work?",
            "Describe the common types of DDoS attacks and how to mitigate them.",
            "Explain what a man-in-the-middle (MITM) attack is and how to prevent it.",
            "How would you secure a REST API?",
            "What is a buffer overflow attack and how can it be prevented?"
        ],
        'Software Engineer': [
            "Given an array of integers, write a function to find the longest increasing subsequence in O(N log N) time.",
            "Explain how you would design a scalable URL shortener system like bit.ly. What databases and caching strategies would you use?",
            "Implement a function to serialize and deserialize a binary tree.",
            "Write a program to solve a Sudoku puzzle by filling the empty cells.",
            "Explain the concept of microservices and their advantages, and how you deal with distributed transactions.",
            "Implement a LRU (Least Recently Used) cache with O(1) time complexity.",
            "Find the median of two sorted arrays of different sizes in O(log(min(n, m))) time.",
            "Explain the difference between SQL and NoSQL databases and when you would use each.",
            "Describe how you would debug a production issue involving a memory leak in a highly concurrent system.",
            "Given a string, write a function to find the longest palindromic substring.",
            "Design a distributed rate limiter that can handle 1 million requests per second.",
            "Write an algorithm to implement a Trie (Prefix Tree) with insert, search, and startsWith methods.",
            "Given a directed graph, detect if there is a cycle using DFS. Then write an algorithm to find the topological sort.",
            "Implement the 'Merge k Sorted Lists' algorithm in O(N log k) time complexity.",
            "How would you design a real-time collaborative text editor like Google Docs using Operational Transformation or CRDTs?",
            "Write a function to perform an in-place reversal of nodes in a linked list in k-group.",
            "Explain how Paxos and Raft consensus algorithms work and their role in distributed systems.",
            "Design a distributed message queue like Kafka from scratch. Explain partition replication, consumer groups, and message ordering guarantees.",
            "Given a 2D matrix representing a map of cities and roads with varying travel times, write an algorithm to find the shortest path visiting all cities exactly once (Traveling Salesperson Problem with dynamic programming and bitmasking).",
            "Implement an algorithm for regular expression matching with support for '.' and '*' using dynamic programming."
        ],
        'Data Scientist': [
            "Walk me through your approach to a machine learning problem.",
            "How do you handle missing data in a dataset?",
            "Explain the bias-variance tradeoff.",
            "What validation techniques do you use to evaluate model performance?",
            "How do you prevent overfitting in your models?",
            "Explain the difference between classification and regression problems.",
            "What feature engineering techniques have you used?",
            "How do you handle imbalanced datasets?",
            "Describe your experience with statistical testing.",
            "What tools and libraries do you typically use in your work?"
        ],
        'Product Manager': [
            "Walk me through your approach to product strategy.",
            "How do you prioritize features for development?",
            "Tell me about a product you've worked on and its impact.",
            "How do you measure product success?",
            "Describe your approach to user research.",
            "How do you balance stakeholder needs with user needs?",
            "Tell me about a difficult product decision you made.",
            "How do you approach competitive analysis?",
            "Describe your experience with roadmap planning.",
            "How do you collaborate with engineering teams?"
        ]
    }
    
    @staticmethod
    def get_questions_for_interview(interview_type, job_role, company, num_questions):
        """Get questions for an interview"""
        
        # Try to get from template first
        template = InterviewTemplate.query.filter_by(
            interview_type=interview_type,
            job_role=job_role,
            company=company
        ).first()
        
        if template and template.questions:
            questions = template.questions[:num_questions]
            return questions if len(questions) == num_questions else questions + [
                "What are your salary expectations?",
                "Do you have any questions for us?"
            ]
        
        # Return default questions
        if interview_type == 'behavioral':
            questions = InterviewService.BEHAVIORAL_QUESTIONS.copy()
            random.shuffle(questions)
            return questions[:num_questions]
        else:
            if job_role in InterviewService.TECHNICAL_QUESTIONS:
                technical_q = InterviewService.TECHNICAL_QUESTIONS[job_role].copy()
                random.shuffle(technical_q)
                return technical_q[:num_questions]
            else:
                # To guarantee an instant start (0-delay), bypass the LLM and use the highly advanced FAANG fallbacks.
                technical_q = InterviewService.TECHNICAL_QUESTIONS.get(job_role, InterviewService.TECHNICAL_QUESTIONS['Software Engineer']).copy()
                random.shuffle(technical_q)
                return technical_q[:num_questions]
    
    @staticmethod
    def calculate_interview_score(interview):
        """Calculate overall score for interview"""
        if not interview.questions:
            return 0
        
        total_score = 0
        count = 0
        
        for question in interview.questions:
            if question.confidence_score is not None:
                total_score += question.confidence_score
                count += 1
        
        return round(total_score / count, 1) if count > 0 else 0
    
    @staticmethod
    def generate_interview_feedback(interview):
        """Generate structured feedback for interview"""
        score = InterviewService.calculate_interview_score(interview)
        qa_pairs = []
        for question in interview.questions:
            qa_pairs.append({
                'question': question.question_text,
                'answer': question.answer_text or 'No answer provided'
            })

        try:
            from app.utils.llm_client import llm

            system_prompt = """
You are an elite expert interview coach and hiring manager.
Review the full interview transcript with 100% precision. Analyze the candidate's answers for technical accuracy, communication skills, and completeness.
Generate a structured, highly accurate evaluation that provides actionable feedback.
Return only valid JSON with these exact top-level keys:
- good_points: list of concise, specific strengths demonstrated in the answers
- bad_points: list of specific areas where the candidate lacked knowledge or detail
- improvements: list of highly actionable, step-by-step advice items to improve
"""

            user_prompt = f"""
Score: {score if score is not None else 'N/A'}
Interview type: {interview.interview_type}
Role: {interview.job_role}
Company: {interview.company}
Questions and answers:
{json.dumps(qa_pairs, ensure_ascii=False, indent=2)}
"""

            result = llm.generate_json(system_prompt=system_prompt, user_prompt=user_prompt)
            if isinstance(result, dict):
                good_points = result.get('good_points') or []
                bad_points = result.get('bad_points') or []
                improvements = result.get('improvements') or []

                if isinstance(good_points, list) and isinstance(bad_points, list) and isinstance(improvements, list):
                    return json.dumps({
                        'good_points': good_points,
                        'bad_points': bad_points,
                        'improvements': improvements,
                        'score': score
                    }, ensure_ascii=False)
        except Exception as e:
            print(f"Error generating interview feedback: {e}")

        # Fallback feedback if the LLM fails
        feedback_mapping = {
            (90, 100): "Excellent performance! You demonstrated strong communication and technical knowledge.",
            (80, 90): "Great job! You answered most questions well with good clarity.",
            (70, 80): "Good effort. Consider improving your explanations and providing more specific examples.",
            (60, 70): "Fair performance. Focus on better structuring your answers and adding more detail.",
            (0, 60): "There's room for improvement. Practice articulating your thoughts more clearly.",
        }

        for (min_score, max_score), feedback in feedback_mapping.items():
            if score is not None and min_score <= score < max_score:
                return feedback

        return "Interview completed. Review your answers for areas of improvement."

    @staticmethod
    def analyze_answer(question_text: str, answer_text: str):
        """Analyze a single interview answer using Groq LLM"""
        from app.utils.llm_client import llm
        
        system_prompt = """
        You are an elite, highly rigorous Technical Interview Evaluator.
        Your task is to evaluate an interview answer against a given question with absolute precision.
        
        Evaluation Criteria:
        1. Accuracy & Correctness: Are the technical concepts or situational details factually accurate?
        2. Completeness: Did the candidate fully address all parts of the question?
        3. Clarity & Depth: Is the answer logically structured and sufficiently detailed?
        
        Scoring Rubric:
        - 90-100: Flawless, comprehensive, deeply insightful.
        - 70-89: Good, mostly accurate, minor details missing.
        - 50-69: Fair, partial understanding, lacks depth or has some inaccuracies.
        - 30-49: Poor, major misunderstandings or very brief.
        - 0-29: Completely incorrect or irrelevant.
        
        Provide a strict, unbiased evaluation in this exact JSON structure:
        {
            "confidence_score": <number 0-100>,
            "feedback": "<string: 2-3 sentences of specific, constructive feedback highlighting exactly what was good and what was missing or incorrect>"
        }
        """
        
        user_prompt = f"Question: {question_text}\n\nCandidate's Answer: {answer_text}"
        
        result = llm.generate_json(system_prompt=system_prompt, user_prompt=user_prompt)
        
        if not result:
            return {
                "confidence_score": 50,
                "feedback": "Unable to evaluate answer due to an AI service error."
            }
            
        return result

