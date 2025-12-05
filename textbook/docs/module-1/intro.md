---
sidebar_position: 1
---

# Introduction to Physical AI

Welcome to Module 1! In this module, you'll learn the fundamentals of Physical AI and ROS 2.

## What You'll Learn

By the end of this module, you'll be able to:

- 🎯 Understand the core concepts of Physical AI
- 🤖 Set up and configure ROS 2
- 📡 Create ROS 2 nodes and communicate between them
- 🔧 Work with sensors and actuators
- 🎮 Run simulations in Gazebo

## Module Overview

### Chapter 1: ROS 2 Nodes and Topics
Learn how to create ROS 2 nodes, publish and subscribe to topics, and build communication systems.

### Chapter 2: Sensors and Actuators
Understand how robots perceive and interact with the physical world through sensors and actuators.

### Chapter 3: Simulation with Gazebo
Set up virtual robot environments and test your code safely before deploying to hardware.

## Prerequisites

Before starting this module, ensure you have:

- Python 3.8+ installed
- Basic understanding of object-oriented programming
- Linux environment (Ubuntu 22.04 recommended) or Docker

## Setting Up Your Environment

### Install ROS 2 Humble

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install ROS 2 Humble Desktop
sudo apt install ros-humble-desktop -y

# Source ROS 2 setup
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### Verify Installation

```bash
# Check ROS 2 version
ros2 --version

# Test with demo nodes
ros2 run demo_nodes_cpp talker
```

You should see output indicating the talker node is publishing messages.

## Your First ROS 2 Workspace

Create a workspace for your projects:

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Build the workspace
colcon build

# Source the workspace
source install/setup.bash
```

Now you're ready to build your first robot application!

---

:::tip What's Next?
Continue to **[ROS 2 Nodes and Topics](./ros2-nodes)** to create your first node.
:::
