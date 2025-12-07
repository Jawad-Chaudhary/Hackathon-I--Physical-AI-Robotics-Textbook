#!/usr/bin/env python3
"""
Agent Skill: Urdu Translator
Translates HTML content to Urdu while preserving tags, code blocks, etc.
Uses Google Gemini for fast responses.
"""

import sys
import re
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

def extract_preserve_blocks(html: str) -> tuple[str, dict]:
    """Extract code blocks and pre tags that should not be translated"""
    placeholders = {}
    counter = 0

    def replace_code(match):
        nonlocal counter
        placeholder = f"___CODE_BLOCK_{counter}___"
        placeholders[placeholder] = match.group(0)
        counter += 1
        return placeholder

    text = re.sub(r'<pre[^>]*>.*?</pre>', replace_code, html, flags=re.DOTALL)
    text = re.sub(r'<code[^>]*>.*?</code>', replace_code, text, flags=re.DOTALL)

    return text, placeholders

def restore_preserved_blocks(text: str, placeholders: dict) -> str:
    """Restore code blocks"""
    for placeholder, original in placeholders.items():
        text = text.replace(placeholder, original)
    return text

def translate_to_urdu(html_content: str) -> str:
    """Translate HTML content to Urdu, preserving technical elements"""

    if not html_content.strip():
        raise ValueError("Empty input provided")

    # Preserve code blocks
    text_to_translate, placeholders = extract_preserve_blocks(html_content)

    prompt = f"""Translate the following educational HTML content to Urdu.

CRITICAL RULES:
1. Translate ONLY the text content inside HTML tags (between > and <)
2. Keep ALL HTML tags exactly as they are (<h1>, <p>, <div>, <span>, etc.)
3. Keep all placeholders (___CODE_BLOCK_N___) EXACTLY as they are - do not translate them
4. Keep all HTML attributes unchanged (class="", id="", etc.)
5. Preserve the exact HTML structure - do not add or remove any tags
6. Do NOT wrap output in markdown code blocks - return raw HTML only
7. Do NOT add any prefix text - start directly with the HTML

HTML content to translate:
{text_to_translate}

Return ONLY the translated HTML. Start directly with the first HTML tag.
"""

    # Use Gemini 1.5 Flash (often has higher rate limits)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)

    translated = response.text

    # Strip any markdown code block wrappers if added
    if translated.startswith("```html"):
        translated = translated[7:]
    if translated.startswith("```"):
        translated = translated[3:]
    if translated.endswith("```"):
        translated = translated[:-3]

    # Restore preserved blocks
    final_output = restore_preserved_blocks(translated.strip(), placeholders)

    return final_output

def main():
    try:
        html_input = sys.stdin.read()
        output = translate_to_urdu(html_input)
        print(output, end='')
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
