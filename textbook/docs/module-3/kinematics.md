---
sidebar_position: 2
---

# Robot Kinematics

Understanding how robots move through space using forward and inverse kinematics.

## What is Kinematics?

Kinematics is the study of motion without considering the forces that cause it. For robots, kinematics helps us:

- **Forward Kinematics**: Given joint angles, find the end-effector position
- **Inverse Kinematics**: Given a desired position, find the required joint angles

## Coordinate Frames and Transformations

Robots use multiple coordinate frames. Transformations between frames use homogeneous transformation matrices.

### Homogeneous Transformation Matrix

A 4x4 matrix combining rotation and translation:

```
T = | R   p |
    | 0   1 |

Where:
- R is a 3x3 rotation matrix
- p is a 3x1 translation vector
```

### Example: 2D Transformation

```python
import numpy as np

def transform_2d(theta, tx, ty):
    """Create 2D homogeneous transformation matrix"""
    cos_t = np.cos(theta)
    sin_t = np.sin(theta)

    return np.array([
        [cos_t, -sin_t, tx],
        [sin_t,  cos_t, ty],
        [0,      0,     1]
    ])

# Rotate 45 degrees and translate (1, 2)
T = transform_2d(np.pi/4, 1, 2)
```

## Forward Kinematics

Calculate end-effector position from joint angles by chaining transformations.

### Denavit-Hartenberg (DH) Parameters

Standard method for describing robot links:
- **a**: Link length
- **alpha**: Link twist
- **d**: Link offset
- **theta**: Joint angle

### DH Transformation Matrix

```python
def dh_transform(a, alpha, d, theta):
    """Compute DH transformation matrix"""
    ct = np.cos(theta)
    st = np.sin(theta)
    ca = np.cos(alpha)
    sa = np.sin(alpha)

    return np.array([
        [ct, -st*ca,  st*sa, a*ct],
        [st,  ct*ca, -ct*sa, a*st],
        [0,   sa,     ca,    d],
        [0,   0,      0,     1]
    ])
```

### 2-Link Planar Arm Example

```python
class TwoLinkArm:
    def __init__(self, l1, l2):
        self.l1 = l1  # Length of link 1
        self.l2 = l2  # Length of link 2

    def forward_kinematics(self, theta1, theta2):
        """Calculate end-effector position"""
        x = self.l1 * np.cos(theta1) + self.l2 * np.cos(theta1 + theta2)
        y = self.l1 * np.sin(theta1) + self.l2 * np.sin(theta1 + theta2)
        return x, y

# Example usage
arm = TwoLinkArm(l1=1.0, l2=0.8)
x, y = arm.forward_kinematics(np.pi/4, np.pi/6)
print(f"End-effector at: ({x:.2f}, {y:.2f})")
```

## Inverse Kinematics

Find joint angles to reach a desired position. Often has multiple solutions or no solution.

### Analytical Solution for 2-Link Arm

```python
def inverse_kinematics_2link(x, y, l1, l2):
    """
    Calculate joint angles for 2-link planar arm
    Returns (theta1, theta2) or None if unreachable
    """
    # Check if position is reachable
    dist = np.sqrt(x**2 + y**2)
    if dist > l1 + l2 or dist < abs(l1 - l2):
        return None  # Position unreachable

    # Calculate theta2 using law of cosines
    cos_theta2 = (x**2 + y**2 - l1**2 - l2**2) / (2 * l1 * l2)
    theta2 = np.arccos(np.clip(cos_theta2, -1, 1))

    # Calculate theta1
    k1 = l1 + l2 * np.cos(theta2)
    k2 = l2 * np.sin(theta2)
    theta1 = np.arctan2(y, x) - np.arctan2(k2, k1)

    return theta1, theta2

# Example: reach position (1.2, 0.8)
result = inverse_kinematics_2link(1.2, 0.8, 1.0, 0.8)
if result:
    theta1, theta2 = result
    print(f"Joint angles: theta1={np.degrees(theta1):.1f}, theta2={np.degrees(theta2):.1f}")
```

### Numerical Methods for Complex Robots

For robots with more joints, use iterative methods:

