import { useEffect, useState } from 'react';

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
