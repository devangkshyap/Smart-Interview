import re
import json
from PyPDF2 import PdfReader


class ResumeService:
    """Service for resume analysis"""
    
    # Common technical skills
    TECHNICAL_SKILLS = {
        'languages': ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'SQL'],
        'frameworks': ['React', 'Angular', 'Vue.js', 'Django', 'Flask', 'Spring', 'Express', 'FastAPI', 'Rails'],
        'tools': ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'GitHub', 'GitLab'],
        'databases': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra']
    }
    
    SOFT_SKILLS = [
        'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
        'Project Management', 'Analytical', 'Creative', 'Attention to Detail',
        'Time Management', 'Adaptability'
    ]
    
    IMPORTANT_KEYWORDS = [
        'Agile', 'Scrum', 'CI/CD', 'Microservices', 'API Design', 'Full-stack',
        'Data Analysis', 'Machine Learning', 'Cloud', 'DevOps', 'Testing'
    ]
    
    @staticmethod
    def extract_text_from_pdf(file_path):
        """Extract text from PDF resume"""
        try:
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                text = ''
                for page in reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"Failed to read PDF: {str(e)}")
    
    @staticmethod
    def analyze_resume(file_path):
        """Analyze resume and return metrics using Groq LLM"""
        # Extract text
        text = ResumeService.extract_text_from_pdf(file_path)
        
        # Limit text length to avoid token limits just in case
        if len(text) > 20000:
            text = text[:20000]

        from app.utils.llm_client import llm
        import json

        system_prompt = """
        You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
        Analyze the following resume text and extract the details requested in JSON format.
        CRITICAL INSTRUCTION: Be extremely rigorous and realistic with the 'overall_score' and 'ats_score'.
        Most resumes should score between 40-75. Do NOT give scores above 85 unless the resume is truly flawless, perfectly formatted, and highly impactful with quantifiable metrics.
        Identify genuine missing keywords and substantial areas for improvement. Do not sugarcoat the feedback.
        You must ONLY output valid JSON and nothing else.

        Required JSON structure:
        {
            "overall_score": <number 0-100 based on quality, impact, format, strict evaluation>,
            "ats_score": <number 0-100 based on parsability, keywords, structure, strict evaluation>,
            "strengths": [<string array of 3-5 key strengths of this candidate>],
            "improvements": [<string array of 3-5 critical areas of improvement>],
            "skills_detected": {
                "technical": [<string array of technical tools/languages>],
                "soft": [<string array of soft skills>],
                "total_detected": <number total count of all skills>,
                "total_matched": <number total count of skills relevant to tech industry>
            },
            "experience_data": {
                "total_years": <number total years of experience, estimate based on dates>,
                "positions": <number of distinct roles held>,
                "companies": [<string array of company names worked for>]
            },
            "keywords": {
                "found": [<string array of major industry keywords found>],
                "missing": [<string array of common industry keywords missing>],
                "total_found": <count of found>,
                "total_missing": <count of missing>
            }
        }
        """

        # Call Gemini API
        result = llm.generate_json(system_prompt=system_prompt, user_prompt=f"Resume Text:\n{text}")

        # Fallback in case of API failure
        if not result:
            return {
                'overall_score': 50,
                'ats_score': 50,
                'strengths': ['Failed to parse resume via AI. Resume content received.'],
                'improvements': ['Please try again later or contact support.'],
                'skills_detected': {'technical': [], 'soft': [], 'total_detected': 0, 'total_matched': 0},
                'experience_data': {'total_years': 0, 'positions': 0, 'companies': []},
                'keywords': {'found': [], 'missing': [], 'total_found': 0, 'total_missing': 0}
            }

        return result

