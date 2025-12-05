---
sidebar_position: 2
---

# Image Processing Fundamentals

Master the core techniques for manipulating and analyzing digital images in robotics applications.

## Digital Images

An image is a 2D array of pixels. Each pixel contains:
- **Grayscale**: Single intensity value (0-255)
- **Color (RGB)**: Three channels - Red, Green, Blue
- **Depth**: Distance information

```python
import cv2
import numpy as np

# Load image
img = cv2.imread('robot.jpg')

print(f"Shape: {img.shape}")  # (height, width, channels)
print(f"Type: {img.dtype}")   # uint8
print(f"Size: {img.size} pixels")
```

## Color Spaces

### RGB to Grayscale

```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
```

### HSV (Hue, Saturation, Value)
Better for color-based segmentation:

```python
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Extract red objects
lower_red = np.array([0, 120, 70])
upper_red = np.array([10, 255, 255])
mask = cv2.inRange(hsv, lower_red, upper_red)
```

## Image Filtering

### Smoothing (Blur)

```python
# Gaussian blur - reduces noise
blurred = cv2.GaussianBlur(img, (5, 5), 0)

# Median blur - preserves edges, removes salt-and-pepper noise
median = cv2.medianBlur(img, 5)

# Bilateral filter - edge-preserving smoothing
bilateral = cv2.bilateralFilter(img, 9, 75, 75)
```

### Sharpening

```python
kernel = np.array([[-1,-1,-1],
                   [-1, 9,-1],
                   [-1,-1,-1]])
sharpened = cv2.filter2D(img, -1, kernel)
```

## Edge Detection

### Canny Edge Detector

```python
edges = cv2.Canny(gray, threshold1=50, threshold2=150)
```

### Sobel Operator

```python
# Gradient in X direction
sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)

# Gradient in Y direction
sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

# Magnitude
magnitude = np.sqrt(sobelx**2 + sobely**2)
```

## Morphological Operations

### Erosion and Dilation

```python
kernel = np.ones((5,5), np.uint8)

# Erosion - shrinks white regions
eroded = cv2.erode(mask, kernel, iterations=1)

# Dilation - expands white regions
dilated = cv2.dilate(mask, kernel, iterations=1)
```

### Opening and Closing

```python
# Opening = Erosion + Dilation (removes noise)
opening = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

# Closing = Dilation + Erosion (fills holes)
closing = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
```

## Feature Detection

### Corner Detection (Harris)

```python
gray = np.float32(gray)
corners = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)

# Mark corners
img[corners > 0.01 * corners.max()] = [0, 0, 255]
```

### SIFT (Scale-Invariant Feature Transform)

```python
sift = cv2.SIFT_create()
keypoints, descriptors = sift.detectAndCompute(gray, None)

# Draw keypoints
img_with_keypoints = cv2.drawKeypoints(
    img, keypoints, None,
    flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
)
```

### ORB (Oriented FAST and Rotated BRIEF)
Faster alternative to SIFT:

```python
orb = cv2.ORB_create()
keypoints, descriptors = orb.detectAndCompute(gray, None)
```

## Contour Detection

```python
# Find contours
contours, hierarchy = cv2.findContours(
    edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)

# Draw contours
cv2.drawContours(img, contours, -1, (0, 255, 0), 2)

# Analyze contours
for contour in contours:
    area = cv2.contourArea(contour)
    perimeter = cv2.arcLength(contour, True)

    # Bounding rectangle
    x, y, w, h = cv2.boundingRect(contour)

    # Minimum enclosing circle
    (x, y), radius = cv2.minEnclosingCircle(contour)
```

## Template Matching

```python
template = cv2.imread('object.jpg', 0)
result = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED)

threshold = 0.8
locations = np.where(result >= threshold)

for pt in zip(*locations[::-1]):
    cv2.rectangle(img, pt,
                  (pt[0] + template.shape[1], pt[1] + template.shape[0]),
                  (0, 255, 0), 2)
```

## Histogram Processing

### Histogram Equalization

```python
# Improve contrast
equalized = cv2.equalizeHist(gray)

# Adaptive histogram equalization (CLAHE)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
adaptive_eq = clahe.apply(gray)
```

### Histogram Calculation

```python
hist = cv2.calcHist([gray], [0], None, [256], [0, 256])

import matplotlib.pyplot as plt
plt.plot(hist)
plt.title('Grayscale Histogram')
plt.xlabel('Pixel value')
plt.ylabel('Frequency')
```

## Image Transformations

### Geometric Transformations

