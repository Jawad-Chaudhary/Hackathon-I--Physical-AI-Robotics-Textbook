import subprocess
import json

def test_generate_quiz_basic():
    """Test quiz generation with sample chapter content"""
    input_markdown = """
# Newton's Laws
F = ma (Force equals mass times acceleration)
This fundamental equation describes motion.
"""

    result = subprocess.run(
        ["python", "skills/quiz_agent.py"],
        input=input_markdown,
        capture_output=True,
        text=True,
        timeout=10
    )

    assert result.returncode == 0, f"Skill failed: {result.stderr}"
    output = result.stdout

    # Verify quiz section added
    assert "## Check Your Understanding" in output
    assert ":::note Question" in output

    # Count questions (should be 5)
    question_count = output.count(":::note Question")
    assert question_count == 5, f"Expected 5 questions, got {question_count}"

    # Verify original content preserved
    assert "# Newton's Laws" in output
    assert "F = ma" in output

def test_generate_quiz_empty_input():
    """Test error handling for empty input"""
    result = subprocess.run(
        ["python", "skills/quiz_agent.py"],
        input="",
        capture_output=True,
        text=True
    )
    assert result.returncode != 0
    assert "error" in result.stderr.lower()
