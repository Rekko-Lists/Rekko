import { useEffect, useMemo, useState } from 'react';

type CloudItem = {
  id: string;
  top: number;
  delay: number;
  duration: number;
  size: number;
};

interface Props {
  enabled: boolean;
}

const MAX_CLOUDS = 4;
const INITIAL_CLOUDS = 4;

const styles = {
  layer: 'pointer-events-none absolute inset-0 overflow-hidden',
  cloud: 'absolute left-[-24vw] select-none will-change-transform animate-cloud-drift',
  img: 'block h-full w-full object-contain',
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createCloud(isInitial = false): CloudItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    top: randomBetween(2, 92),
    delay: isInitial ? randomBetween(0, 0.3) : randomBetween(0, 0.5),
    duration: randomBetween(16, 28),
    size: randomBetween(150, 320),
  };
}

export default function MovingCloudBackground({ enabled }: Props) {
  const initialClouds = useMemo(
    () => Array.from({ length: INITIAL_CLOUDS }, () => createCloud(true)),
    [],
  );
  const [clouds, setClouds] = useState<CloudItem[]>(initialClouds);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setClouds((current) => {
        if (current.length >= MAX_CLOUDS) {
          return current;
        }

        const slots = MAX_CLOUDS - current.length;
        const batchSize = Math.min(slots, 2);
        const nextBatch = Array.from({ length: batchSize }, () => createCloud());

        return [...current, ...nextBatch];
      });
    }, 1100);

    return () => window.clearInterval(intervalId);
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      return;
    }

    setClouds(initialClouds);
  }, [enabled, initialClouds]);

  return (
    <div className={styles.layer} aria-hidden="true">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className={styles.cloud}
          onAnimationEnd={() => {
            setClouds((current) => current.filter((item) => item.id !== cloud.id));
          }}
          style={{
            top: `${cloud.top}%`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
            width: `${cloud.size}px`,
          }}
        >
          <img src="/OrangeCloud.png" alt="" className={styles.img} />
        </div>
      ))}
    </div>
  );
}