```python
# Resize
resized = cv2.resize(img, (320, 240))

# Rotate
center = (img.shape[1]//2, img.shape[0]//2)
M = cv2.getRotationMatrix2D(center, angle=45, scale=1.0)
rotated = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))

# Perspective transform
src_points = np.float32([[0,0], [400,0], [0,300], [400,300]])
dst_points = np.float32([[50,50], [350,20], [20,280], [380,280]])
M = cv2.getPerspectiveTransform(src_points, dst_points)
warped = cv2.warpPerspective(img, M, (400, 300))
```

## ROS 2 Image Processing Node

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np

class ImageProcessorNode(Node):
    def __init__(self):
        super().__init__('image_processor')

        self.bridge = CvBridge()

        # Parameters
        self.declare_parameter('blur_size', 5)
        self.declare_parameter('canny_low', 50)
        self.declare_parameter('canny_high', 150)

        # Subscribers
        self.image_sub = self.create_subscription(
            Image, '/camera/image_raw',
            self.image_callback, 10
        )

        # Publishers
        self.edges_pub = self.create_publisher(Image, '/camera/edges', 10)
        self.contours_pub = self.create_publisher(Image, '/camera/contours', 10)

    def image_callback(self, msg):
        # Convert to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

        # Get parameters
        blur_size = self.get_parameter('blur_size').value
        canny_low = self.get_parameter('canny_low').value
        canny_high = self.get_parameter('canny_high').value

        # Processing pipeline
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (blur_size, blur_size), 0)
        edges = cv2.Canny(blurred, canny_low, canny_high)

        # Find contours
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        # Draw contours on original image
        output = cv_image.copy()
        cv2.drawContours(output, contours, -1, (0, 255, 0), 2)

        # Publish results
        edges_msg = self.bridge.cv2_to_imgmsg(edges, 'mono8')
        edges_msg.header = msg.header
        self.edges_pub.publish(edges_msg)

        contours_msg = self.bridge.cv2_to_imgmsg(output, 'bgr8')
        contours_msg.header = msg.header
        self.contours_pub.publish(contours_msg)

        self.get_logger().info(f'Detected {len(contours)} contours')

def main(args=None):
    rclpy.init(args=args)
    node = ImageProcessorNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Performance Optimization

### Use NumPy Vectorization

```python
# Slow: Loop over pixels
for i in range(h):
    for j in range(w):
        img[i,j] = img[i,j] * 2

# Fast: Vectorized operation
img = img * 2
```

### GPU Acceleration with CUDA

```python
# Upload to GPU
gpu_img = cv2.cuda_GpuMat()
gpu_img.upload(img)

# Process on GPU
gpu_gray = cv2.cuda.cvtColor(gpu_img, cv2.COLOR_BGR2GRAY)
gpu_blurred = cv2.cuda.createGaussianFilter(
    cv2.CV_8UC1, cv2.CV_8UC1, (5,5), 0
).apply(gpu_gray)

# Download result
result = gpu_blurred.download()
```

## Best Practices

1. **Choose appropriate color space** - HSV for color detection, grayscale for edges
2. **Preprocess consistently** - Same pipeline for training and inference
3. **Tune parameters dynamically** - Use ROS parameters for real-time tuning
4. **Handle edge cases** - Empty images, extreme lighting
5. **Profile performance** - Identify bottlenecks with `time.time()` or `cProfile`

---

:::tip What's Next?
Learn **[Object Detection](./object-detection)** using deep learning models.
:::


## Check Your Understanding

:::note Question 1
What does each pixel in a digital image contain?
A) Only color information
B) Only grayscale information
C) Grayscale, color (RGB), and depth information
D) Only depth information
**Answer**: C) Grayscale, color (RGB), and depth information

:::note Question 2
Which of the following is not a method for image filtering in OpenCV?
A) Gaussian blur
B) Median blur
C) Bilateral filter
D) Radial filter
**Answer**: D) Radial filter

:::note Question 3
What is the purpose of the Sobel Operator in image processing?
A) To convert an image from RGB to grayscale
B) To detect edges in an image by calculating the gradient
C) To blur an image for noise reduction
D) To perform color-based segmentation
**Answer**: B) To detect edges in an image by calculating the gradient

:::note Question 4
In the context of image processing, what does the term "Morphological Operations" refer to?
A) Operations that change the color space of an image
B) Operations that analyze and detect features in an image
C) Operations that manipulate the shape or structure of objects within an image
D) Operations that transform an image's histogram
**Answer**: C) Operations that manipulate the shape or structure of objects within an image

:::note Question 5
What is a key advantage of using GPU Acceleration with CUDA in image processing?
A) It allows for real-time tuning of parameters
B) It improves contrast in images
C) It speeds up processing by performing operations on the GPU
D) It allows for more accurate edge detection
**Answer**: C) It speeds up processing by performing operations on the GPU