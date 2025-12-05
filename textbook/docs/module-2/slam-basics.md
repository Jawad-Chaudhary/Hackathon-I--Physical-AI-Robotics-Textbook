---
sidebar_position: 5
---

# SLAM Basics

Learn Simultaneous Localization and Mapping - building maps while tracking robot position.

## What is SLAM?

**SLAM** solves the chicken-and-egg problem:
- To map, you need to know where you are
- To localize, you need a map

SLAM does **both simultaneously**:
1. **Localization** - Where am I?
2. **Mapping** - What does the environment look like?

## Why SLAM Matters

SLAM enables:
- ✅ Autonomous navigation in unknown environments
- ✅ Long-term operation without GPS
- ✅ 3D reconstruction
- ✅ AR/VR applications

## SLAM Types

### Visual SLAM (vSLAM)
- Uses cameras
- Examples: ORB-SLAM, RTAB-Map
- Rich information but computationally expensive

### LiDAR SLAM
- Uses laser scanners
- Examples: Cartographer, LOAM
- Precise but limited to geometry

### RGB-D SLAM
- Uses depth cameras
- Examples: RTAB-Map, ElasticFusion
- Good balance of information and cost

## SLAM Components

### Frontend (Data Association)
- Feature extraction
- Data association
- Motion estimation

### Backend (Optimization)
- Graph optimization
- Loop closure detection
- Map refinement

## Using Google Cartographer

### Installation

```bash
sudo apt install ros-humble-cartographer
sudo apt install ros-humble-cartographer-ros
```

### Launch Cartographer

```bash
# Start 2D SLAM
ros2 launch cartographer_ros demo_backpack_2d.launch.py

# Start 3D SLAM
ros2 launch cartographer_ros demo_backpack_3d.launch.py
```

### Configuration File

```lua
-- cartographer_config.lua
include "map_builder.lua"
include "trajectory_builder.lua"

options = {
  map_builder = MAP_BUILDER,
  trajectory_builder = TRAJECTORY_BUILDER,
  map_frame = "map",
  tracking_frame = "base_link",
  published_frame = "odom",
  odom_frame = "odom",
  provide_odom_frame = false,
  publish_frame_projected_to_2d = true,
  use_odometry = true,
  use_nav_sat = false,
  use_landmarks = false,
  num_laser_scans = 1,
  num_multi_echo_laser_scans = 0,
  num_subdivisions_per_laser_scan = 1,
  num_point_clouds = 0,
  lookup_transform_timeout_sec = 0.2,
  submap_publish_period_sec = 0.3,
  pose_publish_period_sec = 5e-3,
  trajectory_publish_period_sec = 30e-3,
}

TRAJECTORY_BUILDER_2D.use_imu_data = false
TRAJECTORY_BUILDER_2D.min_range = 0.3
TRAJECTORY_BUILDER_2D.max_range = 8.0

return options
```

## RTAB-Map (RGB-D SLAM)

### Installation

```bash
sudo apt install ros-humble-rtabmap-ros
```

### Launch with RealSense

```bash
ros2 launch rtabmap_ros rtabmap.launch.py \
    rtabmap_args:="--delete_db_on_start" \
    depth_topic:=/camera/depth/image_rect_raw \
    rgb_topic:=/camera/color/image_raw \
    camera_info_topic:=/camera/color/camera_info \
    frame_id:=camera_link \
    approx_sync:=false
```

### Creating a Map

```bash
# 1. Launch camera
ros2 launch realsense2_camera rs_launch.py

# 2. Launch RTAB-Map
ros2 launch rtabmap_ros rtabmap.launch.py

# 3. Move robot to build map (teleoperate or autonomous)
ros2 run teleop_twist_keyboard teleop_twist_keyboard

# 4. Save map
ros2 service call /rtabmap/trigger_new_map std_srvs/srv/Empty
```

## Loop Closure Detection

Recognize previously visited locations:

```python
import cv2
import numpy as np

class LoopClosureDetector:
    def __init__(self):
        self.keyframes = []  # Store keyframe features
        self.threshold = 0.7  # Similarity threshold

    def add_keyframe(self, image):
        """Extract and store features from keyframe"""
        orb = cv2.ORB_create()
        kp, desc = orb.detectAndCompute(image, None)

        self.keyframes.append({
            'image': image,
            'descriptors': desc,
            'keypoints': kp
        })

    def detect_loop_closure(self, current_image):
        """Check if current location matches any keyframe"""
        orb = cv2.ORB_create()
        kp_cur, desc_cur = orb.detectAndCompute(current_image, None)

        if desc_cur is None:
            return None

        # Compare with all keyframes
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

        for idx, kf in enumerate(self.keyframes):
            if kf['descriptors'] is None:
                continue

            matches = bf.match(kf['descriptors'], desc_cur)
            matches = sorted(matches, key=lambda x: x.distance)

            # Calculate match score
            good_matches = [m for m in matches if m.distance < 50]
            score = len(good_matches) / max(len(matches), 1)

            if score > self.threshold:
                return {
                    'keyframe_idx': idx,
                    'score': score,
                    'matches': good_matches
                }

        return None
```

## Pose Graph Optimization

