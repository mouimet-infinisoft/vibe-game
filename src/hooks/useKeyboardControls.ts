import { useState, useEffect } from 'react';

// Define the movement state interface
interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

// Define the key mapping
const KEYS = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'jump'
};

export const useKeyboardControls = () => {
  // Initialize movement state
  const [movement, setMovement] = useState<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });

  useEffect(() => {
    // Get the movement field by key code
    const getMovementField = (code: string): string | undefined => KEYS[code as keyof typeof KEYS];

    // Handle key down events
    const handleKeyDown = (event: KeyboardEvent) => {
      const field = getMovementField(event.code);
      if (field) {
        setMovement((state) => ({ ...state, [field]: true }));
      }
    };

    // Handle key up events
    const handleKeyUp = (event: KeyboardEvent) => {
      const field = getMovementField(event.code);
      if (field) {
        setMovement((state) => ({ ...state, [field]: false }));
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};

export default useKeyboardControls;
