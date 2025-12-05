---
sidebar_position: 3
---

# Sensors and Actuators

Robots interact with the physical world through sensors (input) and actuators (output). Let's explore how to interface with them in ROS 2.

## What are Sensors?

Sensors allow robots to perceive their environment. Common types include:

### Vision Sensors
- **Cameras** - RGB images
- **Depth cameras** - 3D perception (RealSense, Kinect)
- **LiDAR** - Laser-based distance measurements

### Motion Sensors
- **IMU (Inertial Measurement Unit)** - Acceleration and orientation
- **Encoders** - Wheel rotation and position
- **GPS** - Global positioning

### Proximity Sensors
- **Ultrasonic** - Short-range distance
- **Infrared** - Obstacle detection
- **Force/Torque** - Contact sensing

## Working with Camera Data

Let's create a node that processes camera images:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class CameraProcessor(Node):
    def __init__(self):
        super().__init__('camera_processor')
        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )
        self.publisher_ = self.create_publisher(Image, '/camera/processed', 10)
        self.bridge = CvBridge()

    def image_callback(self, msg):
        # Convert ROS Image message to OpenCV format
        cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

        # Process image (example: convert to grayscale)
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

        # Convert back to ROS Image message
        processed_msg = self.bridge.cv2_to_imgmsg(gray, encoding='mono8')
        processed_msg.header = msg.header

        # Publish processed image
        self.publisher_.publish(processed_msg)
        self.get_logger().info('Processed image published')

def main(args=None):
    rclpy.init(args=args)
    node = CameraProcessor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Concepts

1. **cv_bridge** - Converts between ROS Image messages and OpenCV format
2. **Image encoding** - Common formats: `bgr8`, `rgb8`, `mono8`, `32FC1`
3. **Header timestamp** - Preserves timing information from original message

## IMU Data Processing

IMUs provide orientation and acceleration data:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu
import math

class ImuProcessor(Node):
    def __init__(self):
        super().__init__('imu_processor')
        self.subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

    def imu_callback(self, msg):
        # Extract orientation (quaternion)
        orientation = msg.orientation

        # Convert quaternion to Euler angles
        roll, pitch, yaw = self.quaternion_to_euler(
            orientation.x, orientation.y, orientation.z, orientation.w
        )

        # Extract linear acceleration
        accel = msg.linear_acceleration

        self.get_logger().info(
            f'Roll: {math.degrees(roll):.2f}° '
            f'Pitch: {math.degrees(pitch):.2f}° '
            f'Yaw: {math.degrees(yaw):.2f}° '
            f'Accel: [{accel.x:.2f}, {accel.y:.2f}, {accel.z:.2f}] m/s²'
        )

    def quaternion_to_euler(self, x, y, z, w):
        """Convert quaternion to Euler angles (roll, pitch, yaw)"""
        # Roll (x-axis rotation)
        sinr_cosp = 2 * (w * x + y * z)
        cosr_cosp = 1 - 2 * (x * x + y * y)
        roll = math.atan2(sinr_cosp, cosr_cosp)

        # Pitch (y-axis rotation)
        sinp = 2 * (w * y - z * x)
        pitch = math.asin(sinp) if abs(sinp) <= 1 else math.copysign(math.pi / 2, sinp)

        # Yaw (z-axis rotation)
        siny_cosp = 2 * (w * z + x * y)
        cosy_cosp = 1 - 2 * (y * y + z * z)
        yaw = math.atan2(siny_cosp, cosy_cosp)

        return roll, pitch, yaw

def main(args=None):
    rclpy.init(args=args)
    node = ImuProcessor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## What are Actuators?

Actuators convert electrical signals into physical motion:

### Common Actuators
- **Motors** - DC, stepper, servo
- **Pneumatic actuators** - Air-powered
- **Hydraulic actuators** - Fluid-powered
- **Grippers** - End effectors

## Controlling Motors

Let's create a velocity controller for a differential drive robot:

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.publisher_ = self.create_publisher(Twist, '/cmd_vel', 10)
        self.timer = self.create_timer(0.1, self.control_loop)
        self.state = 'forward'
        self.counter = 0

    def control_loop(self):
        msg = Twist()

        # State machine for robot behavior
        if self.state == 'forward':
            msg.linear.x = 0.5  # Move forward at 0.5 m/s
            msg.angular.z = 0.0
            if self.counter > 50:  # After 5 seconds
                self.state = 'turn'
                self.counter = 0

        elif self.state == 'turn':
            msg.linear.x = 0.0
            msg.angular.z = 0.5  # Turn at 0.5 rad/s
            if self.counter > 30:  # After 3 seconds
                self.state = 'forward'
                self.counter = 0

        self.publisher_.publish(msg)
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = RobotController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Twist Message Structure