```python
import g2o
import numpy as np

class PoseGraphOptimizer:
    def __init__(self):
        self.optimizer = g2o.SparseOptimizer()
        solver = g2o.BlockSolverSE3(g2o.LinearSolverCholmodSE3())
        solver = g2o.OptimizationAlgorithmLevenberg(solver)
        self.optimizer.set_algorithm(solver)

    def add_vertex(self, vertex_id, pose):
        """Add a pose vertex"""
        v = g2o.VertexSE3()
        v.set_id(vertex_id)
        v.set_estimate(g2o.SE3Quat(pose[:3, :3], pose[:3, 3]))

        if vertex_id == 0:
            v.set_fixed(True)  # Fix first pose

        self.optimizer.add_vertex(v)

    def add_edge(self, vertex_ids, measurement, information):
        """Add an edge between two vertices"""
        edge = g2o.EdgeSE3()
        edge.set_vertex(0, self.optimizer.vertex(vertex_ids[0]))
        edge.set_vertex(1, self.optimizer.vertex(vertex_ids[1]))
        edge.set_measurement(g2o.SE3Quat(measurement[:3, :3], measurement[:3, 3]))
        edge.set_information(information)

        self.optimizer.add_edge(edge)

    def optimize(self, iterations=20):
        """Run optimization"""
        self.optimizer.initialize_optimization()
        self.optimizer.optimize(iterations)

    def get_pose(self, vertex_id):
        """Get optimized pose"""
        v = self.optimizer.vertex(vertex_id)
        return v.estimate().matrix()
```

## Occupancy Grid Mapping

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import OccupancyGrid
import numpy as np

class OccupancyGridMapper(Node):
    def __init__(self):
        super().__init__('occupancy_grid_mapper')

        # Grid parameters
        self.resolution = 0.05  # meters per cell
        self.width = 200  # cells
        self.height = 200
        self.origin_x = -5.0  # meters
        self.origin_y = -5.0

        # Initialize grid (unknown = -1, free = 0, occupied = 100)
        self.grid = np.full((self.height, self.width), -1, dtype=np.int8)

        # Publishers
        self.map_pub = self.create_publisher(OccupancyGrid, '/map', 10)

        # Subscribers
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )

        self.timer = self.create_timer(1.0, self.publish_map)

    def scan_callback(self, msg):
        """Update grid from laser scan"""
        for i, range_val in enumerate(msg.ranges):
            if range_val < msg.range_min or range_val > msg.range_max:
                continue

            # Calculate angle
            angle = msg.angle_min + i * msg.angle_increment

            # Calculate endpoint in grid coordinates
            x = range_val * np.cos(angle)
            y = range_val * np.sin(angle)

            # Convert to grid indices
            grid_x = int((x - self.origin_x) / self.resolution)
            grid_y = int((y - self.origin_y) / self.resolution)

            if 0 <= grid_x < self.width and 0 <= grid_y < self.height:
                # Mark as occupied
                self.grid[grid_y, grid_x] = 100

                # Trace ray and mark free space
                self.bresenham_line(0, 0, grid_x, grid_y)

    def bresenham_line(self, x0, y0, x1, y1):
        """Trace line and mark cells as free"""
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy

        while True:
            # Mark as free (if not already occupied)
            if 0 <= x0 < self.width and 0 <= y0 < self.height:
                if self.grid[y0, x0] != 100:
                    self.grid[y0, x0] = 0

            if x0 == x1 and y0 == y1:
                break

            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x0 += sx
            if e2 < dx:
                err += dx
                y0 += sy

    def publish_map(self):
        """Publish occupancy grid"""
        msg = OccupancyGrid()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'map'

        msg.info.resolution = self.resolution
        msg.info.width = self.width
        msg.info.height = self.height
        msg.info.origin.position.x = self.origin_x
        msg.info.origin.position.y = self.origin_y

        msg.data = self.grid.flatten().tolist()

        self.map_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = OccupancyGridMapper()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Visualizing SLAM in RViz

```bash
rviz2

# Add these displays:
# 1. Map - Topic: /map
# 2. LaserScan - Topic: /scan
# 3. RobotModel
# 4. TF - Shows coordinate frames
# 5. Path - Topic: /trajectory
```

## Evaluating SLAM Performance

### Metrics

1. **Absolute Trajectory Error (ATE)**
   - Compares estimated vs ground truth trajectory

2. **Relative Pose Error (RPE)**
   - Measures drift over time

3. **Map Quality**
   - Consistency, completeness, accuracy

### Benchmark Datasets

- **TUM RGB-D** - Indoor RGB-D sequences
- **KITTI** - Outdoor driving scenarios
- **EuRoC MAV** - Micro aerial vehicle

## Best Practices

1. **Sensor calibration** - Critical for accuracy
2. **Loop closure** - Reduces drift
3. **Keyframe selection** - Balance accuracy vs speed
4. **Robust features** - Handle lighting/viewpoint changes
5. **Multi-threading** - Separate tracking and mapping

---

:::tip Module 2 Complete!
Congratulations! You've learned robot perception. Continue to **[Module 3: Motion and Control](/docs/module-3/intro)** for navigation and control systems.
:::


## Check Your Understanding

:::note Question 1
What is SLAM?
A) A type of robot navigation system
B) A method for building maps and tracking robot position simultaneously
C) A programming language for robotics
D) A type of sensor used in robotics
**Answer**: B

:::note Question 2
Why does SLAM matter?
A) It enables autonomous navigation in unknown environments
B) It works as a GPS system for robots
C) It improves the battery life of robots
D) It makes robots move faster
**Answer**: A

:::note Question 3
What are the components of SLAM?
A) Frontend (Data Association) and Backend (Optimization)
B) Hardware and Software
C) Sensors and Actuators
D) Cameras and Microphones
**Answer**: A

:::note Question 4
What does the Loop Closure Detection do in the context of SLAM?
A) It checks if the current location matches any keyframe
B) It calculates the total distance travelled by the robot
C) It checks if the robot has returned to its starting position
D) It calculates the time taken for the robot to complete a loop
**Answer**: A

:::note Question 5
What is one of the best practices in SLAM?
A) Ignoring sensor calibration
B) Avoiding loop closure
C) Selecting as many keyframes as possible
D) Balancing accuracy and speed through keyframe selection
**Answer**: D