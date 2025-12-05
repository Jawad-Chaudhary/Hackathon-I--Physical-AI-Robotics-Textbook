---
sidebar_position: 3
---

# Path Planning Algorithms

Learn algorithms to find collision-free paths from start to goal in complex environments.

## Path Planning Problem

Given:
- Start configuration
- Goal configuration
- Map with obstacles

Find: Collision-free path connecting start to goal

## Graph Search Algorithms

### A* (A-Star)

```python
import heapq
import numpy as np

def astar(start, goal, grid):
    """
    A* pathfinding algorithm

    Args:
        start: (x, y) start position
        goal: (x, y) goal position
        grid: 2D array (0=free, 1=obstacle)

    Returns:
        path: List of (x, y) waypoints
    """
    def heuristic(a, b):
        return np.sqrt((b[0] - a[0])**2 + (b[1] - a[1])**2)

    def neighbors(pos):
        x, y = pos
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < grid.shape[0] and 0 <= ny < grid.shape[1]:
                if grid[nx, ny] == 0:  # Free space
                    yield (nx, ny)

    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            # Reconstruct path
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for neighbor in neighbors(current):
            tentative_g = g_score[current] + np.linalg.norm(np.array(neighbor) - np.array(current))

            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None  # No path found

# Example usage
grid = np.zeros((50, 50))
grid[10:40, 20] = 1  # Vertical wall

path = astar((5, 5), (45, 45), grid)
print(f"Path length: {len(path) if path else 'No path found'}")
```

### Dijkstra's Algorithm

```python
def dijkstra(start, goal, grid):
    """Dijkstra's algorithm - A* without heuristic"""
    open_set = [(0, start)]
    visited = set()
    came_from = {}
    cost = {start: 0}

    while open_set:
        current_cost, current = heapq.heappop(open_set)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        if current in visited:
            continue
        visited.add(current)

        for neighbor in get_neighbors(current, grid):
            new_cost = cost[current] + 1

            if neighbor not in cost or new_cost < cost[neighbor]:
                cost[neighbor] = new_cost
                came_from[neighbor] = current
                heapq.heappush(open_set, (new_cost, neighbor))

    return None
```

## Sampling-Based Planning

### RRT (Rapidly-exploring Random Tree)

```python
class RRT:
    def __init__(self, start, goal, obstacles, bounds, max_iter=5000, step_size=0.5):
        self.start = np.array(start)
        self.goal = np.array(goal)
        self.obstacles = obstacles
        self.bounds = bounds
        self.max_iter = max_iter
        self.step_size = step_size
        self.tree = [self.start]
        self.parent = {tuple(self.start): None}

    def plan(self):
        for i in range(self.max_iter):
            # Sample random point
            if np.random.random() < 0.1:  # Goal bias
                sample = self.goal
            else:
                sample = self.random_sample()

            # Find nearest node
            nearest = self.nearest(sample)

            # Steer towards sample
            new_node = self.steer(nearest, sample)

            # Check collision
            if not self.collides(nearest, new_node):
                self.tree.append(new_node)
                self.parent[tuple(new_node)] = nearest

                # Check if goal reached
                if np.linalg.norm(new_node - self.goal) < self.step_size:
                    return self.extract_path(new_node)

        return None  # No path found

    def random_sample(self):
        return np.array([
            np.random.uniform(self.bounds[0][0], self.bounds[0][1]),
            np.random.uniform(self.bounds[1][0], self.bounds[1][1])
        ])

    def nearest(self, sample):
        distances = [np.linalg.norm(node - sample) for node in self.tree]
        return self.tree[np.argmin(distances)]

    def steer(self, from_node, to_node):
        direction = to_node - from_node
        distance = np.linalg.norm(direction)
        if distance < self.step_size:
            return to_node
        return from_node + direction / distance * self.step_size

    def collides(self, from_node, to_node):
        # Check line segment for collisions
        steps = int(np.linalg.norm(to_node - from_node) / 0.1)
        for i in range(steps + 1):
            point = from_node + (to_node - from_node) * i / steps
            for obs in self.obstacles:
                if self.point_in_obstacle(point, obs):
                    return True
        return False

    def point_in_obstacle(self, point, obstacle):
        x, y, w, h = obstacle  # Rectangle obstacle
        return x <= point[0] <= x + w and y <= point[1] <= y + h

    def extract_path(self, node):
        path = [self.goal]
        current = node
        while tuple(current) in self.parent and self.parent[tuple(current)] is not None:
            path.append(current)
            current = self.parent[tuple(current)]
        path.append(self.start)
        return path[::-1]

# Usage
obstacles = [(2, 2, 1, 3), (5, 1, 2, 2)]  # (x, y, width, height)
rrt = RRT(start=[0, 0], goal=[8, 8], obstacles=obstacles, bounds=[(-1, 10), (-1, 10)])
path = rrt.plan()
```

