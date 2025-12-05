"""
Skill Runner Service
Invokes agent skills via subprocess (Constitution Principle II)
"""

import subprocess
import json
import os
from pathlib import Path
from typing import Dict

class SkillRunner:
    """Service for invoking agent skills via subprocess"""

    SKILL_TIMEOUT = 120  # seconds - increased for large content
    MAX_CONTENT_LENGTH = 4000  # Truncate content to avoid timeout

    # Get the project root (parent of backend directory)
    PROJECT_ROOT = Path(__file__).parent.parent.parent
    SKILLS_DIR = PROJECT_ROOT / "skills"

    @staticmethod
    def truncate_content(content: str, max_length: int = None) -> str:
        """Truncate content to avoid API timeout"""
        max_len = max_length or SkillRunner.MAX_CONTENT_LENGTH
        if len(content) > max_len:
            # Find a good break point (end of paragraph)
            truncated = content[:max_len]
            last_p = truncated.rfind('</p>')
            if last_p > max_len * 0.5:  # If we find a paragraph end in second half
                truncated = truncated[:last_p + 4]
            print(f"[SkillRunner] Truncated content from {len(content)} to {len(truncated)} chars")
            return truncated
        return content

    @staticmethod
    def run_quiz_generator(markdown: str) -> str:
        """Generate quiz for chapter markdown"""
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        
        skill_path = str(SkillRunner.SKILLS_DIR / "quiz_agent.py")
        result = subprocess.run(
            ["python", skill_path],
            input=markdown,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env,
            timeout=SkillRunner.SKILL_TIMEOUT,
            cwd=str(SkillRunner.PROJECT_ROOT)
        )

        if result.returncode != 0:
            raise RuntimeError(f"Quiz generation failed: {result.stderr}")

        return result.stdout

    @staticmethod
    def run_translator(content: str) -> str:
        """Translate content to Urdu"""
        # Truncate to avoid timeout
        content = SkillRunner.truncate_content(content)
        
        # Set UTF-8 encoding for subprocess (Windows compatibility)
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'

        skill_path = str(SkillRunner.SKILLS_DIR / "translator_agent.py")
        result = subprocess.run(
            ["python", skill_path],
            input=content,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env,
            timeout=SkillRunner.SKILL_TIMEOUT,
            cwd=str(SkillRunner.PROJECT_ROOT)
        )

        if result.returncode != 0:
            raise RuntimeError(f"Translation failed: {result.stderr}")

        return result.stdout

    @staticmethod
    def run_personalizer(content: str, profile: Dict) -> str:
        """Personalize content based on user profile"""
        # Truncate to avoid timeout
        content = SkillRunner.truncate_content(content)

        input_data = json.dumps({"content": content, "profile": profile})

        # Set UTF-8 encoding for subprocess (Windows compatibility)
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'

        skill_path = str(SkillRunner.SKILLS_DIR / "personalize_agent.py")
        result = subprocess.run(
            ["python", skill_path],
            input=input_data,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env,
            timeout=SkillRunner.SKILL_TIMEOUT,
            cwd=str(SkillRunner.PROJECT_ROOT)
        )

        if result.returncode != 0:
            raise RuntimeError(f"Personalization failed: {result.stderr}")

        return result.stdout
