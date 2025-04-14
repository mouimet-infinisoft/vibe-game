'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';

// Create some boxes for the scene
const Boxes = () => {
  return (
    <group>
      {/* Orange box in front of starting position */}
      <mesh position={[0, 0.5, -5]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Red box to the right */}
      <mesh position={[3, 0.5, -3]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Blue box to the left */}
      <mesh position={[-3, 0.5, -3]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Green box further away */}
      <mesh position={[0, 0.5, -10]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
};

interface Scene3DProps {
  children?: ReactNode;
}

export default function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="w-full h-[500px]">
      <Canvas shadows camera={{ fov: 75, position: [0, 1.8, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Boxes />
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#606060" />
          </mesh>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
