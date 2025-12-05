---
sidebar_position: 1
---

# Introduction to Motion and Control

Welcome to Module 3! Learn how robots move, navigate, and control their actuators with precision.

## What is Robot Motion and Control?

**Motion and Control** enables robots to:
- 🎯 **Navigate** - Move from point A to B safely
- 🤖 **Manipulate** - Control robot arms and grippers
- 📐 **Plan paths** - Find optimal routes
- ⚙️ **Control actuators** - Precise motor control
- 🔄 **React dynamically** - Adapt to changing conditions

## Why Motion and Control Matters

Without motion control, robots cannot:
- Navigate autonomously
- Manipulate objects accurately
- Avoid obstacles dynamically
- Follow trajectories smoothly
- Respond to disturbances

## Module Overview

### Chapter 1: Robot Kinematics
Understand robot motion mathematics - forward and inverse kinematics for manipulators and mobile robots.

### Chapter 2: Path Planning
Learn algorithms to find collision-free paths from start to goal.

### Chapter 3: PID Control
Master proportional-integral-derivative control for precise actuator control.

### Chapter 4: Navigation
Implement autonomous navigation using the ROS 2 Navigation Stack (Nav2).

## Prerequisites

- Completion of Modules 1 & 2
- Linear algebra (matrices, transforms)
- Basic calculus (derivatives, integrals)
- Python programming with NumPy

## Key Concepts

### Configuration Space
The set of all possible robot poses. For a mobile robot:
- **2D**: (x, y, θ)
- **3D**: (x, y, z, roll, pitch, yaw)

### Degrees of Freedom (DOF)
Number of independent parameters defining robot configuration:
- Differential drive robot: 2 DOF (forward, rotation)
- 6-DOF robot arm: 6 joint angles

### Reference Frames
- **World frame**: Global coordinate system
- **Body frame**: Robot-centric coordinates
- **Sensor frame**: Sensor-centric coordinates

## Transform Mathematics

### Homogeneous Transforms

```python
import numpy as np

def create_transform(x, y, theta):
    """Create 2D homogeneous transform matrix"""
    return np.array([
        [np.cos(theta), -np.sin(theta), x],
        [np.sin(theta),  np.cos(theta), y],
        [0,              0,              1]
    ])

def transform_point(T, point):
    """Transform a point using homogeneous matrix"""
    p_homo = np.append(point, 1)  # Make homogeneous
    p_transformed = T @ p_homo
    return p_transformed[:2]

# Example: Robot at (1, 2) rotated 45 degrees
T_world_robot = create_transform(1, 2, np.pi/4)

# Point (1, 0) in robot frame
point_robot = np.array([1, 0])

# Transform to world frame
point_world = transform_point(T_world_robot, point_robot)
print(f"Point in world frame: {point_world}")
```

### Rotation Matrices

```python
def rotation_matrix_2d(theta):
    """2D rotation matrix"""
    return np.array([
        [np.cos(theta), -np.sin(theta)],
        [np.sin(theta),  np.cos(theta)]
    ])

def rotation_matrix_3d_z(theta):
    """3D rotation around Z-axis"""
    return np.array([
        [np.cos(theta), -np.sin(theta), 0],
        [np.sin(theta),  np.cos(theta), 0],
        [0,              0,              1]
    ])
```

## Differential Drive Kinematics

```python
class DifferentialDrive:
    def __init__(self, wheel_radius, wheel_base):
        """
        Args:
            wheel_radius: Radius of wheels (m)
            wheel_base: Distance between wheels (m)
        """
        self.r = wheel_radius
        self.L = wheel_base

    def forward_kinematics(self, omega_l, omega_r):
        """
        Convert wheel velocities to robot velocities

        Args:
            omega_l: Left wheel angular velocity (rad/s)
            omega_r: Right wheel angular velocity (rad/s)

        Returns:
            v: Linear velocity (m/s)
            omega: Angular velocity (rad/s)
        """
        v = (self.r / 2) * (omega_r + omega_l)
        omega = (self.r / self.L) * (omega_r - omega_l)
        return v, omega

    def inverse_kinematics(self, v, omega):
        """
        Convert robot velocities to wheel velocities

        Args:
            v: Desired linear velocity (m/s)
            omega: Desired angular velocity (rad/s)

        Returns:
            omega_l: Left wheel angular velocity (rad/s)
            omega_r: Right wheel angular velocity (rad/s)
        """
        omega_l = (v - omega * self.L / 2) / self.r
        omega_r = (v + omega * self.L / 2) / self.r
        return omega_l, omega_r

# Example usage
robot = DifferentialDrive(wheel_radius=0.05, wheel_base=0.3)

# Forward: What's the robot velocity if wheels spin at 10 rad/s?
v, omega = robot.forward_kinematics(10, 10)
print(f"Linear: {v:.2f} m/s, Angular: {omega:.2f} rad/s")

# Inverse: What wheel speeds for 0.5 m/s forward?
omega_l, omega_r = robot.inverse_kinematics(0.5, 0)
print(f"Left wheel: {omega_l:.2f} rad/s, Right wheel: {omega_r:.2f} rad/s")
```

