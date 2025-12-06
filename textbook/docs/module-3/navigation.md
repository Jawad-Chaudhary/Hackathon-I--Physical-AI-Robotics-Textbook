---
sidebar_position: 5
---

# Robot Navigation with Nav2

Learn how to use the Navigation 2 (Nav2) stack in ROS 2 for autonomous robot navigation.

## What is Nav2?

Nav2 is the successor to the ROS Navigation Stack, providing:
- Path planning and execution
- Obstacle avoidance
- Localization
- Recovery behaviors
- Behavior trees for complex navigation logic

## Nav2 Architecture

```
                    +----------------+
                    |  Behavior Tree |
                    |   Navigator    |
                    +-------+--------+
                            |
        +-------------------+-------------------+
        |                   |                   |
+-------v------+    +-------v------+    +-------v------+
|   Planner    |    |  Controller  |    |   Recovery   |
|   Server     |    |    Server    |    |   Server     |
+--------------+    +--------------+    +--------------+
        |                   |                   |
        +-------------------+-------------------+
                            |
                    +-------v--------+
                    |    Costmap     |
                    |     2D         |
                    +----------------+
```

## Setting Up Nav2

### Launch File

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource

def generate_launch_description():
    return LaunchDescription([
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource([
                'nav2_bringup', '/launch/navigation_launch.py'
            ]),
            launch_arguments={
                'use_sim_time': 'true',
                'params_file': 'config/nav2_params.yaml'
            }.items()
        )
    ])
```

### Configuration Parameters

```yaml
# nav2_params.yaml
bt_navigator:
  ros__parameters:
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    default_bt_xml_filename: "navigate_w_replanning_and_recovery.xml"

controller_server:
  ros__parameters:
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    controller_plugins: ["FollowPath"]

    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      max_vel_x: 0.5
      max_vel_theta: 1.0
      min_vel_x: 0.0

planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: true
```

## Costmaps

Costmaps represent the environment as a 2D grid where each cell has a cost value.

### Costmap Layers

```yaml
global_costmap:
  ros__parameters:
    update_frequency: 1.0
    publish_frequency: 1.0
    global_frame: map
    robot_base_frame: base_link
    plugins: ["static_layer", "obstacle_layer", "inflation_layer"]

    static_layer:
      plugin: "nav2_costmap_2d::StaticLayer"
      map_subscribe_transient_local: True

    obstacle_layer:
      plugin: "nav2_costmap_2d::ObstacleLayer"
      observation_sources: scan
      scan:
        topic: /scan
        max_obstacle_height: 2.0
        clearing: True
        marking: True

    inflation_layer:
      plugin: "nav2_costmap_2d::InflationLayer"
      cost_scaling_factor: 3.0
      inflation_radius: 0.55
```

## Sending Navigation Goals

### Using Python

```python
from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped
import rclpy

def main():
    rclpy.init()
    navigator = BasicNavigator()

    # Wait for Nav2 to be active
    navigator.waitUntilNav2Active()

    # Create goal pose
    goal_pose = PoseStamped()
    goal_pose.header.frame_id = 'map'
    goal_pose.header.stamp = navigator.get_clock().now().to_msg()
    goal_pose.pose.position.x = 2.0
    goal_pose.pose.position.y = 1.0
    goal_pose.pose.orientation.w = 1.0

    # Navigate to goal
    navigator.goToPose(goal_pose)

    # Monitor progress
    while not navigator.isTaskComplete():
        feedback = navigator.getFeedback()
        if feedback:
            print(f'Distance remaining: {feedback.distance_remaining:.2f}m')

    result = navigator.getResult()
    if result == TaskResult.SUCCEEDED:
        print('Goal reached!')
    elif result == TaskResult.CANCELED:
        print('Goal canceled!')
    else:
        print('Goal failed!')

    rclpy.shutdown()
```

### Waypoint Following

```python
def follow_waypoints(navigator, waypoints):
    """Navigate through a list of waypoints"""
    goal_poses = []

    for wp in waypoints:
        pose = PoseStamped()
        pose.header.frame_id = 'map'
        pose.header.stamp = navigator.get_clock().now().to_msg()
        pose.pose.position.x = wp['x']
        pose.pose.position.y = wp['y']
        pose.pose.orientation.w = 1.0
        goal_poses.append(pose)

    navigator.followWaypoints(goal_poses)

    while not navigator.isTaskComplete():
        feedback = navigator.getFeedback()
        print(f'Executing waypoint {feedback.current_waypoint + 1}/{len(waypoints)}')

