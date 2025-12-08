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

YOU MUST MAKE THE FOLLOWING VISIBLE CHANGES:

1. ADD A PERSONALIZATION NOTE at the very beginning of the content as the first element:
   <div style="background-color: #e7f3ff; border-left: 4px solid #0d6efd; padding: 12px; margin-bottom: 16px; border-radius: 4px;">
   <strong>🎯 Personalized for You:</strong> This content has been adapted for someone who is {bg_str}. Look for Python examples and tips throughout!
   </div>

2. For EACH major concept, ADD a Python-specific tip or analogy in a highlighted box:
   <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 10px 0; border-radius: 4px;">
   <strong>🐍 Python Tip:</strong> [Your Python-specific insight here]
   </div>

3. ADD at least 3-5 Python analogies throughout the text, like:
   - "Think of ROS nodes like Python classes with methods"
   - "Similar to how asyncio handles async/await"
   - "Like a Python generator yielding values"

4. KEEP all HTML tags intact (<h1>, <h2>, <p>, <code>, <pre>, etc.)

5. Do NOT wrap output in markdown code blocks - return raw HTML only

Original HTML content:
{html_content}

Return the MODIFIED HTML with visible personalization. Start with the personalization note div.
"""

    # Use Gemini Pro (always available)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print(f"[PERSONALIZE_AGENT] Calling Gemini with {len(html_content)} chars input")
    print(f"[PERSONALIZE_AGENT] Profile: {profile}")
    print(f"[PERSONALIZE_AGENT] bg_str: {bg_str}")
    
    response = model.generate_content(prompt)

    personalized = response.text
    
    print(f"[PERSONALIZE_AGENT] Gemini returned {len(personalized)} chars")
    print(f"[PERSONALIZE_AGENT] First 200 chars: {personalized[:200]}")

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