## Motion Models

### Velocity Motion Model

```python
def velocity_motion_model(x, v, omega, dt):
    """
    Update robot pose using velocity commands

    Args:
        x: Current pose [x, y, theta]
        v: Linear velocity (m/s)
        omega: Angular velocity (rad/s)
        dt: Time step (s)

    Returns:
        New pose [x, y, theta]
    """
    x_new = x[0] + v * np.cos(x[2]) * dt
    y_new = x[1] + v * np.sin(x[2]) * dt
    theta_new = x[2] + omega * dt

    return np.array([x_new, y_new, theta_new])

# Simulate robot motion
pose = np.array([0, 0, 0])  # Start at origin
v, omega = 0.5, 0.1  # Move forward while turning slightly
dt = 0.1

for step in range(100):
    pose = velocity_motion_model(pose, v, omega, dt)
    print(f"Step {step}: x={pose[0]:.2f}, y={pose[1]:.2f}, θ={pose[2]:.2f}")
```

## Control Architecture

```
┌─────────────┐
│   Planner   │ ← High-level: Where to go?
└──────┬──────┘
       │ Waypoints
       ▼
┌─────────────┐
│ Controller  │ ← Mid-level: How to follow path?
└──────┬──────┘
       │ Velocity commands
       ▼
┌─────────────┐
│  Actuators  │ ← Low-level: Motor control
└─────────────┘
```

## ROS 2 Control Integration

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped
from nav_msgs.msg import Odometry
import numpy as np

class SimpleController(Node):
    def __init__(self):
        super().__init__('simple_controller')

        # Subscribe to odometry
        self.odom_sub = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10
        )

        # Subscribe to goal
        self.goal_sub = self.create_subscription(
            PoseStamped,
            '/goal_pose',
            self.goal_callback,
            10
        )

        # Publish velocity commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Control loop
        self.timer = self.create_timer(0.1, self.control_loop)

        self.current_pose = None
        self.goal_pose = None

    def odom_callback(self, msg):
        self.current_pose = msg.pose.pose

    def goal_callback(self, msg):
        self.goal_pose = msg.pose

    def control_loop(self):
        if self.current_pose is None or self.goal_pose is None:
            return

        # Calculate error
        dx = self.goal_pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.position.y - self.current_pose.position.y
        distance = np.sqrt(dx**2 + dy**2)

        if distance < 0.1:  # Goal reached
            cmd = Twist()
            self.cmd_pub.publish(cmd)
            return

        # Calculate desired heading
        target_angle = np.arctan2(dy, dx)
        current_angle = self.get_yaw(self.current_pose.orientation)
        angle_error = self.normalize_angle(target_angle - current_angle)

        # Simple proportional control
        cmd = Twist()
        cmd.linear.x = min(0.3, distance * 0.5)  # Proportional to distance
        cmd.angular.z = angle_error * 1.0  # Proportional to angle error

        self.cmd_pub.publish(cmd)

    def get_yaw(self, orientation):
        """Convert quaternion to yaw angle"""
        q = orientation
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y**2 + q.z**2)
        return np.arctan2(siny_cosp, cosy_cosp)

    def normalize_angle(self, angle):
        """Normalize angle to [-pi, pi]"""
        while angle > np.pi:
            angle -= 2 * np.pi
        while angle < -np.pi:
            angle += 2 * np.pi
        return angle

def main(args=None):
    rclpy.init(args=args)
    node = SimpleController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

:::tip What's Next?
Start with **[Robot Kinematics](./kinematics)** to understand robot motion mathematics.
:::
