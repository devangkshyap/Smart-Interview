import os
import json
from groq import Groq
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GroqClient:
    """Wrapper for the Groq API"""
    
    def __init__(self):
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        self.model_name = "llama-3.3-70b-versatile"

    def generate_json(self, system_prompt: str, user_prompt: str):
        """
        Generate a JSON response from the LLM.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return None

    def generate_text(self, system_prompt: str, user_prompt: str):
        """
        Generate a plain text response.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return None

class GeminiClient:
    """Wrapper for the Gemini API"""
    
    def __init__(self):
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

    def generate_text(self, system_prompt: str, user_prompt: str):
        """
        Generate a plain text response.
        """
        try:
            model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_prompt)
            response = model.generate_content(user_prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return None

llm = GroqClient()
gemini_llm = GeminiClient()
