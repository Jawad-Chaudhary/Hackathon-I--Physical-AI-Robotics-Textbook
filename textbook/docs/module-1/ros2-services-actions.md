---
sidebar_position: 4
---

# ROS 2 Services and Actions

Learn about synchronous request-response patterns (Services) and long-running task management (Actions) in ROS 2.

## Services: Request-Response Communication

Services provide synchronous communication between nodes. Unlike topics (publish-subscribe), services follow a request-response pattern.

### Service Definition

Services are defined in `.srv` files:

```
# AddTwoInts.srv
int64 a
int64 b
---
int64 sum
```

The `---` separator divides request fields from response fields.

### Creating a Service Server

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AdditionServer(Node):
    def __init__(self):
        super().__init__('addition_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback
        )
        self.get_logger().info('Addition service ready')

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'{request.a} + {request.b} = {response.sum}')
        return response

def main():
    rclpy.init()
    node = AdditionServer()
    rclpy.spin(node)
    rclpy.shutdown()
```

### Creating a Service Client

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AdditionClient(Node):
    def __init__(self):
        super().__init__('addition_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service...')

    def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        future = self.client.call_async(request)
        return future
```

## Actions: Long-Running Tasks

Actions handle tasks that take time to complete, providing feedback during execution and the ability to cancel.

### Action Definition

Actions are defined in `.action` files:

```
# Navigate.action
# Goal
geometry_msgs/PoseStamped target_pose
---
# Result
bool success
float32 total_distance
---
# Feedback
float32 distance_remaining
float32 eta_seconds
```

Three sections: Goal (request), Result (final outcome), Feedback (progress updates).

### Action Server Implementation

```python
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from nav2_msgs.action import NavigateToPose
import time

class NavigationServer(Node):
    def __init__(self):
        super().__init__('navigation_server')
        self._action_server = ActionServer(
            self,
            NavigateToPose,
            'navigate_to_pose',
            self.execute_callback
        )

    async def execute_callback(self, goal_handle):
        self.get_logger().info('Executing navigation...')
        feedback_msg = NavigateToPose.Feedback()

        # Simulate navigation with feedback
        for i in range(10):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                return NavigateToPose.Result()

            feedback_msg.distance_remaining = float(10 - i)
            goal_handle.publish_feedback(feedback_msg)
            time.sleep(0.5)

        goal_handle.succeed()
        result = NavigateToPose.Result()
        result.success = True
        return result
```

### Action Client Implementation

```python
from rclpy.action import ActionClient

class NavigationClient(Node):
    def __init__(self):
        super().__init__('navigation_client')
        self._action_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )

    def send_goal(self, pose):
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose = pose

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )
        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def feedback_callback(self, feedback_msg):
        distance = feedback_msg.feedback.distance_remaining
        self.get_logger().info(f'Distance remaining: {distance}m')

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if goal_handle.accepted:
            self.get_logger().info('Goal accepted')
```

## When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Topics** | Continuous data streams | Sensor data, robot state |
| **Services** | Quick request-response | Parameter queries, mode changes |
| **Actions** | Long-running tasks | Navigation, manipulation |

## Key Concepts

### Service Characteristics
- Synchronous (blocks until response)
- One-to-one communication
- Best for quick operations
- No progress feedback

### Action Characteristics
- Asynchronous with feedback
- Supports cancellation
- Tracks goal state
- Best for tasks taking more than a few seconds

## Practical Example: Robot Arm Control

```python
# Service: Get current joint positions (quick query)
joint_positions = joint_state_client.call(GetJointStates.Request())

# Action: Move arm to target (long operation with feedback)
move_goal = MoveArm.Goal()
move_goal.target_position = [1.0, 0.5, 0.3]
action_client.send_goal_async(move_goal, feedback_callback=show_progress)
```

## Summary

- **Services** provide request-response communication for quick operations
- **Actions** manage long-running tasks with feedback and cancellation
- Choose the right pattern based on operation duration and feedback needs
- Both integrate seamlessly with the ROS 2 node lifecycle


## Check Your Understanding

:::note Question 1
What type of communication do ROS 2 services provide?
A) Asynchronous communication
B) Synchronous communication
C) Publish-subscribe communication
D) Feedback-based communication
**Answer**: B) Synchronous communication

:::note Question 2
In a ROS 2 service definition, what does the `---` separator indicate?
A) The end of the service definition
B) The start of the service definition
C) The division between request fields and response fields
D) The division between request fields and the service name
**Answer**: C) The division between request fields and response fields

:::note Question 3
What kind of tasks are best managed by Actions in ROS 2?
A) Quick operations
B) Long-running tasks
C) One-to-one communication tasks
D) Continuous data streams
**Answer**: B) Long-running tasks

:::note Question 4
In ROS 2, which communication pattern provides progress feedback and supports cancellation?
A) Topics
B) Services
C) Actions
D) None of the above
**Answer**: C) Actions

:::note Question 5
In the context of ROS 2, when would you use a Service over an Action?
A) When you need to manage a long-running task
B) When you need to provide continuous data streams
C) When you need to perform a quick operation
D) When you need to provide progress feedback
**Answer**: C) When you need to perform a quick operation