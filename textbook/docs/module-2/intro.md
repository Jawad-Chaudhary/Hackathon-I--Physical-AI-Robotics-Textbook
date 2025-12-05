---
sidebar_position: 1
---

# Introduction to Robot Perception

Welcome to Module 2! Learn how robots see and understand their environment using computer vision and sensor processing.

## What is Robot Perception?

**Perception** is the ability of robots to interpret sensory data to understand their surroundings. This includes:

- 👁️ **Vision** - Processing camera images
- 📏 **Depth sensing** - Understanding 3D structure
- 🗺️ **Mapping** - Building environmental models
- 🎯 **Object recognition** - Identifying and locating objects

## Why Perception Matters

Without perception, robots are blind. Good perception enables:
- Autonomous navigation
- Object manipulation
- Human-robot interaction
- Environmental understanding
- Adaptive behavior

## Module Overview

###Chapter 1: Image Processing Fundamentals
Learn the basics of digital image processing, filtering, and feature extraction.

### Chapter 2: Object Detection
Detect and locate objects in images using classical and deep learning methods.

### Chapter 3: Depth Perception
Work with 3D sensors and create depth maps for spatial understanding.

### Chapter 4: SLAM Basics
Simultaneous Localization and Mapping - building maps while tracking robot position.

## Prerequisites

- Completion of Module 1
- Python programming with NumPy
- Basic linear algebra (vectors, matrices)
- Understanding of coordinate systems

## Setting Up Vision Tools

### Install OpenCV

```bash
pip install opencv-python opencv-contrib-python
```

### Install ROS 2 Vision Packages

```bash
sudo apt install ros-humble-cv-bridge
sudo apt install ros-humble-image-transport
sudo apt install ros-humble-vision-opencv
sudo apt install ros-humble-camera-calibration
```

### Install Deep Learning Frameworks

```bash
# PyTorch (recommended for robotics)
pip install torch torchvision

# Or TensorFlow
pip install tensorflow
```

### Verify Installation

```python
import cv2
import numpy as np
import torch

print(f"OpenCV: {cv2.__version__}")
print(f"NumPy: {np.__version__}")
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
```

## The Perception Pipeline

A typical robotics perception pipeline:

```
┌─────────────┐
│   Camera    │
│   Sensor    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Image Pre-  │
│ processing  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Feature    │
│ Extraction  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Detection  │
│   / Recog   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Decision   │
│   Making    │
└─────────────┘
```

## Common Vision Tasks

### Classification
"What is this?" → "It's a cup"

### Detection
"Where are the objects?" → Bounding boxes

### Segmentation
"Which pixels belong to what?" → Pixel masks

### Tracking
"Where did that object go?" → Temporal association

### 3D Reconstruction
"What's the 3D structure?" → Point cloud/mesh

## Camera Basics

### Camera Parameters

```python
# Intrinsic parameters (camera properties)
fx, fy = 500, 500  # Focal lengths
cx, cy = 320, 240  # Principal point (image center)

K = np.array([
    [fx, 0,  cx],
    [0,  fy, cy],
    [0,  0,  1 ]
])
```

### Image Coordinate Systems

- **Pixel coordinates** (u, v) - 2D image space
- **Camera coordinates** (X, Y, Z) - 3D camera frame
- **World coordinates** (X, Y, Z) - Global reference frame

## Your First Vision Node

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class VisionNode(Node):
    def __init__(self):
        super().__init__('vision_node')

        self.bridge = CvBridge()

        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        self.publisher = self.create_publisher(
            Image,
            '/camera/processed',
            10
        )

    def image_callback(self, msg):
        # Convert ROS Image to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

        # Process image
        processed = self.process_image(cv_image)

        # Convert back to ROS Image
        out_msg = self.bridge.cv2_to_imgmsg(processed, 'bgr8')
        out_msg.header = msg.header

        self.publisher.publish(out_msg)

    def process_image(self, image):
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Edge detection
        edges = cv2.Canny(blurred, 50, 150)

        # Convert back to BGR for visualization
        return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

def main(args=None):
    rclpy.init(args=args)
    node = VisionNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Performance Considerations

### Frame Rate vs Processing Time
- Cameras typically output 30 FPS (33ms per frame)
- Your processing must complete within this time
- Use GPU acceleration when possible
- Consider downsampling for real-time performance

### Memory Management
- Images consume significant memory (640x480x3 = 921KB per frame)
- Process images in-place when possible
- Release resources after use

### Optimization Strategies
```python
# Bad: Creates new arrays
result = cv2.resize(img, (320, 240))

# Better: Reuse buffers
cv2.resize(img, (320, 240), dst=output_buffer)

# GPU acceleration
cuda_img = cv2.cuda_GpuMat()
cuda_img.upload(img)
# Process on GPU...
```

## Visualization Tools

### RViz for Images
```bash
rviz2
# Add → Image display
# Topic: /camera/image_raw
```

### RQT Image View
```bash
rqt_image_view
```

### Custom Visualization
```python
import cv2

def visualize_detections(image, detections):
    for det in detections:
        x, y, w, h = det['bbox']
        label = det['class']
        conf = det['confidence']

        # Draw bounding box
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Draw label
        text = f"{label}: {conf:.2f}"
        cv2.putText(image, text, (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return image
```

---

:::tip What's Next?
Start with **[Image Processing Fundamentals](./image-processing)** to learn core computer vision techniques.
:::
