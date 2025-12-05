---
sidebar_position: 4
---

# Depth Perception and 3D Vision

Learn to work with depth sensors and create 3D representations of the environment for robot navigation.

## Why Depth Perception?

2D images lack scale and distance information. Depth perception enables:
- **Obstacle avoidance** - Know distances to objects
- **3D reconstruction** - Build environmental models
- **Grasping** - Estimate object pose and size
- **Navigation** - Map and localize in 3D space

## Depth Sensing Technologies

### Stereo Vision
- Two cameras (like human eyes)
- Calculate depth from disparity
- Works outdoors, requires good lighting

### Time-of-Flight (ToF)
- Measures light travel time
- Examples: Microsoft Kinect, PMD sensors
- Works in moderate lighting

### Structured Light
- Projects pattern, analyzes distortion
- Examples: Intel RealSense D400 series
- High accuracy, indoors only

### LiDAR
- Laser-based ranging
- Long range (100+ meters)
- Expensive but precise

## Working with Depth Cameras

### Intel RealSense Setup

```bash
# Install RealSense SDK
sudo apt install ros-humble-realsense2-camera

# Launch camera
ros2 launch realsense2_camera rs_launch.py
```

### Reading Depth Images

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class DepthProcessor(Node):
    def __init__(self):
        super().__init__('depth_processor')

        self.bridge = CvBridge()

        # Subscribe to depth image
        self.depth_sub = self.create_subscription(
            Image,
            '/camera/depth/image_rect_raw',
            self.depth_callback,
            10
        )

        # Subscribe to RGB image
        self.rgb_sub = self.create_subscription(
            Image,
            '/camera/color/image_raw',
            self.rgb_callback,
            10
        )

        self.latest_rgb = None

    def rgb_callback(self, msg):
        self.latest_rgb = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

    def depth_callback(self, msg):
        # Convert depth image (values in mm)
        depth_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='passthrough')

        # Convert to meters
        depth_m = depth_image / 1000.0

        # Apply colormap for visualization
        depth_colormap = cv2.applyColorMap(
            cv2.convertScaleAbs(depth_image, alpha=0.03),
            cv2.COLORMAP_JET
        )

        # Display depth statistics
        valid_depths = depth_m[depth_m > 0]
        if len(valid_depths) > 0:
            min_depth = np.min(valid_depths)
            max_depth = np.max(valid_depths)
            mean_depth = np.mean(valid_depths)

            self.get_logger().info(
                f'Depth - Min: {min_depth:.2f}m, Max: {max_depth:.2f}m, Mean: {mean_depth:.2f}m'
            )

        # Overlay depth on RGB if available
        if self.latest_rgb is not None:
            overlay = cv2.addWeighted(self.latest_rgb, 0.6, depth_colormap, 0.4, 0)
            cv2.imshow('RGB-D Overlay', overlay)
            cv2.waitKey(1)

def main(args=None):
    rclpy.init(args=args)
    node = DepthProcessor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Point Cloud Generation

### Creating Point Clouds from RGB-D

```python
import open3d as o3d
import numpy as np

def create_point_cloud(rgb_image, depth_image, intrinsics):
    """
    Convert RGB-D images to point cloud

    Args:
        rgb_image: (H, W, 3) RGB image
        depth_image: (H, W) depth in meters
        intrinsics: Camera intrinsic parameters
    """
    height, width = depth_image.shape
    fx, fy = intrinsics['fx'], intrinsics['fy']
    cx, cy = intrinsics['cx'], intrinsics['cy']

    # Create coordinate grids
    u = np.arange(width)
    v = np.arange(height)
    u, v = np.meshgrid(u, v)

    # Convert to 3D coordinates
    Z = depth_image
    X = (u - cx) * Z / fx
    Y = (v - cy) * Z / fy

    # Stack coordinates
    points = np.stack([X, Y, Z], axis=-1)

    # Filter invalid points
    valid_mask = (Z > 0) & (Z < 10.0)  # Valid depth range
    points = points[valid_mask]
    colors = rgb_image[valid_mask] / 255.0  # Normalize to [0, 1]

    # Create Open3D point cloud
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    pcd.colors = o3d.utility.Vector3dVector(colors)

    return pcd

# Usage
intrinsics = {
    'fx': 615.0,
    'fy': 615.0,
    'cx': 320.0,
    'cy': 240.0
}

pcd = create_point_cloud(rgb_img, depth_img, intrinsics)

# Visualize
o3d.visualization.draw_geometries([pcd])

# Save
o3d.io.write_point_cloud("scene.pcd", pcd)
```

## Point Cloud Processing

### Downsampling (Voxel Grid)

```python
# Reduce point cloud size while preserving structure
voxel_size = 0.02  # 2cm voxels
downsampled = pcd.voxel_down_sample(voxel_size)

print(f"Original: {len(pcd.points)} points")
print(f"Downsampled: {len(downsampled.points)} points")
```

### Outlier Removal

```python
# Statistical outlier removal
cl, ind = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
clean_pcd = pcd.select_by_index(ind)

# Radius outlier removal
cl, ind = pcd.remove_radius_outlier(nb_points=16, radius=0.05)
clean_pcd = pcd.select_by_index(ind)
```

### Plane Segmentation (RANSAC)