The `Twist` message controls robot motion:

```
linear:
  x: forward/backward velocity (m/s)
  y: left/right velocity (m/s) - for holonomic robots
  z: up/down velocity (m/s)
angular:
  x: roll rate (rad/s)
  y: pitch rate (rad/s)
  z: yaw rate (rad/s) - turning
```

For differential drive robots (most common):
- `linear.x` - forward/backward speed
- `angular.z` - turning rate

## Sensor-Actuator Integration

Real robotics applications integrate sensors and actuators. Here's an obstacle avoidance example:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist

class ObstacleAvoider(Node):
    def __init__(self):
        super().__init__('obstacle_avoider')

        # Subscribe to laser scan
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )

        # Publish velocity commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        self.obstacle_distance = float('inf')

    def scan_callback(self, msg):
        # Get minimum distance from laser scan (front 60 degrees)
        front_ranges = msg.ranges[len(msg.ranges)//2 - 30:len(msg.ranges)//2 + 30]
        self.obstacle_distance = min(front_ranges)

        # Generate velocity command
        cmd = Twist()

        if self.obstacle_distance < 0.5:  # Obstacle within 0.5m
            # Turn to avoid obstacle
            cmd.linear.x = 0.0
            cmd.angular.z = 0.5
            self.get_logger().warn(f'Obstacle detected at {self.obstacle_distance:.2f}m - Turning')
        else:
            # Move forward
            cmd.linear.x = 0.3
            cmd.angular.z = 0.0
            self.get_logger().info('Path clear - Moving forward')

        self.cmd_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    node = ObstacleAvoider()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

This node:
1. **Reads** laser scan data (sensor input)
2. **Processes** to detect obstacles
3. **Commands** robot motion (actuator output)

## Hardware Interfacing

When working with real hardware, you'll need device drivers:

### Common ROS 2 Sensor Packages
```bash
# Camera drivers
sudo apt install ros-humble-usb-cam
sudo apt install ros-humble-realsense2-camera

# LiDAR drivers
sudo apt install ros-humble-rplidar-ros
sudo apt install ros-humble-urg-node

# IMU drivers
sudo apt install ros-humble-phidgets-imu
```

### Testing Hardware

```bash
# List available topics
ros2 topic list

# Check camera output
ros2 topic echo /camera/image_raw

# Visualize camera in RViz
rviz2
```

## Best Practices

1. **Always validate sensor data** - Check for NaN, infinity, and out-of-range values
2. **Use appropriate data rates** - Cameras at 30Hz, IMU at 100Hz, LiDAR at 10Hz
3. **Handle sensor failures gracefully** - Implement timeouts and fallback behaviors
4. **Calibrate sensors** - Camera intrinsics, IMU bias, wheel odometry
5. **Limit actuator commands** - Enforce maximum velocities and accelerations for safety

---

:::tip What's Next?
Learn to test your code safely with **[Simulation in Gazebo](./simulation)**.
:::


## Check Your Understanding

:::note Question 1
What are the functions of sensors and actuators in robots?
A) Sensors provide input, and actuators provide output.
B) Sensors and actuators both provide input.
C) Sensors and actuators both provide output.
D) Actuators provide input, and sensors provide output.
**Answer**: A

:::note Question 2
What is the purpose of the cv_bridge in ROS 2?
A) To convert between ROS Image messages and OpenCV format.
B) To convert between ROS Image messages and Python format.
C) To convert between ROS Image messages and JavaScript format.
D) To convert between ROS Image messages and C++ format.
**Answer**: A

:::note Question 3
What is the function of the `Twist` message in controlling a differential drive robot?
A) It controls the robot's motion by setting forward/backward speed and turning rate.
B) It controls the robot's motion by setting the robot's color.
C) It controls the robot's motion by setting the robot's size.
D) It controls the robot's motion by resetting the robot's position.
**Answer**: A

:::note Question 4
What is the function of the `imu_processor` node in the presented ROS 2 code?
A) It processes image data from a camera.
B) It processes orientation and acceleration data from an IMU.
C) It processes distance data from a LiDAR.
D) It processes ultrasonic signals from a proximity sensor.
**Answer**: B

:::note Question 5
What is the obstacle avoidance example node in the text doing?
A) It reads laser scan data, processes to detect obstacles, and commands robot motion.
B) It reads temperature data, processes to detect high temperatures, and commands robot to cool down.
C) It reads sound data, processes to detect loud noises, and commands the robot to move away.
D) It reads light data, processes to detect darkness, and commands the robot to turn on its lights.
**Answer**: A