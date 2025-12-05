import subprocess

def test_translate_urdu_preserves_latex():
    """Test that LaTeX equations remain unchanged"""
    input_markdown = """
# Forward Kinematics
The transformation matrix is $\\mathbf{T} = \\prod_{i=1}^{n} A_i(\\theta_i)$
"""

    result = subprocess.run(
        ["python", "skills/translator_agent.py"],
        input=input_markdown,
        capture_output=True,
        text=True,
        timeout=10
    )

    assert result.returncode == 0
    output = result.stdout

    # LaTeX must be preserved exactly
    assert "$\\mathbf{T} = \\prod_{i=1}^{n} A_i(\\theta_i)$" in output

    # Heading text should be translated (approximate check)
    assert "Forward Kinematics" not in output  # Original English removed

def test_translate_urdu_preserves_code_blocks():
    """Test that code blocks remain in English"""
    input_markdown = """
```python
import rclpy
node = rclpy.create_node('test')
```
"""
    result = subprocess.run(
        ["python", "skills/translator_agent.py"],
        input=input_markdown,
        capture_output=True,
        text=True
    )

    assert result.returncode == 0
    output = result.stdout

    # Code block must be unchanged
    assert "import rclpy" in output
    assert "node = rclpy.create_node('test')" in output
