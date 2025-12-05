"""
Skill Runner Service
Invokes agent skills via subprocess (Constitution Principle II)
"""

import subprocess
import json
import os
import sys
from pathlib import Path
from typing import Dict

class SkillRunner:
    """Service for invoking agent skills via subprocess"""

    SKILL_TIMEOUT = 120  # seconds - increased for large content
    MAX_CONTENT_LENGTH = 4000  # Truncate content to avoid timeout

    # Robust path resolution using __file__ (works locally and on Railway)
    # skill_runner.py is at: backend/services/skill_runner.py
    # skills are now at: backend/skills/
    BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/
    SKILLS_DIR = BACKEND_DIR / "skills"

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
    def _get_env():
        """Get environment with UTF-8 encoding for subprocess"""
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        return env

    @staticmethod
    def _run_skill(script_name: str, input_data: str) -> str:
        """Run a skill script and return output"""
        skill_path = SkillRunner.SKILLS_DIR / script_name

        if not skill_path.exists():
            raise FileNotFoundError(f"Skill not found: {skill_path}")

        result = subprocess.run(
            [sys.executable, str(skill_path)],
            input=input_data,
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=SkillRunner._get_env(),
            timeout=SkillRunner.SKILL_TIMEOUT,
            cwd=str(SkillRunner.BACKEND_DIR)
        )

        if result.returncode != 0:
            raise RuntimeError(f"{script_name} failed: {result.stderr}")

        return result.stdout

    @staticmethod
    def run_quiz_generator(markdown: str) -> str:
        """Generate quiz for chapter markdown"""
        return SkillRunner._run_skill("quiz_agent.py", markdown)

    @staticmethod
    def run_translator(content: str) -> str:
        """Translate content to Urdu"""
        content = SkillRunner.truncate_content(content)
        return SkillRunner._run_skill("translator_agent.py", content)

    @staticmethod
    def run_personalizer(content: str, profile: Dict) -> str:
        """Personalize content based on user profile"""
        content = SkillRunner.truncate_content(content)
        input_data = json.dumps({"content": content, "profile": profile})
        return SkillRunner._run_skill("personalize_agent.py", input_data)