```python
# Find dominant plane (e.g., floor or wall)
plane_model, inliers = pcd.segment_plane(
    distance_threshold=0.01,
    ransac_n=3,
    num_iterations=1000
)

[a, b, c, d] = plane_model
print(f"Plane equation: {a:.2f}x + {b:.2f}y + {c:.2f}z + {d:.2f} = 0")

# Extract plane and objects
plane_cloud = pcd.select_by_index(inliers)
object_cloud = pcd.select_by_index(inliers, invert=True)

# Visualize
plane_cloud.paint_uniform_color([0, 1, 0])  # Green
object_cloud.paint_uniform_color([1, 0, 0])  # Red
o3d.visualization.draw_geometries([plane_cloud, object_cloud])
```

### Clustering (DBSCAN)

```python
# Segment individual objects
labels = np.array(object_cloud.cluster_dbscan(eps=0.02, min_points=10))

max_label = labels.max()
print(f"Found {max_label + 1} objects")

# Color each cluster differently
colors = plt.get_cmap("tab20")(labels / (max_label + 1 if max_label > 0 else 1))
colors[labels < 0] = 0  # Noise points in black
object_cloud.colors = o3d.utility.Vector3dVector(colors[:, :3])

o3d.visualization.draw_geometries([object_cloud])
```

## 3D Object Detection

### Bounding Box Estimation

```python
def get_bounding_boxes(point_cloud, labels):
    """Extract oriented bounding boxes for each cluster"""
    boxes = []

    for label in np.unique(labels):
        if label < 0:  # Skip noise
            continue

        # Extract cluster
        cluster_points = point_cloud.select_by_index(np.where(labels == label)[0])

        # Compute oriented bounding box
        obb = cluster_points.get_oriented_bounding_box()
        obb.color = (1, 0, 0)

        boxes.append(obb)

    return boxes

# Usage
boxes = get_bounding_boxes(object_cloud, labels)
o3d.visualization.draw_geometries([object_cloud] + boxes)
```

## ROS 2 Point Cloud Processing

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2
import sensor_msgs_py.point_cloud2 as pc2
import numpy as np

class PointCloudProcessor(Node):
    def __init__(self):
        super().__init__('pointcloud_processor')

        self.subscription = self.create_subscription(
            PointCloud2,
            '/camera/depth/color/points',
            self.pointcloud_callback,
            10
        )

    def pointcloud_callback(self, msg):
        # Convert to numpy array
        points = []
        for point in pc2.read_points(msg, field_names=("x", "y", "z", "rgb"), skip_nans=True):
            points.append([point[0], point[1], point[2]])

        points = np.array(points)

        # Filter by distance
        distances = np.linalg.norm(points, axis=1)
        close_points = points[distances < 2.0]  # Within 2 meters

        self.get_logger().info(f"Detected {len(close_points)} nearby points")

        # Find closest point
        if len(close_points) > 0:
            closest_idx = np.argmin(distances[distances < 2.0])
            closest_point = close_points[closest_idx]
            self.get_logger().info(f"Closest obstacle at: {closest_point}")

def main(args=None):
    rclpy.init(args=args)
    node = PointCloudProcessor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Depth Completion

Fill missing depth values:

```python
def complete_depth(depth_image):
    """Fill holes in depth image using inpainting"""
    # Create mask of invalid pixels
    mask = (depth_image == 0).astype(np.uint8)

    # Inpaint missing regions
    completed = cv2.inpaint(depth_image, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    return completed
```

## Stereo Depth Estimation

```python
# Create stereo matcher
stereo = cv2.StereoBM_create(numDisparities=16*10, blockSize=15)

# Compute disparity
disparity = stereo.compute(left_gray, right_gray)

# Convert to depth (meters)
focal_length = 615  # pixels
baseline = 0.05  # meters (distance between cameras)
depth = (focal_length * baseline) / (disparity + 1e-6)
```

## Performance Tips

1. **Downsample before processing** - Reduce point count
2. **Use GPU acceleration** - CUDA for Open3D operations
3. **Limit range** - Process only relevant depth range
4. **Async processing** - Don't block main thread
5. **Cache intrinsics** - Don't recalculate each frame

---

:::tip What's Next?
Learn **[SLAM Basics](./slam-basics)** to build maps while localizing your robot.
:::


## Check Your Understanding

:::note Question 1
What are the benefits of depth perception in robotics?
A) Obstacle avoidance and 3D reconstruction
B) Only grasping and navigation
C) Only obstacle avoidance and navigation
D) None of these
**Answer**: A

:::note Question 2
Which depth sensing technology works outdoors and requires good lighting?
A) Time-of-Flight (ToF)
B) Structured Light
C) LiDAR
D) Stereo Vision
**Answer**: D

:::note Question 3
What is the purpose of downsampling in point cloud processing?
A) Increase point cloud size
B) Preserve structure
C) Reduce point cloud size while preserving structure
D) None of these
**Answer**: C

:::note Question 4
What does the function `get_bounding_boxes(point_cloud, labels)` return?
A) Oriented bounding boxes for each cluster in the point cloud
B) Raw sensor data
C) An array of depth images
D) A 3D model of the environment
**Answer**: A

:::note Question 5
What does the depth completion process aim to do?
A) Detect objects within a certain range
B) Fill missing depth values in a depth image
C) Create a 3D model of the environment
D) Generate a disparity map from stereo images
**Answer**: B
