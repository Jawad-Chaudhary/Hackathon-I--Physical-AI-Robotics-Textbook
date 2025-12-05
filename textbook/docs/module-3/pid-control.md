---
sidebar_position: 4
---

# PID Control

Master PID (Proportional-Integral-Derivative) control for precise robot motion and actuator control.

## What is PID Control?

PID is a feedback control algorithm that continuously calculates error and applies correction:

**PID Output = Kp × e(t) + Ki × ∫e(t)dt + Kd × de(t)/dt**

Where:
- **e(t)** = error = setpoint - measured_value
- **Kp** = Proportional gain
- **Ki** = Integral gain
- **Kd** = Derivative gain

## PID Components

### Proportional (P)
- **Action**: Proportional to current error
- **Effect**: Main driving force towards setpoint
- **Problem**: Steady-state error, overshoot

### Integral (I)
- **Action**: Sum of past errors
- **Effect**: Eliminates steady-state error
- **Problem**: Wind-up, slow response

### Derivative (D)
- **Action**: Rate of error change
- **Effect**: Dampens oscillations, improves stability
- **Problem**: Amplifies noise

## Basic PID Implementation

```python
import time

class PIDController:
    def __init__(self, Kp, Ki, Kd, setpoint=0):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.setpoint = setpoint

        self.prev_error = 0
        self.integral = 0
        self.prev_time = None

    def update(self, measured_value):
        """
        Calculate PID output

        Args:
            measured_value: Current sensor reading

        Returns:
            control_output: Command to actuator
        """
        current_time = time.time()

        if self.prev_time is None:
            self.prev_time = current_time
            dt = 0.01  # Small default
        else:
            dt = current_time - self.prev_time
            self.prev_time = current_time

        # Calculate error
        error = self.setpoint - measured_value

        # Proportional term
        P = self.Kp * error

        # Integral term
        self.integral += error * dt
        I = self.Ki * self.integral

        # Derivative term
        if dt > 0:
            derivative = (error - self.prev_error) / dt
        else:
            derivative = 0
        D = self.Kd * derivative

        # Store error for next iteration
        self.prev_error = error

        # Calculate output
        output = P + I + D

        return output

    def reset(self):
        """Reset controller state"""
        self.prev_error = 0
        self.integral = 0
        self.prev_time = None

# Example usage
pid = PIDController(Kp=1.0, Ki=0.1, Kd=0.05, setpoint=100)

current_value = 0
for i in range(100):
    control_output = pid.update(current_value)
    current_value += control_output * 0.1  # Simulate system response
    print(f"Step {i}: Value={current_value:.2f}, Output={control_output:.2f}")
    time.sleep(0.01)
```

## Advanced PID Features

### Anti-Windup

Prevent integral term from growing too large:

```python
class PIDWithAntiWindup(PIDController):
    def __init__(self, Kp, Ki, Kd, setpoint=0, output_limits=(-100, 100)):
        super().__init__(Kp, Ki, Kd, setpoint)
        self.output_limits = output_limits
        self.integral_limit = 50  # Limit integral accumulation

    def update(self, measured_value):
        # Calculate base PID
        current_time = time.time()
        dt = current_time - self.prev_time if self.prev_time else 0.01
        self.prev_time = current_time

        error = self.setpoint - measured_value

        # Proportional
        P = self.Kp * error

        # Integral with clamping
        self.integral += error * dt
        self.integral = np.clip(self.integral, -self.integral_limit, self.integral_limit)
        I = self.Ki * self.integral

        # Derivative
        derivative = (error - self.prev_error) / dt if dt > 0 else 0
        D = self.Kd * derivative

        self.prev_error = error

        # Calculate output with limits
        output = P + I + D
        output = np.clip(output, *self.output_limits)

        return output
```

### Derivative Filtering

Reduce noise amplification:

```python
class PIDWithFilter(PIDController):
    def __init__(self, Kp, Ki, Kd, setpoint=0, filter_coeff=0.1):
        super().__init__(Kp, Ki, Kd, setpoint)
        self.filter_coeff = filter_coeff  # Low-pass filter coefficient
        self.filtered_derivative = 0

    def update(self, measured_value):
        current_time = time.time()
        dt = current_time - self.prev_time if self.prev_time else 0.01
        self.prev_time = current_time

        error = self.setpoint - measured_value

        P = self.Kp * error

        self.integral += error * dt
        I = self.Ki * self.integral

        # Filtered derivative
        raw_derivative = (error - self.prev_error) / dt if dt > 0 else 0
        self.filtered_derivative = (
            self.filter_coeff * raw_derivative +
            (1 - self.filter_coeff) * self.filtered_derivative
        )
        D = self.Kd * self.filtered_derivative

        self.prev_error = error

        return P + I + D
```

## Tuning PID Parameters

### Ziegler-Nichols Method

```python
def ziegler_nichols_tuning(Ku, Tu):
    """
    Calculate PID parameters using Ziegler-Nichols method

    Args:
        Ku: Ultimate gain (Kp at stability limit)
        Tu: Ultimate period (oscillation period at Ku)

    Returns:
        (Kp, Ki, Kd): Tuned parameters
    """
    Kp = 0.6 * Ku
    Ki = 1.2 * Ku / Tu
    Kd = 0.075 * Ku * Tu

    return Kp, Ki, Kd

# Example
Ku = 5.0  # Gain at oscillation
Tu = 2.0  # Oscillation period
Kp, Ki, Kd = ziegler_nichols_tuning(Ku, Tu)
print(f"Tuned parameters: Kp={Kp}, Ki={Ki}, Kd={Kd}")
```

### Manual Tuning Steps

