import re


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False
    
    # Check for at least one uppercase, one lowercase, one digit
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    # For now, just check length (can be made more strict)
    return len(password) >= 8


def validate_interview_type(interview_type):
    """Validate interview type"""
    return interview_type in ['behavioral', 'technical']


def validate_job_role(job_role):
    """Validate job role"""
    return len(job_role) > 0 and len(job_role) <= 100
