'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3, Euler } from 'three';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { checkCollision, resolveCollision } from '@/utils/collisionDetection';

// Movement constants
const MAX_SPEED = 8;
const ACCELERATION = 80;
const DECELERATION = 5;
const PLAYER_HEIGHT = 1.8;
const JUMP_FORCE = 7;
const GRAVITY = 20;

export default function Player() {
  // Get the camera and other Three.js objects from the context
  const { camera, gl } = useThree();

  // Reference to the PointerLockControls
  const controlsRef = useRef<any>(null);

  // Reference to the player's position
  const playerPosition = useRef(new Vector3(0, PLAYER_HEIGHT, 0));

  // Reference to the player's velocity
  const velocity = useRef(new Vector3(0, 0, 0));

  // Player state
  const [isJumping, setIsJumping] = useState(false);
  const [isGrounded, setIsGrounded] = useState(true);

  // Get keyboard controls
  const { forward, backward, left, right, jump } = useKeyboardControls();

  // Vectors for movement calculation
  const direction = new Vector3();
  const frontVector = new Vector3();
  const sideVector = new Vector3();

  // Set initial camera position
  useEffect(() => {
    // Position the camera at the starting point
    camera.position.set(0, PLAYER_HEIGHT, 5);
    playerPosition.current.set(0, PLAYER_HEIGHT, 5);

    // Add a click event listener to lock the pointer when the canvas is clicked
    const handleCanvasClick = () => {
      if (controlsRef.current) {
        controlsRef.current.lock();
      }
    };

    // Add the event listener to the canvas
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleCanvasClick);

    // Clean up the event listener when the component unmounts
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [camera, gl]);

  // Update player position and camera on each frame
  useFrame((state, delta) => {
    if (controlsRef.current?.isLocked) {
      // Calculate movement direction
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);

      // Combine movement vectors, normalize, and adjust for camera rotation
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .applyEuler(camera.rotation);

      // Apply acceleration/deceleration to horizontal movement
      if (direction.x !== 0 || direction.z !== 0) {
        // Accelerate when moving
        velocity.current.x += direction.x * ACCELERATION * delta;
        velocity.current.z += direction.z * ACCELERATION * delta;
      } else {
        // Decelerate when not pressing movement keys
        velocity.current.x -= velocity.current.x * DECELERATION * delta;
        velocity.current.z -= velocity.current.z * DECELERATION * delta;
      }

      // Clamp horizontal velocity to maximum speed
      const horizontalVelocity = new Vector3(velocity.current.x, 0, velocity.current.z);
      if (horizontalVelocity.length() > MAX_SPEED) {
        horizontalVelocity.normalize().multiplyScalar(MAX_SPEED);
        velocity.current.x = horizontalVelocity.x;
        velocity.current.z = horizontalVelocity.z;
      }

      // Handle jumping
      if (jump && isGrounded && !isJumping) {
        velocity.current.y = JUMP_FORCE;
        setIsJumping(true);
        setIsGrounded(false);
      }

      // Apply gravity
      velocity.current.y -= GRAVITY * delta;

      // Calculate the next position based on velocity
      const nextPosition = playerPosition.current.clone().add(
        new Vector3(
          velocity.current.x * delta,
          velocity.current.y * delta,
          velocity.current.z * delta
        )
      );

      // Check for collisions and resolve them
      if (checkCollision(nextPosition)) {
        // Resolve the collision and update the position
        const resolvedPosition = resolveCollision(playerPosition.current, nextPosition);
        playerPosition.current.copy(resolvedPosition);

        // Adjust velocity to prevent sticking to walls
        if (Math.abs(resolvedPosition.x - nextPosition.x) > 0.01) {
          velocity.current.x = 0;
        }
        if (Math.abs(resolvedPosition.z - nextPosition.z) > 0.01) {
          velocity.current.z = 0;
        }
      } else {
        // No collision, update position normally
        playerPosition.current.copy(nextPosition);
      }

      // Ground collision detection (simple)
      if (playerPosition.current.y < PLAYER_HEIGHT) {
        playerPosition.current.y = PLAYER_HEIGHT;
        velocity.current.y = 0;
        setIsGrounded(true);
        setIsJumping(false);
      }

      // Update camera position to follow player
      camera.position.x = playerPosition.current.x;
      camera.position.y = playerPosition.current.y;
      camera.position.z = playerPosition.current.z;
    }
  });

  return (
    <>
      {/* First-person camera controls with ref */}
      <PointerLockControls ref={controlsRef} />

      {/* Player "body" - visible for debugging */}
      <mesh
        position={[playerPosition.current.x, playerPosition.current.y - 0.8, playerPosition.current.z]}
        visible={true}
      >
        <capsuleGeometry args={[0.5, 1, 8]} />
        <meshBasicMaterial color="yellow" wireframe={true} opacity={0.5} transparent />
      </mesh>

      {/* Add a crosshair */}
      <group position={[0, 0, 0]}>
        {/* The crosshair will be added via CSS */}
      </group>
    </>
  );
}
