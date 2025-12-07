"""
Skill Runner Service
Invokes agent skills via subprocess (Constitution Principle II)
Now with smart section-based chunking for full content processing
"""

import subprocess
import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Callable

class SkillRunner:
    """Service for invoking agent skills via subprocess"""

    SKILL_TIMEOUT = 120  # seconds per section
    MAX_SECTION_LENGTH = 6000  # Max chars per section (safety limit)
    MIN_SECTION_LENGTH = 100   # Minimum section length to process

    # Robust path resolution using __file__ (works locally and on Railway)
    BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/
    SKILLS_DIR = BACKEND_DIR / "skills"

    @staticmethod
    def split_by_headers(html_content: str) -> List[str]:
        """
        Split HTML content at header boundaries (h1, h2, h3).
        Each section includes its header tag through to the next header.
        """
        if not html_content or len(html_content) < SkillRunner.MIN_SECTION_LENGTH:
            return [html_content] if html_content else []

        # Regex to find header tags (h1, h2, h3)
        # This splits while keeping the delimiter (header tag) with the following content
        header_pattern = r'(?=<h[123][^>]*>)'
        
        sections = re.split(header_pattern, html_content)
        
        # Filter out empty sections and very small ones
        sections = [s.strip() for s in sections if s.strip() and len(s.strip()) > 10]
        
        if not sections:
            return [html_content]
        
        print(f"[SkillRunner] Split content into {len(sections)} sections")
        for i, section in enumerate(sections):
            print(f"[SkillRunner] Section {i+1}: {len(section)} chars")
        
        return sections

    @staticmethod
    def merge_small_sections(sections: List[str], max_length: int = None) -> List[str]:
        """
        Merge consecutive small sections to reduce API calls.
        """
        max_len = max_length or SkillRunner.MAX_SECTION_LENGTH
        merged = []
        current = ""
        
        for section in sections:
            if len(current) + len(section) < max_len:
                current += section
            else:
                if current:
                    merged.append(current)
                current = section
        
        if current:
            merged.append(current)
        
        print(f"[SkillRunner] Merged into {len(merged)} chunks for processing")
        return merged

    @staticmethod
    def truncate_section(content: str, max_length: int = None) -> str:
        """Truncate a single section if it exceeds max length (safety)"""
        max_len = max_length or SkillRunner.MAX_SECTION_LENGTH
        if len(content) > max_len:
            # Find a good break point (end of paragraph)
            truncated = content[:max_len]
            last_p = truncated.rfind('</p>')
            if last_p > max_len * 0.5:
                truncated = truncated[:last_p + 4]
            print(f"[SkillRunner] Truncated section from {len(content)} to {len(truncated)} chars")
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
        """
        Translate content to Urdu using section-based processing.
        Processes full content by splitting at header boundaries.
        """
        # Split content into sections
        sections = SkillRunner.split_by_headers(content)
        
        # Merge small sections to optimize API calls
        chunks = SkillRunner.merge_small_sections(sections)
        
        print(f"[TRANSLATOR] Processing {len(chunks)} chunks")
        
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            print(f"[TRANSLATOR] Processing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
            
            # Safety truncate if chunk is still too large
            chunk = SkillRunner.truncate_section(chunk)
            
            try:
                result = SkillRunner._run_skill("translator_agent.py", chunk)
                processed_chunks.append(result)
                print(f"[TRANSLATOR] Chunk {i+1} done: {len(result)} chars output")
            except Exception as e:
                print(f"[TRANSLATOR] Chunk {i+1} failed: {e}, using original")
                processed_chunks.append(chunk)  # Fallback to original on error
        
        # Reassemble all chunks
        final_output = ''.join(processed_chunks)
        print(f"[TRANSLATOR] Total output: {len(final_output)} chars")
        
        return final_output

    @staticmethod
    def run_personalizer(content: str, profile: Dict) -> str:
        """
        Personalize content using section-based processing.
        Processes full content by splitting at header boundaries.
        """
        # Split content into sections
        sections = SkillRunner.split_by_headers(content)
        
        # Merge small sections to optimize API calls
        chunks = SkillRunner.merge_small_sections(sections)
        
        print(f"[PERSONALIZER] Processing {len(chunks)} chunks with profile: {profile}")
        
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            print(f"[PERSONALIZER] Processing chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
            
            # Safety truncate if chunk is still too large
            chunk = SkillRunner.truncate_section(chunk)
            
            try:
                input_data = json.dumps({"content": chunk, "profile": profile})
                result = SkillRunner._run_skill("personalize_agent.py", input_data)
                processed_chunks.append(result)
                print(f"[PERSONALIZER] Chunk {i+1} done: {len(result)} chars output")
            except Exception as e:
                print(f"[PERSONALIZER] Chunk {i+1} failed: {e}, using original")
                processed_chunks.append(chunk)  # Fallback to original on error
        
        # Reassemble all chunks
        final_output = ''.join(processed_chunks)
        print(f"[PERSONALIZER] Total output: {len(final_output)} chars")
        
        return final_output

