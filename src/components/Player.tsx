'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3, Euler } from 'three';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

const SPEED = 5;
const PLAYER_HEIGHT = 1.8;

export default function Player() {
  // Get the camera and other Three.js objects from the context
  const { camera, gl } = useThree();

  // Reference to the PointerLockControls
  const controlsRef = useRef<any>(null);

  // Reference to the player's position
  const playerPosition = useRef(new Vector3(0, PLAYER_HEIGHT, 0));

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
  useFrame(() => {
    if (controlsRef.current?.isLocked) {
      // Calculate movement direction
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);

      // Combine movement vectors, normalize, apply speed, and adjust for camera rotation
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(camera.rotation);

      // Update player position
      playerPosition.current.x += direction.x * 0.01;
      playerPosition.current.z += direction.z * 0.01;

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