# Example waypoints
waypoints = [
    {'x': 1.0, 'y': 0.0},
    {'x': 2.0, 'y': 1.0},
    {'x': 0.0, 'y': 2.0},
    {'x': 0.0, 'y': 0.0}  # Return home
]
```

## Behavior Trees

Nav2 uses behavior trees for flexible navigation logic.

### Example Behavior Tree

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <RecoveryNode number_of_retries="3">
      <PipelineSequence>
        <ComputePathToPose goal="{goal}" path="{path}"/>
        <FollowPath path="{path}"/>
      </PipelineSequence>
      <RecoveryActions>
        <ClearEntireCostmap service_name="/global_costmap/clear"/>
        <Spin spin_dist="1.57"/>
        <Wait wait_duration="2"/>
        <BackUp backup_dist="0.3" backup_speed="0.1"/>
      </RecoveryActions>
    </RecoveryNode>
  </BehaviorTree>
</root>
```

## Localization with AMCL

Adaptive Monte Carlo Localization for robot pose estimation:

```yaml
amcl:
  ros__parameters:
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    base_frame_id: "base_footprint"
    global_frame_id: "map"
    laser_model_type: "likelihood_field"
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    robot_model_type: "nav2_amcl::DifferentialMotionModel"
    scan_topic: scan
    set_initial_pose: true
    initial_pose:
      x: 0.0
      y: 0.0
      yaw: 0.0
```

## Dynamic Obstacle Avoidance

The controller handles real-time obstacle avoidance:

```python
class SafetyMonitor(Node):
    def __init__(self):
        super().__init__('safety_monitor')
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.min_distance = 0.3

    def scan_callback(self, msg):
        min_range = min(msg.ranges)
        if min_range < self.min_distance:
            # Emergency stop
            stop_cmd = Twist()
            self.cmd_pub.publish(stop_cmd)
            self.get_logger().warn(f'Emergency stop! Obstacle at {min_range:.2f}m')
```

## Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Robot not moving | Costmap inflation too high | Reduce inflation radius |
| Oscillation | Controller gains too high | Tune DWB parameters |
| Path not found | Obstacles blocking all paths | Check costmap, add recovery |
| Poor localization | Sensor noise | Tune AMCL parameters |

## Summary

- **Nav2** provides complete autonomous navigation for ROS 2 robots
- **Costmaps** represent the environment for planning and obstacle avoidance
- **Planners** compute global paths using algorithms like A* or NavFn
- **Controllers** execute paths while avoiding dynamic obstacles
- **Behavior trees** enable flexible, recoverable navigation logic
- **AMCL** provides probabilistic localization on a known map


## Check Your Understanding

:::note Question 1
What does the Navigation 2 (Nav2) stack in ROS 2 provide?
A) Path planning and execution
B) Obstacle avoidance
C) Localization
D) All of the above
**Answer**: D) All of the above
:::

:::note Question 2
How does Nav2 represent the environment for planning and obstacle avoidance?
A) With costmaps
B) With planners
C) With controllers
D) With behavior trees
**Answer**: A) With costmaps
:::

:::note Question 3
What is the purpose of planners in the Nav2 architecture?
A) They represent the environment for planning and obstacle avoidance
B) They compute global paths using algorithms like A* or NavFn
C) They execute paths while avoiding dynamic obstacles
D) They provide probabilistic localization on a known map
**Answer**: B) They compute global paths using algorithms like A* or NavFn
:::

:::note Question 4
What is the role of behavior trees in Nav2?
A) They represent the environment for planning and obstacle avoidance
B) They compute global paths using algorithms like A* or NavFn
C) They execute paths while avoiding dynamic obstacles
D) They enable flexible, recoverable navigation logic
**Answer**: D) They enable flexible, recoverable navigation logic
:::

:::note Question 5
What does Adaptive Monte Carlo Localization (AMCL) provide in Nav2?
A) Path planning and execution
B) Obstacle avoidance
C) Probabilistic localization on a known map
D) Flexible, recoverable navigation logic
**Answer**: C) Probabilistic localization on a known map
:::