'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Scene3D component with no SSR
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
});

// Dynamically import the Player component with no SSR
const Player = dynamic(() => import('@/components/Player'), {
  ssr: false,
});

export default function GameContainer() {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg game-container">
      {/* Crosshair */}
      <div className="crosshair"></div>

      {/* Instructions */}
      <div className="instructions">
        <p>Click to lock mouse</p>
        <p>WASD or Arrow Keys to move</p>
        <p>ESC to unlock mouse</p>
      </div>

      <Scene3D>
        <Player />
      </Scene3D>
    </div>
  );
}
