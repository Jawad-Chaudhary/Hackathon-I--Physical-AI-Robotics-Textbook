import subprocess
import json

def test_personalize_with_python_profile():
    """Test personalization for user with Python background"""
    input_data = {
        "content": """
# ROS 2 Nodes
A node is a process that performs computation.
""",
        "profile": {
            "python_knowledge": True,
            "has_nvidia_gpu": False,
            "experience_level": "intermediate"
        }
    }

    result = subprocess.run(
        ["python", "skills/personalize_agent.py"],
        input=json.dumps(input_data),
        capture_output=True,
        text=True,
        timeout=15
    )

    assert result.returncode == 0
    output = result.stdout

    # Should contain Python-specific analogies
    assert "python" in output.lower() or "generator" in output.lower()

    # Original structure preserved
    assert "# ROS 2 Nodes" in output

def test_personalize_with_cpp_profile():
    """Test personalization adapts to C++ background"""
    input_data = {
        "content": "# ROS 2 Nodes\nA node performs computation.",
        "profile": {
            "python_knowledge": False,
            "has_nvidia_gpu": True,
            "experience_level": "advanced"
        }
    }

    result = subprocess.run(
        ["python", "skills/personalize_agent.py"],
        input=json.dumps(input_data),
        capture_output=True,
        text=True
    )

    assert result.returncode == 0
    output = result.stdout

    # Should NOT contain Python analogies
    assert "python" not in output.lower()
