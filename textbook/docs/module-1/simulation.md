---
sidebar_position: 4
---

# Simulation with Gazebo

Learn to test your robotics code in a virtual environment before deploying to real hardware.

## Why Simulation?

Simulation offers several advantages:

- ✅ **Safe testing** - No risk of damaging hardware
- ✅ **Rapid iteration** - Test code changes immediately
- ✅ **Reproducible environments** - Consistent testing conditions
- ✅ **Cost-effective** - No need for physical robots during development
- ✅ **Parallel testing** - Run multiple simulations simultaneously

## What is Gazebo?

**Gazebo** (now **Ignition Gazebo**) is a 3D robot simulator that provides:
- Physics engine for realistic motion
- Sensor simulation (cameras, LiDAR, IMU)
- Rendering engine for visualization
- Plugin system for custom behaviors

## Installing Gazebo

```bash
# Install Gazebo Garden (compatible with ROS 2 Humble)
sudo apt install ros-humble-ros-gz

# Install additional packages
sudo apt install ros-humble-gazebo-ros-pkgs
```

### Verify Installation

```bash
# Launch Gazebo
gazebo
```

You should see an empty world with a ground plane.

## Your First Gazebo World

Create a simple world file `my_world.sdf`:

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="my_world">

    <!-- Lighting -->
    <light type="directional" name="sun">
      <pose>0 0 10 0 0 0</pose>
      <diffuse>1 1 1 1</diffuse>
      <specular>0.5 0.5 0.5 1</specular>
      <attenuation>
        <range>1000</range>
      </attenuation>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.8 0.8 0.8 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <!-- Add a simple box -->
    <model name="box">
      <pose>0 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
          </material>
        </visual>
        <inertial>
          <mass>1.0</mass>
        </inertial>
      </link>
    </model>

  </world>
</sdf>
```

Launch your world:

```bash
gazebo my_world.sdf
```

## Simulating a Robot

Let's create a simple differential drive robot:

```xml
<?xml version="1.0"?>
<sdf version="1.8">
  <model name="simple_robot">

    <!-- Robot base -->
    <link name="base_link">
      <pose>0 0 0.1 0 0 0</pose>
      <inertial>
        <mass>5.0</mass>
      </inertial>
      <collision name="collision">
        <geometry>
          <box>
            <size>0.4 0.3 0.1</size>
          </box>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <box>
            <size>0.4 0.3 0.1</size>
          </box>
        </geometry>
        <material>
          <ambient>0 0 1 1</ambient>
        </material>
      </visual>
    </link>

    <!-- Left wheel -->
    <link name="left_wheel">
      <pose>0.1 0.2 0.1 -1.5707 0 0</pose>
      <inertial>
        <mass>0.5</mass>
      </inertial>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
        <material>
          <ambient>0.3 0.3 0.3 1</ambient>
        </material>
      </visual>
    </link>

    <!-- Right wheel -->
    <link name="right_wheel">
      <pose>0.1 -0.2 0.1 -1.5707 0 0</pose>
      <inertial>
        <mass>0.5</mass>
      </inertial>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
        <material>
          <ambient>0.3 0.3 0.3 1</ambient>
        </material>
      </visual>
    </link>

    <!-- Left wheel joint -->
    <joint name="left_wheel_joint" type="revolute">
      <parent>base_link</parent>
      <child>left_wheel</child>
      <axis>
        <xyz>0 0 1</xyz>
      </axis>
    </joint>

    <!-- Right wheel joint -->
    <joint name="right_wheel_joint" type="revolute">
      <parent>base_link</parent>
      <child>right_wheel</child>
      <axis>
        <xyz>0 0 1</xyz>
      </axis>
    </joint>

    <!-- Differential drive plugin -->
    <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
      <ros>
        <namespace>/</namespace>
      </ros>
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.4</wheel_separation>
      <wheel_diameter>0.2</wheel_diameter>
      <max_wheel_torque>20</max_wheel_torque>
      <command_topic>cmd_vel</command_topic>
      <odometry_topic>odom</odometry_topic>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_link</robot_base_frame>
      <publish_odom>true</publish_odom>
      <publish_odom_tf>true</publish_odom_tf>
      <publish_wheel_tf>false</publish_wheel_tf>
    </plugin>

  </model>
</sdf>
```

## Adding Sensors

### Camera Sensor

Add this inside the `base_link`:

```xml
<sensor name="camera" type="camera">
  <pose>0.2 0 0.15 0 0 0</pose>
  <camera>
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>640</width>
      <height>480</height>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
  </camera>
  <always_on>1</always_on>
  <update_rate>30</update_rate>
  <visualize>true</visualize>
  <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
    <ros>
      <namespace>/robot</namespace>
    </ros>
    <camera_name>camera</camera_name>
    <frame_name>camera_link</frame_name>
  </plugin>
