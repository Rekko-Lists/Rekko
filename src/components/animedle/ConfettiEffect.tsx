import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect() {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF8C00', '#FFA500', '#FFD700', '#FF6347', '#FF4500'],
    });
  }, []);
  return null;
}