## Dynamic Window Approach (DWA)

Real-time local planning with dynamic constraints:

```python
class DWA:
    def __init__(self, v_max, omega_max, v_acc, omega_acc, dt=0.1):
        self.v_max = v_max
        self.omega_max = omega_max
        self.v_acc = v_acc
        self.omega_acc = omega_acc
        self.dt = dt

    def plan(self, current_v, current_omega, pose, goal, obstacles):
        """
        Compute optimal velocity command

        Args:
            current_v, current_omega: Current velocities
            pose: [x, y, theta] current robot pose
            goal: [x, y] goal position
            obstacles: List of obstacle positions

        Returns:
            (v, omega): Optimal velocity command
        """
        # Dynamic window - reachable velocities
        v_min = max(0, current_v - self.v_acc * self.dt)
        v_max = min(self.v_max, current_v + self.v_acc * self.dt)

        omega_min = max(-self.omega_max, current_omega - self.omega_acc * self.dt)
        omega_max = min(self.omega_max, current_omega + self.omega_acc * self.dt)

        best_score = -np.inf
        best_v, best_omega = 0, 0

        # Sample velocities in dynamic window
        for v in np.linspace(v_min, v_max, 10):
            for omega in np.linspace(omega_min, omega_max, 10):
                # Simulate trajectory
                trajectory = self.simulate_trajectory(pose, v, omega, steps=10)

                # Check collision
                if self.trajectory_collides(trajectory, obstacles):
                    continue

                # Evaluate trajectory
                score = self.evaluate(trajectory, goal, v, omega)

                if score > best_score:
                    best_score = score
                    best_v, best_omega = v, omega

        return best_v, best_omega

    def simulate_trajectory(self, pose, v, omega, steps):
        x, y, theta = pose
        trajectory = []

        for _ in range(steps):
            x += v * np.cos(theta) * self.dt
            y += v * np.sin(theta) * self.dt
            theta += omega * self.dt
            trajectory.append([x, y, theta])

        return np.array(trajectory)

    def trajectory_collides(self, trajectory, obstacles):
        for point in trajectory:
            for obs in obstacles:
                if np.linalg.norm(point[:2] - obs[:2]) < 0.5:  # Safety radius
                    return True
        return False

    def evaluate(self, trajectory, goal, v, omega):
        # Heading to goal
        last_point = trajectory[-1]
        heading_error = np.arctan2(goal[1] - last_point[1], goal[0] - last_point[0]) - last_point[2]
        heading_score = 1.0 - abs(heading_error) / np.pi

        # Distance to goal
        dist_to_goal = np.linalg.norm(trajectory[-1][:2] - goal)
        dist_score = 1.0 / (1.0 + dist_to_goal)

        # Velocity (prefer higher speeds)
        velocity_score = v / self.v_max

        # Weighted combination
        return 2.0 * heading_score + 1.0 * dist_score + 0.5 * velocity_score
```

## ROS 2 Path Planning

