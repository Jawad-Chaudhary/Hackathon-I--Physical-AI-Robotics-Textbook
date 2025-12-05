---
sidebar_position: 3
---

# Object Detection with Deep Learning

Learn to detect and localize multiple objects in images using modern deep learning techniques.

## What is Object Detection?

Object detection combines two tasks:
1. **Classification** - What objects are present?
2. **Localization** - Where are they located?

Output: Bounding boxes + class labels + confidence scores

## Detection vs Classification vs Segmentation

| Task | Output | Example |
|------|--------|---------|
| Classification | Class label | "Dog" |
| Detection | Boxes + labels | [x, y, w, h, "Dog", 0.95] |
| Segmentation | Pixel masks | Per-pixel classification |

## Popular Detection Architectures

### YOLO (You Only Look Once)
- **Speed**: Real-time (30+ FPS)
- **Approach**: Single-stage detector
- **Versions**: YOLOv3, YOLOv5, YOLOv8

### Faster R-CNN
- **Speed**: Slower (~5 FPS)
- **Approach**: Two-stage detector
- **Accuracy**: High precision

### SSD (Single Shot Detector)
- **Speed**: Fast (~20 FPS)
- **Approach**: Single-stage
- **Use**: Mobile and embedded systems

## Using YOLO v8 with PyTorch

### Installation

```bash
pip install ultralytics
```

### Basic Detection

```python
from ultralytics import YOLO
import cv2

# Load model
model = YOLO('yolov8n.pt')  # nano model (fastest)

# Run inference
results = model('image.jpg')

# Process results
for result in results:
    boxes = result.boxes  # Bounding boxes
    for box in boxes:
        # Get coordinates
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        conf = box.conf[0].cpu().numpy()
        cls = int(box.cls[0].cpu().numpy())

        # Get class name
        class_name = model.names[cls]

        print(f"{class_name}: {conf:.2f} at [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")
```

### Real-time Detection

```python
import cv2
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
cap = cv2.VideoCapture(0)  # Webcam

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run detection
    results = model(frame, verbose=False)

    # Draw results on frame
    annotated_frame = results[0].plot()

    cv2.imshow('YOLO Detection', annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## ROS 2 Object Detection Node

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray, Detection2D, ObjectHypothesisWithPose
from cv_bridge import CvBridge
from ultralytics import YOLO
import cv2

class ObjectDetector(Node):
    def __init__(self):
        super().__init__('object_detector')

        # Parameters
        self.declare_parameter('model_path', 'yolov8n.pt')
        self.declare_parameter('confidence_threshold', 0.5)

        model_path = self.get_parameter('model_path').value
        self.confidence_threshold = self.get_parameter('confidence_threshold').value

        # Load YOLO model
        self.model = YOLO(model_path)
        self.bridge = CvBridge()

        # Subscribers
        self.image_sub = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )

        # Publishers
        self.detections_pub = self.create_publisher(
            Detection2DArray,
            '/detections',
            10
        )
        self.viz_pub = self.create_publisher(
            Image,
            '/detections/image',
            10
        )

    def image_callback(self, msg):
        # Convert to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

        # Run detection
        results = self.model(cv_image, verbose=False)[0]

        # Create detection message
        detections_msg = Detection2DArray()
        detections_msg.header = msg.header

        for box in results.boxes:
            conf = float(box.conf[0])

            # Filter by confidence
            if conf < self.confidence_threshold:
                continue

            # Create detection
            detection = Detection2D()

            # Bounding box
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            detection.bbox.center.position.x = float((x1 + x2) / 2)
            detection.bbox.center.position.y = float((y1 + y2) / 2)
            detection.bbox.size_x = float(x2 - x1)
            detection.bbox.size_y = float(y2 - y1)

            # Class and confidence
            cls = int(box.cls[0])
            hypothesis = ObjectHypothesisWithPose()
            hypothesis.hypothesis.class_id = str(cls)
            hypothesis.hypothesis.score = conf
            detection.results.append(hypothesis)

            detection.id = str(cls)  # Use class as ID for now

            detections_msg.detections.append(detection)

        # Publish detections
        self.detections_pub.publish(detections_msg)

        # Publish visualization
        annotated = results.plot()
        viz_msg = self.bridge.cv2_to_imgmsg(annotated, 'bgr8')
        viz_msg.header = msg.header
        self.viz_pub.publish(viz_msg)

        self.get_logger().info(f'Detected {len(detections_msg.detections)} objects')

def main(args=None):
    rclpy.init(args=args)
    node = ObjectDetector()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Custom Object Detection

### Training on Custom Dataset

```python
from ultralytics import YOLO

# Load a pretrained model
model = YOLO('yolov8n.pt')

# Train on custom dataset
results = model.train(
    data='custom_dataset.yaml',  # Dataset config
    epochs=100,
    imgsz=640,
    batch=16,
    device=0  # GPU
)

# Validate
metrics = model.val()

# Export to ONNX for deployment
model.export(format='onnx')
```

### Dataset Format (YOLO)

```yaml
# custom_dataset.yaml
path: /path/to/dataset
train: images/train
val: images/val

