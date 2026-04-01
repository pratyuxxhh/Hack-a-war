import { useState, useCallback, useRef } from 'react';
import { dummyResults } from '../data/dummyResults';

const useArchitecture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const intervalRef = useRef(null);

  const generateArchitecture = useCallback((userPrompt) => {
    setIsLoading(true);
    setProgress(0);
    setResults(null);
    setError(null);
    setPrompt(userPrompt);

    // Simulate AI processing with progress updates
    const totalDuration = 10000; // 10 seconds
    const updateInterval = 200; // update every 200ms
    const totalSteps = totalDuration / updateInterval;
    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep++;
      // Ease-in curve for realistic progress
      const rawProgress = currentStep / totalSteps;
      const easedProgress = Math.min(
        rawProgress < 0.8
          ? rawProgress * 1.1
          : 0.88 + (rawProgress - 0.8) * 0.6,
        0.98
      );
      setProgress(easedProgress * 100);

      if (currentStep >= totalSteps) {
        clearInterval(intervalRef.current);
        setProgress(100);

        // Return dummy results after a short delay
        setTimeout(() => {
          setResults({
            ...dummyResults,
            prompt: userPrompt,
          });
          setIsLoading(false);
        }, 500);
      }
    }, updateInterval);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLoading(false);
    setProgress(0);
    setResults(null);
    setError(null);
    setPrompt('');
  }, []);

  return {
    isLoading,
    progress,
    results,
    error,
    prompt,
    generateArchitecture,
    reset,
  };
};

export default useArchitecture;
