import { OP_SETTINGS } from '@/constants';
import { useEffect, useRef, useState } from 'react';

export function useDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }

    handleResize(); // Set initial dimensions

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
}

export function useAtomicDate(delay: number = 1000) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), delay);
    return () => clearInterval(interval);
  }, [delay]);
  return currentDateTime;
}

export function useSetInterval(
  cb: () => void | Promise<void>,
  INTERVAL = OP_SETTINGS.default_tick_interval,
) {
  const savedCallback = useRef<() => void | Promise<void>>(null);

  useEffect(() => {
    savedCallback.current = cb;
    Promise.resolve(cb()).then(() => {
      console.info('useSetInterval callback [first invocation]');
    });
  }, [cb]);
  return useEffect(() => {
    function caller() {
      if (savedCallback.current)
        Promise.resolve(savedCallback.current()).then(() => {
          console.info('useSetInterval callback invoked');
        });
    }
    const interval = setInterval(caller, INTERVAL);
    return () => clearInterval(interval);
  }, [INTERVAL]);
}