```python
def jacobian_inverse_kinematics(robot, target_pos, max_iterations=100):
    """
    Iterative IK using Jacobian pseudo-inverse
    """
    q = robot.get_joint_angles()  # Current configuration

    for i in range(max_iterations):
        current_pos = robot.forward_kinematics(q)
        error = target_pos - current_pos

        if np.linalg.norm(error) < 0.001:
            return q  # Solution found

        J = robot.compute_jacobian(q)
        J_pinv = np.linalg.pinv(J)
        dq = J_pinv @ error
        q = q + 0.1 * dq  # Small step

    return None  # Did not converge
```

## The Jacobian Matrix

The Jacobian relates joint velocities to end-effector velocities:

```
v = J(q) * q_dot

Where:
- v is end-effector velocity (linear + angular)
- J is the Jacobian matrix
- q_dot is joint velocity vector
```

### Computing the Jacobian

```python
def compute_jacobian_numerical(robot, q, delta=0.0001):
    """Compute Jacobian numerically"""
    n_joints = len(q)
    pos = robot.forward_kinematics(q)
    n_dim = len(pos)

    J = np.zeros((n_dim, n_joints))

    for i in range(n_joints):
        q_plus = q.copy()
        q_plus[i] += delta
        pos_plus = robot.forward_kinematics(q_plus)
        J[:, i] = (pos_plus - pos) / delta

    return J
```

## Singularities

Singularities occur when the Jacobian loses rank, causing:
- Loss of degrees of freedom
- Infinite joint velocities near singular configurations
- Solution instability

### Detecting Singularities

```python
def check_singularity(J, threshold=0.01):
    """Check if configuration is near singularity"""
    det = np.linalg.det(J @ J.T)
    return det < threshold
```

## ROS 2 Integration

Using MoveIt 2 for kinematics:

```python
from moveit_msgs.srv import GetPositionIK, GetPositionFK
from geometry_msgs.msg import PoseStamped

class KinematicsNode(Node):
    def __init__(self):
        super().__init__('kinematics_node')

        # IK service client
        self.ik_client = self.create_client(
            GetPositionIK,
            '/compute_ik'
        )

    def compute_ik(self, target_pose):
        request = GetPositionIK.Request()
        request.ik_request.pose_stamped = target_pose
        request.ik_request.group_name = "arm"

        future = self.ik_client.call_async(request)
        return future
```

## Summary

- **Forward kinematics** computes position from joint angles
- **Inverse kinematics** finds joint angles for a target position
- **DH parameters** provide a standard way to describe robot geometry
- **Jacobian** relates joint velocities to end-effector velocities
- **Singularities** are configurations where the robot loses controllability
- Modern robots use libraries like MoveIt 2 for complex IK solutions


## Check Your Understanding

:::note Question 1
What is Kinematics in the context of robotics?
A) The study of forces causing motion in robots
B) The calculation of joint angles to reach a desired position
C) The study of motion without considering the forces that cause it
D) The calculation of end-effector position from joint angles
**Answer**: C)
:::

:::note Question 2
What are the Denavit-Hartenberg (DH) Parameters used for in robot kinematics?
A) Describing the forces acting on a robot
B) Describing the robot's links and joint angles
C) Describing the robot's speed and acceleration
D) Describing the robot's motion in a three-dimensional space
**Answer**: B)
:::

:::note Question 3
What does the Jacobian matrix relate in robot kinematics?
A) Joint velocities to end-effector velocities
B) Joint angles to end-effector position
C) End-effector position to joint angles
D) Joint forces to end-effector forces
**Answer**: A)
:::

:::note Question 4
What is the problem of singularities in robot kinematics?
A) It causes the robot to move in unpredictable ways
B) It causes the Jacobian to lose rank, leading to loss of degrees of freedom and other issues
C) It causes the robot to stop moving
D) It causes the robot's power consumption to increase
**Answer**: B)
:::

:::note Question 5
What is the purpose of using libraries like MoveIt 2 in modern robots?
A) To provide complex inverse kinematics solutions
B) To increase the robot's processing speed
C) To reduce the robot's power consumption
D) To enable the robot to move in a three-dimensional space
**Answer**: A)
:::