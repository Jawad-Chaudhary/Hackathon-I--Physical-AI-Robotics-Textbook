#!/usr/bin/env python3
"""
Agent Skill: Quiz Generator
Reads chapter markdown from stdin, generates 5-question quiz, appends to content.
Constitution Principle II: Reusable Intelligence (CLI tool pattern)
"""

import sys
import json
import os
from pathlib import Path
from openai import OpenAI

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass  # dotenv not installed, rely on system environment variables

def generate_quiz(markdown_content: str) -> str:
    """Generate 5-question quiz for given markdown content"""

    if not markdown_content.strip():
        raise ValueError("Empty input provided")

    client = OpenAI()  # Requires OPENAI_API_KEY env var

    prompt = f"""You are an expert educator creating quiz questions.

Given the following educational content:

{markdown_content}

Generate exactly 5 multiple-choice questions that test understanding of key concepts.

Format each question as:
:::note Question N
What is [question text]?
A) [option]
B) [option]
C) [option]
D) [option]
**Answer**: [correct letter]
:::

Return ONLY the quiz section with heading "## Check Your Understanding" followed by the 5 questions.
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a quiz generation expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    quiz_content = response.choices[0].message.content
    return markdown_content + "\n\n" + quiz_content

def main():
    try:
        # Read markdown from stdin
        markdown_input = sys.stdin.read()

        # Generate quiz
        output = generate_quiz(markdown_input)

        # Write to stdout
        print(output, end='')
        sys.exit(0)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
