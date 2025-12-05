---
sidebar_position: 2
---

# ROS 2 Nodes and Topics

Learn how to create ROS 2 nodes and enable communication between them using topics.

## What is a ROS 2 Node?

A **node** is a fundamental building block in ROS 2. Each node is a process that performs a specific computation. Nodes communicate with each other through **topics**, **services**, and **actions**.

Think of nodes as independent programs that work together to control a robot:
- A camera node captures images
- A vision node processes those images
- A control node decides how to move
- A motor node controls the wheels

## Creating Your First Node

Let's create a simple publisher node in Python:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloWorldPublisher(Node):
    def __init__(self):
        super().__init__('hello_world_publisher')
        self.publisher_ = self.create_publisher(String, 'hello_topic', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.counter}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = HelloWorldPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Code Breakdown

1. **Import ROS 2 Python library** (`rclpy`)
2. **Create a Node class** that inherits from `Node`
3. **Initialize the node** with a unique name
4. **Create a publisher** that publishes `String` messages to `hello_topic`
5. **Set up a timer** to publish messages every second
6. **Spin the node** to keep it running

## Topics: The Communication Highway

Topics are named buses over which nodes exchange messages. They follow a **publish-subscribe** pattern:

- **Publishers** send messages to a topic
- **Subscribers** receive messages from that topic
- Multiple nodes can publish/subscribe to the same topic

### Creating a Subscriber Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloWorldSubscriber(Node):
    def __init__(self):
        super().__init__('hello_world_subscriber')
        self.subscription = self.create_subscription(
            String,
            'hello_topic',
            self.listener_callback,
            10
        )

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = HelloWorldSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Running Your Nodes

Open two terminals:

**Terminal 1 - Publisher:**
```bash
cd ~/ros2_ws
source install/setup.bash
ros2 run my_package hello_publisher
```

**Terminal 2 - Subscriber:**
```bash
cd ~/ros2_ws
source install/setup.bash
ros2 run my_package hello_subscriber
```

You should see the subscriber receiving messages from the publisher!

## Useful ROS 2 Commands

### List Active Nodes
```bash
ros2 node list
```

### List Active Topics
```bash
ros2 topic list
```

### View Topic Messages
```bash
ros2 topic echo /hello_topic
```

### Get Topic Info
```bash
ros2 topic info /hello_topic
```

### Publish from Command Line
```bash
ros2 topic pub /hello_topic std_msgs/msg/String "data: 'Test message'"
```

## Quality of Service (QoS)

ROS 2 introduces QoS policies to control message delivery:

- **Reliability**: Best effort vs. reliable delivery
- **Durability**: Transient local vs. volatile
- **History**: Keep last N messages

Example with custom QoS:

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

qos_profile = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)

self.publisher_ = self.create_publisher(String, 'topic', qos_profile)
```

## Real-World Example: Robot Sensor

Let's create a more realistic example - a temperature sensor node:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Temperature
import random

class TemperatureSensor(Node):
    def __init__(self):
        super().__init__('temperature_sensor')
        self.publisher_ = self.create_publisher(Temperature, 'robot/temperature', 10)
        self.timer = self.create_timer(0.5, self.publish_temperature)

    def publish_temperature(self):
        msg = Temperature()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_link'
        msg.temperature = 25.0 + random.uniform(-2.0, 2.0)  # Simulate sensor reading
        msg.variance = 0.1

        self.publisher_.publish(msg)
        self.get_logger().info(f'Temperature: {msg.temperature:.2f}°C')

def main(args=None):
    rclpy.init(args=args)
    node = TemperatureSensor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

This node simulates a temperature sensor and publishes readings using the standard `sensor_msgs/Temperature` message type.

## Best Practices

1. **Use descriptive node and topic names**
   - Good: `/robot/camera/front/image`
   - Bad: `/cam1`

2. **Choose appropriate message types**
   - Use standard message types from `std_msgs`, `sensor_msgs`, `geometry_msgs` when possible
   - Create custom messages only when necessary

3. **Handle node lifecycle properly**
   - Always call `node.destroy_node()` and `rclpy.shutdown()`
   - Use try-except blocks for error handling

4. **Set appropriate QoS policies**
   - Sensor data: Best effort, volatile
   - Command data: Reliable, transient local

---

:::tip What's Next?
Learn about **[Sensors and Actuators](./sensors-actuators)** to interface with hardware.
:::


## Check Your Understanding

:::note Question 1
What is a ROS 2 Node?
A) A process that performs a specific computation
B) A communication protocol used between nodes
C) A part of a robot that performs physical actions
D) A language used to program robots
**Answer**: A
:::

:::note Question 2
What is a fundamental function of a publisher in ROS 2?
A) It sends messages to a topic
B) It receives messages from a topic
C) It listens for messages on a specific topic
D) It creates new topics
**Answer**: A
:::

:::note Question 3
Which of the following is NOT a Quality of Service (QoS) policy in ROS 2?
A) Reliability
B) Durability
C) History
D) Speed
**Answer**: D
:::

:::note Question 4
What is the purpose of the `node.destroy_node()` and `rclpy.shutdown()` commands in ROS 2?
A) To start the node and prepare it for operation
B) To update the node with new data
C) To properly handle the lifecycle of the node and shut it down
D) To restart the node in case of errors
**Answer**: C
:::

:::note Question 5
What is the best practice regarding message types in ROS 2?
A) Always use custom messages
B) Always use standard messages
C) Use standard message types whenever possible, create custom messages only when necessary
D) The type of message doesn't matter, as long as it works
**Answer**: C
:::