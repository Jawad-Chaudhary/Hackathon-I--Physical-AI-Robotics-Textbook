#!/usr/bin/env python3
"""
Agent Skill: Content Personalizer
Rewrites content based on user profile (Python/C++ knowledge, GPU availability).
Uses Google Gemini for fast responses.
"""

import sys
import json
import os
import io
from pathlib import Path

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def personalize_content(html_content: str, profile: dict) -> str:
    """Rewrite HTML content tailored to user's technical background"""

    if not html_content.strip():
        raise ValueError("Empty content")
    if not profile:
        raise ValueError("Empty profile")

    # Build profile description
    bg_desc = []
    if profile.get("python_knowledge"):
        bg_desc.append("proficient in Python")
    if profile.get("has_nvidia_gpu"):
        bg_desc.append("has access to NVIDIA GPU hardware")

    experience = profile.get("experience_level", "intermediate")
    bg_str = ", ".join(bg_desc) if bg_desc else "no specific programming background"

    prompt = f"""You are rewriting educational robotics content for a student who is {bg_str} with {experience} experience level.

CRITICAL INSTRUCTIONS:
1. The input is HTML content. You MUST return valid HTML with the EXACT same tag structure.
2. Preserve ALL HTML tags exactly as they appear (<h1>, <h2>, <p>, <pre>, <code>, <ul>, <li>, etc.)
3. MAKE VISIBLE CHANGES to adapt content to the student's background:
   - If student knows Python: ADD specific Python examples like "Think of ROS nodes like Python coroutines" or "Similar to how asyncio handles events"
   - If student has GPU: ADD sentences about GPU acceleration like "With your NVIDIA GPU, you can accelerate this with CUDA"
   - If beginner: ADD foundational explanations like "In other words, ..." or "Simply put, ..."
   - If advanced: REMOVE basic explanations and ADD advanced tips
4. The changes MUST be noticeable - add at least 1-2 new sentences per paragraph that relate to the user's background
5. Do NOT wrap output in markdown code blocks - return raw HTML only
6. Do NOT add any prefix text - start directly with the HTML

Original HTML content:
{html_content}

Return ONLY the modified HTML content with VISIBLE personalized changes. Start directly with the first HTML tag.
"""

    # Use Gemini 1.5 Flash (often has higher rate limits than 2.5)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)

    personalized = response.text

    # Strip any markdown code block wrappers if added
    if personalized.startswith("```html"):
        personalized = personalized[7:]
    if personalized.startswith("```"):
        personalized = personalized[3:]
    if personalized.endswith("```"):
        personalized = personalized[:-3]

    return personalized.strip()

def main():
    try:
        # Read JSON input from stdin
        input_json = sys.stdin.read()
        data = json.loads(input_json)

        content = data.get("content", "")
        profile = data.get("profile", {})

        output = personalize_content(content, profile)
        print(output, end='')
        sys.exit(0)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input - {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