```python
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Path, OccupancyGrid
from geometry_msgs.msg import PoseStamped

class PathPlannerNode(Node):
    def __init__(self):
        super().__init__('path_planner')

        self.map = None

        self.map_sub = self.create_subscription(
            OccupancyGrid, '/map', self.map_callback, 10
        )

        self.goal_sub = self.create_subscription(
            PoseStamped, '/goal_pose', self.goal_callback, 10
        )

        self.path_pub = self.create_publisher(Path, '/planned_path', 10)

    def map_callback(self, msg):
        # Convert occupancy grid to numpy array
        width = msg.info.width
        height = msg.info.height
        self.map = np.array(msg.data).reshape((height, width))
        self.map_resolution = msg.info.resolution
        self.map_origin = [msg.info.origin.position.x, msg.info.origin.position.y]

    def goal_callback(self, msg):
        if self.map is None:
            self.get_logger().warn('No map received yet')
            return

        # Convert world coordinates to grid coordinates
        start_grid = self.world_to_grid(0, 0)  # Assume robot at origin
        goal_grid = self.world_to_grid(
            msg.pose.position.x,
            msg.pose.position.y
        )

        # Plan path
        path_grid = astar(start_grid, goal_grid, self.map)

        if path_grid is None:
            self.get_logger().error('No path found!')
            return

        # Convert to world coordinates and publish
        path_msg = Path()
        path_msg.header = msg.header

        for grid_point in path_grid:
            world_point = self.grid_to_world(*grid_point)
            pose = PoseStamped()
            pose.header = msg.header
            pose.pose.position.x = world_point[0]
            pose.pose.position.y = world_point[1]
            path_msg.poses.append(pose)

        self.path_pub.publish(path_msg)
        self.get_logger().info(f'Published path with {len(path_grid)} waypoints')

    def world_to_grid(self, x, y):
        gx = int((x - self.map_origin[0]) / self.map_resolution)
        gy = int((y - self.map_origin[1]) / self.map_resolution)
        return (gx, gy)

    def grid_to_world(self, gx, gy):
        x = gx * self.map_resolution + self.map_origin[0]
        y = gy * self.map_resolution + self.map_origin[1]
        return (x, y)
```

---

:::tip What's Next?
Learn **[PID Control](./pid-control)** for precise actuator control.
:::


## Check Your Understanding

:::note Question 1
What is the key difference between A* and Dijkstra's algorithm in path planning?
A) Dijkstra's algorithm does not use a heuristic, unlike A*
B) A* does not use a heuristic, unlike Dijkstra's algorithm
C) Dijkstra's algorithm only works in grid-based environments, A* does not
D) A* only works in grid-based environments, Dijkstra's algorithm does not
**Answer**: A

:::note Question 2
In the RRT (Rapidly-exploring Random Tree) algorithm, what is the purpose of the 'goal bias'?
A) It ensures the tree grows towards the goal more often than randomly
B) It ensures the tree grows randomly more often than towards the goal
C) It helps in avoiding obstacles
D) It helps in maintaining the balance of the tree
**Answer**: A

:::note Question 3
What is the purpose of the Dynamic Window Approach (DWA) in path planning?
A) It is used to simulate the trajectory
B) It is used to evaluate the trajectory
C) It is used to calculate optimal velocity command considering dynamic constraints
D) It is used to check for trajectory collisions with obstacles
**Answer**: C

:::note Question 4
In the ROS 2 Path Planning code, what does the 'world_to_grid' function do?
A) It converts the coordinates of the robot's position from grid coordinates to world coordinates
B) It converts the coordinates of the robot's position from world coordinates to grid coordinates
C) It converts the coordinates of the obstacles from world coordinates to grid coordinates
D) It converts the coordinates of the obstacles from grid coordinates to world coordinates
**Answer**: B

:::note Question 5
What is the primary challenge in the Path Planning Problem?
A) Finding a path connecting start to goal
B) Finding a path connecting start to goal, avoiding obstacles
C) Defining the start and goal configurations
D) Defining the map with obstacles
**Answer**: B