nc: 3  # Number of classes
names: ['person', 'car', 'bicycle']
```

Annotation format (one .txt file per image):
```
# class_id center_x center_y width height (normalized 0-1)
0 0.5 0.5 0.3 0.4
1 0.7 0.3 0.2 0.2
```

## Non-Maximum Suppression (NMS)

Remove overlapping detections:

```python
import torch

def nms(boxes, scores, iou_threshold=0.5):
    """
    boxes: [N, 4] (x1, y1, x2, y2)
    scores: [N]
    """
    # Sort by confidence
    indices = torch.argsort(scores, descending=True)

    keep = []
    while len(indices) > 0:
        # Pick box with highest score
        current = indices[0]
        keep.append(current)

        if len(indices) == 1:
            break

        # Calculate IoU with remaining boxes
        current_box = boxes[current]
        remaining_boxes = boxes[indices[1:]]

        ious = calculate_iou(current_box, remaining_boxes)

        # Keep only boxes with IoU < threshold
        indices = indices[1:][ious < iou_threshold]

    return torch.tensor(keep)

def calculate_iou(box1, boxes):
    """Calculate IoU between box1 and multiple boxes"""
    # Intersection area
    x1 = torch.max(box1[0], boxes[:, 0])
    y1 = torch.max(box1[1], boxes[:, 1])
    x2 = torch.min(box1[2], boxes[:, 2])
    y2 = torch.min(box1[3], boxes[:, 3])

    intersection = torch.clamp(x2 - x1, min=0) * torch.clamp(y2 - y1, min=0)

    # Union area
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    union = area1 + area2 - intersection

    return intersection / union
```

## Multi-Object Tracking

Track objects across frames:

```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

# Enable tracking
results = model.track(
    source='video.mp4',
    tracker='bytetrack.yaml',  # Tracking algorithm
    persist=True  # Maintain tracks across frames
)

for result in results:
    boxes = result.boxes
    for box in boxes:
        track_id = int(box.id[0]) if box.id is not None else -1
        cls = int(box.cls[0])
        conf = float(box.conf[0])

        print(f"Track {track_id}: {model.names[cls]} ({conf:.2f})")
```

## Performance Optimization

### Model Selection

| Model | Size | Speed | mAP |
|-------|------|-------|-----|
| YOLOv8n | 3MB | 80 FPS | 37.3 |
| YOLOv8s | 11MB | 60 FPS | 44.9 |
| YOLOv8m | 26MB | 40 FPS | 50.2 |
| YOLOv8l | 44MB | 25 FPS | 52.9 |
| YOLOv8x | 68MB | 15 FPS | 53.9 |

### Inference Optimization

```python
# Use FP16 (half precision)
model = YOLO('yolov8n.pt')
model.fuse()  # Fuse layers for speed

# TensorRT export for NVIDIA GPUs
model.export(format='engine', device=0)
model = YOLO('yolov8n.engine')  # 2-3x faster

# Reduce image size
results = model(image, imgsz=320)  # Default is 640
```

## Evaluation Metrics

### Precision and Recall

```python
TP = true_positives
FP = false_positives
FN = false_negatives

precision = TP / (TP + FP)
recall = TP / (TP + FN)
f1_score = 2 * (precision * recall) / (precision + recall)
```

### Mean Average Precision (mAP)

- **mAP@0.5**: Average precision at IoU threshold 0.5
- **mAP@0.5:0.95**: Average across IoU thresholds 0.5 to 0.95

## Best Practices

1. **Data augmentation** - Rotation, scaling, color jitter
2. **Class balancing** - Equal examples per class
3. **Anchor tuning** - Optimize for your object sizes
4. **Multi-scale training** - Better generalization
5. **Test-time augmentation** - Average predictions from augmented inputs

---

:::tip What's Next?
Learn **[Depth Perception](./depth-perception)** for 3D understanding.
:::


## Check Your Understanding

:::note Question 1
What tasks does object detection combine?
A) Classification and Localization
B) Classification and Segmentation
C) Localization and Segmentation
D) Segmentation and Detection
**Answer**: A) Classification and Localization

:::note Question 2
In the context of object detection, what is the output of the task "Detection"?
A) Class label only
B) Boxes and labels
C) Pixel masks
D) Confidence scores only
**Answer**: B) Boxes and labels

:::note Question 3
What is the advantage of YOLO (You Only Look Once) detection architecture?
A) It is the most accurate model
B) It can detect objects in real-time
C) It is a two-stage detector
D) It is the slowest among all detectors
**Answer**: B) It can detect objects in real-time

:::note Question 4
What is Non-Maximum Suppression (NMS) used for in object detection?
A) Increasing the speed of detection
B) Increasing the accuracy of detection
C) Removing overlapping detections
D) Classifying objects
**Answer**: C) Removing overlapping detections

:::note Question 5
When optimizing for inference, what can be done to increase the speed of the YOLO model?
A) Increase the image size
B) Decrease the image size
C) Use a different model
D) Increase the number of layers in the model
**Answer**: B) Decrease the image size