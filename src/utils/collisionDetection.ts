import { Vector3, Box3, Sphere, Object3D, Raycaster } from 'three';

// Define obstacle positions and sizes
// In a real game, these would be dynamically generated from the scene
const OBSTACLES = [
  { position: new Vector3(0, 0.5, -5), size: new Vector3(1, 1, 1) },  // Orange box
  { position: new Vector3(3, 0.5, -3), size: new Vector3(1, 1, 1) },  // Red box
  { position: new Vector3(-3, 0.5, -3), size: new Vector3(1, 1, 1) }, // Blue box
  { position: new Vector3(0, 0.5, -10), size: new Vector3(1, 1, 1) }, // Green box
];

// Player collision parameters
const PLAYER_RADIUS = 0.5;
const COLLISION_MARGIN = 0.1;

/**
 * Check if a position would collide with any obstacles
 * @param position The position to check
 * @returns True if there's a collision, false otherwise
 */
export function checkCollision(position: Vector3): boolean {
  // Create a sphere representing the player
  const playerSphere = new Sphere(position, PLAYER_RADIUS);
  
  // Check collision with each obstacle
  for (const obstacle of OBSTACLES) {
    // Create a box for the obstacle
    const halfSize = obstacle.size.clone().multiplyScalar(0.5);
    const obstacleBox = new Box3(
      obstacle.position.clone().sub(halfSize),
      obstacle.position.clone().add(halfSize)
    );
    
    // Check if the player sphere intersects with the obstacle box
    if (obstacleBox.intersectsSphere(playerSphere)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Resolve a collision by adjusting the position
 * @param currentPosition The current position
 * @param targetPosition The desired position that would cause a collision
 * @returns A new position that avoids the collision
 */
export function resolveCollision(currentPosition: Vector3, targetPosition: Vector3): Vector3 {
  // Direction of movement
  const moveDirection = targetPosition.clone().sub(currentPosition).normalize();
  
  // Create a raycaster to check for collisions in the movement direction
  const raycaster = new Raycaster(
    currentPosition.clone(),
    moveDirection,
    0,
    currentPosition.distanceTo(targetPosition) + COLLISION_MARGIN
  );
  
  // Check for intersections with obstacles
  for (const obstacle of OBSTACLES) {
    const halfSize = obstacle.size.clone().multiplyScalar(0.5);
    const obstacleBox = new Box3(
      obstacle.position.clone().sub(halfSize),
      obstacle.position.clone().add(halfSize)
    );
    
    // If we would collide with this obstacle
    if (obstacleBox.intersectsSphere(new Sphere(targetPosition, PLAYER_RADIUS))) {
      // Calculate the closest point on the box to the current position
      const closestPoint = new Vector3();
      obstacleBox.clampPoint(currentPosition, closestPoint);
      
      // Calculate the distance to the closest point
      const distanceToObstacle = currentPosition.distanceTo(closestPoint) - PLAYER_RADIUS - COLLISION_MARGIN;
      
      // If we're too close or would move into the obstacle
      if (distanceToObstacle <= 0 || 
          currentPosition.distanceTo(targetPosition) > distanceToObstacle) {
        // Slide along the obstacle
        const slideDirection = new Vector3();
        
        // Determine which axis to slide along
        if (Math.abs(moveDirection.x) > Math.abs(moveDirection.z)) {
          slideDirection.set(0, 0, moveDirection.z);
        } else {
          slideDirection.set(moveDirection.x, 0, 0);
        }
        
        // If we have a slide direction, use it
        if (slideDirection.length() > 0) {
          slideDirection.normalize();
          return currentPosition.clone().add(
            slideDirection.multiplyScalar(currentPosition.distanceTo(targetPosition))
          );
        }
        
        // If we can't slide, just stay at the current position
        return currentPosition.clone();
      }
    }
  }
  
  // No collision, return the target position
  return targetPosition.clone();
}