</sensor>
```

### LiDAR Sensor

```xml
<sensor name="lidar" type="ray">
  <pose>0 0 0.2 0 0 0</pose>
  <ray>
    <scan>
      <horizontal>
        <samples>360</samples>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>10.0</max>
    </range>
  </ray>
  <always_on>1</always_on>
  <update_rate>10</update_rate>
  <visualize>true</visualize>
  <plugin name="laser_controller" filename="libgazebo_ros_ray_sensor.so">
    <ros>
      <namespace>/robot</namespace>
    </ros>
    <output_type>sensor_msgs/LaserScan</output_type>
    <frame_name>lidar_link</frame_name>
  </plugin>
</sensor>
```

## Controlling the Simulated Robot

You can now control your simulated robot using the same ROS 2 commands:

```bash
# Move forward
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}, angular: {z: 0.0}}"

# Turn in place
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.0}, angular: {z: 0.5}}"

# View camera output
ros2 run rqt_image_view rqt_image_view /robot/camera/image_raw

# View LiDAR data
ros2 topic echo /robot/scan
```

## Launch Files for Simulation

Create a launch file `gazebo_sim.launch.py`:

```python
from launch import LaunchDescription
from launch.actions import ExecuteProcess
from launch_ros.actions import Node
import os

def generate_launch_description():
    # Path to world file
    world_file = os.path.join(
        os.getcwd(),
        'worlds',
        'my_world.sdf'
    )

    return LaunchDescription([
        # Launch Gazebo with world
        ExecuteProcess(
            cmd=['gazebo', '--verbose', world_file, '-s', 'libgazebo_ros_factory.so'],
            output='screen'
        ),

        # Spawn robot
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=[
                '-entity', 'simple_robot',
                '-file', 'models/simple_robot.sdf',
                '-x', '0',
                '-y', '0',
                '-z', '0.1'
            ],
            output='screen'
        ),

        # Launch teleoperation
        Node(
            package='teleop_twist_keyboard',
            executable='teleop_twist_keyboard',
            name='teleop',
            prefix='xterm -e',
            output='screen'
        ),
    ])
```

Run the launch file:

```bash
ros2 launch my_package gazebo_sim.launch.py
```

## Testing Your Controllers

Now you can test the controllers you developed earlier in simulation:

```bash
# Terminal 1: Launch simulation
ros2 launch my_package gazebo_sim.launch.py

# Terminal 2: Run your obstacle avoider
ros2 run my_package obstacle_avoider
```

The robot will use simulated sensor data and move in the virtual environment!

## Visualization with RViz

RViz is ROS 2's 3D visualization tool. Launch it alongside Gazebo:

```bash
rviz2
```

Add displays for:
- **RobotModel** - View robot structure
- **Camera** - See camera feed
- **LaserScan** - Visualize LiDAR data
- **TF** - View coordinate frames

## Best Practices

1. **Start simple** - Test with basic worlds before adding complexity
2. **Match reality** - Use realistic physics parameters
3. **Version control your models** - Keep SDF/URDF files in Git
4. **Use namespaces** - Avoid topic name conflicts with multiple robots
5. **Monitor performance** - Simulation should run at real-time or faster

## Common Issues

### Simulation Runs Slowly
- Reduce model complexity
- Lower sensor update rates
- Use simpler physics engine settings

### Robot Falls Through Ground
- Check collision geometry
- Verify inertial properties
- Ensure ground plane is static

### Sensors Not Publishing
- Check plugin configuration
- Verify topic names with `ros2 topic list`
- Ensure `always_on` is set to true

---

:::tip Module Complete!
Congratulations! You've completed Module 1. You now understand ROS 2 nodes, sensors, actuators, and simulation. Ready for more? Check out **Module 2: Perception Systems** (coming soon).
:::


## Check Your Understanding

:::note Question 1
What are the advantages of simulation in robotics?
A) Safe testing and cost-effective development
B) Rapid iteration and parallel testing
C) Reproducible environments and no risk of damaging hardware
D) All of the above
**Answer**: D) All of the above

:::note Question 2
What is Gazebo used for in robotics?
A) It's a 3D robot simulator with physics engine for realistic motion
B) It's a tool for rendering robot visualization
C) It's a sensor simulator (cameras, LiDAR, IMU)
D) All of the above
**Answer**: D) All of the above

:::note Question 3
In the context of Gazebo robotic simulation, what is the purpose of a launch file?
A) To perform software updates for the Gazebo simulator
B) To create a new robot model in Gazebo
C) To start the Gazebo simulator and spawn the robot entity in the simulated world
D) To close the Gazebo simulator
**Answer**: C) To start the Gazebo simulator and spawn the robot entity in the simulated world

:::note Question 4
What can be done when a simulated robot falls through the ground in Gazebo?
A) Check collision geometry
B) Verify inertial properties
C) Ensure ground plane is static
D) All of the above
**Answer**: D) All of the above

:::note Question 5
What are some best practices in Gazebo simulation?
A) Start testing with complex worlds
B) Use unrealistic physics parameters
C) Keep SDF/URDF files in Git for version control
D) Avoid using namespaces to prevent topic name conflicts
**Answer**: C) Keep SDF/URDF files in Git for version control