1. **Start with P**: Set Ki=0, Kd=0. Increase Kp until steady oscillation
2. **Add D**: Increase Kd to dampen oscillations
3. **Add I**: Increase Ki to eliminate steady-state error
4. **Fine-tune**: Adjust all three for desired response

## ROS 2 PID Control Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
import numpy as np

class PIDVelocityController(Node):
    def __init__(self):
        super().__init__('pid_velocity_controller')

        # PID parameters
        self.declare_parameter('linear_Kp', 1.0)
        self.declare_parameter('linear_Ki', 0.1)
        self.declare_parameter('linear_Kd', 0.05)
        self.declare_parameter('angular_Kp', 2.0)
        self.declare_parameter('angular_Ki', 0.1)
        self.declare_parameter('angular_Kd', 0.1)

        # Get parameters
        linear_params = [
            self.get_parameter('linear_Kp').value,
            self.get_parameter('linear_Ki').value,
            self.get_parameter('linear_Kd').value
        ]
        angular_params = [
            self.get_parameter('angular_Kp').value,
            self.get_parameter('angular_Ki').value,
            self.get_parameter('angular_Kd').value
        ]

        # Create PID controllers
        self.linear_pid = PIDController(*linear_params)
        self.angular_pid = PIDController(*angular_params)

        # Subscribe to desired and actual velocities
        self.desired_sub = self.create_subscription(
            Twist, '/cmd_vel_desired', self.desired_callback, 10
        )
        self.odom_sub = self.create_subscription(
            Odometry, '/odom', self.odom_callback, 10
        )

        # Publish actual commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        self.desired_linear = 0.0
        self.desired_angular = 0.0

    def desired_callback(self, msg):
        self.desired_linear = msg.linear.x
        self.desired_angular = msg.angular.z

        self.linear_pid.setpoint = self.desired_linear
        self.angular_pid.setpoint = self.desired_angular

    def odom_callback(self, msg):
        # Current velocities from odometry
        current_linear = msg.twist.twist.linear.x
        current_angular = msg.twist.twist.angular.z

        # Calculate PID outputs
        linear_output = self.linear_pid.update(current_linear)
        angular_output = self.angular_pid.update(current_angular)

        # Publish control commands
        cmd = Twist()
        cmd.linear.x = linear_output
        cmd.angular.z = angular_output

        self.cmd_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    node = PIDVelocityController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Position Control with PID

```python
class PositionController:
    def __init__(self, Kp, Ki, Kd, max_velocity=1.0):
        self.pid = PIDController(Kp, Ki, Kd)
        self.max_velocity = max_velocity

    def control(self, current_pos, target_pos):
        """
        Generate velocity command to reach target position

        Args:
            current_pos: Current position
            target_pos: Target position

        Returns:
            velocity: Commanded velocity
        """
        self.pid.setpoint = target_pos
        velocity = self.pid.update(current_pos)

        # Limit velocity
        velocity = np.clip(velocity, -self.max_velocity, self.max_velocity)

        return velocity

# Usage for robot navigation
pos_controller = PositionController(Kp=1.5, Ki=0.1, Kd=0.3, max_velocity=0.5)

current_x = 0.0
target_x = 5.0

for step in range(100):
    velocity = pos_controller.control(current_x, target_x)
    current_x += velocity * 0.1  # Integrate velocity
    print(f"Position: {current_x:.2f}, Velocity: {velocity:.2f}")
```

## Cascade Control

Multiple PID loops for better performance:

```python
class CascadeController:
    def __init__(self):
        # Outer loop: Position → Velocity
        self.position_pid = PIDController(Kp=2.0, Ki=0.1, Kd=0.5)

        # Inner loop: Velocity → Acceleration
        self.velocity_pid = PIDController(Kp=1.0, Ki=0.2, Kd=0.05)

    def update(self, target_pos, current_pos, current_vel):
        # Outer loop: position error → desired velocity
        self.position_pid.setpoint = target_pos
        desired_vel = self.position_pid.update(current_pos)

        # Inner loop: velocity error → acceleration command
        self.velocity_pid.setpoint = desired_vel
        acceleration = self.velocity_pid.update(current_vel)

        return acceleration
```

## Best Practices

1. **Start simple** - Begin with P-only control
2. **Tune systematically** - P → D → I
3. **Set limits** - Output clamping and anti-windup
4. **Filter derivative** - Reduce noise sensitivity
5. **Monitor performance** - Log error, output, and gains
6. **Dynamic tuning** - Adjust gains based on conditions

---

:::tip What's Next?
Learn **[Robot Navigation](./navigation)** using ROS 2 Nav2 stack.
:::


## Check Your Understanding

:::note Question 1
What is the Proportional component in PID control?
A) Sum of past errors
B) Rate of error change
C) Proportional to current error
D) Dampens oscillations
**Answer**: C

:::note Question 2
What is a potential problem with the Derivative component in a PID controller?
A) Amplifies noise
B) Steady-state error
C) Wind-up
D) Slow response
**Answer**: A

:::note Question 3
In the PID controller equation, what does the variable `e(t)` represent?
A) Proportional gain
B) Integral gain
C) Derivative gain
D) Error
**Answer**: D

:::note Question 4
Which of the following methods can be used for tuning PID parameters?
A) Ziegler-Nichols Method
B) Newton's Method
C) Euclid's Method
D) Pythagorean Method
**Answer**: A

:::note Question 5
What is Cascade Control in the context of PID controllers?
A) A system with multiple PID loops for better performance.
B) A way to reduce noise amplification.
C) A method to prevent integral term from growing too large.
D) A technique to manually tune PID parameters.
**Answer**: A