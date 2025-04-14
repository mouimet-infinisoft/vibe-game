'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Scene3D component with no SSR
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
});

export default function GameContainer() {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
      <Scene3D />
    </div>
  );
}
