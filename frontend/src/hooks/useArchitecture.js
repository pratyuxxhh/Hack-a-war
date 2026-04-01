import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const MIN_LOADING_MS = 3500;

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  const text = String(value || '');
  const nums = (text.match(/\d[\d,]*/g) || [])
    .map((n) => Number.parseInt(n.replace(/,/g, ''), 10))
    .filter((n) => Number.isFinite(n));

  if (!nums.length) return 0;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[nums.length - 1]) / 2);
};

const normalizeDemoPayload = (payload, userPrompt) => {
  const services = Array.isArray(payload?.aws_services) ? payload.aws_services : [];
  const costRows = Array.isArray(payload?.cost_breakdown?.per_service) ? payload.cost_breakdown.per_service : [];
  const monthly = toNumber(payload?.cost_breakdown?.monthly_estimate);

  const normalizedServices = services.map((service) => ({
    name: service?.name || 'AWS Service',
    category: service?.role || 'Service',
    description: [service?.justification, service?.data_flow].filter(Boolean).join(' '),
  }));

  const normalizedBreakdown = costRows.map((row) => ({
    service: row?.service || 'Service',
    cost: toNumber(row?.cost),
    detail: row?.note || '',
  }));

  const diagram = payload?.mermaid || '';

  return {
    prompt: userPrompt,
    architectures: [
      {
        id: 'cost-optimized',
        type: 'Cost-Optimized',
        icon: '💰',
        tagline: 'Maximum value, minimum spend',
        description: 'Lean architecture tuned for lower baseline cost while preserving core capabilities.',
        explanation: payload?.cost_breakdown?.cost_notes || 'Generated from backend recommendation.',
        services: normalizedServices,
        costEstimate: {
          monthly,
          breakdown: normalizedBreakdown,
          tier: 'Low',
        },
        diagram,
      },
      {
        id: 'balanced',
        type: 'Balanced',
        icon: '⚖️',
        tagline: 'Best of both worlds',
        description: 'Balanced trade-off between cost, performance, and resilience based on generated plan.',
        explanation: payload?.cost_breakdown?.cost_notes || 'Generated from backend recommendation.',
        services: normalizedServices,
        costEstimate: {
          monthly,
          breakdown: normalizedBreakdown,
          tier: 'Medium',
        },
        diagram,
      },
      {
        id: 'scalable',
        type: 'Scalable',
        icon: '📈',
        tagline: 'Built for massive growth',
        description: 'Scaling-focused architecture variant for heavier traffic and stricter availability needs.',
        explanation: payload?.cost_breakdown?.cost_notes || 'Generated from backend recommendation.',
        services: normalizedServices,
        costEstimate: {
          monthly,
          breakdown: normalizedBreakdown,
          tier: 'High',
        },
        diagram,
      },
    ],
  };
};

const normalizeApiResponse = (responseJson, userPrompt) => {
  const payload = responseJson?.data ?? responseJson;

  if (Array.isArray(payload?.architectures)) {
    return { ...payload, prompt: payload.prompt || userPrompt };
  }

  if (Array.isArray(payload?.aws_services)) {
    return normalizeDemoPayload(payload, userPrompt);
  }

  throw new Error('Backend response format is not supported.');
};

const useArchitecture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const intervalRef = useRef(null);

  const generateArchitecture = useCallback(async (input) => {
    const formInput = typeof input === 'string'
      ? { prompt: input, idea: input, users: null, budget: '', features: [] }
      : {
          prompt: input?.prompt || input?.idea || '',
          idea: input?.idea || input?.prompt || '',
          users: input?.users ?? null,
          budget: input?.budget || '',
          features: Array.isArray(input?.features) ? input.features : [],
        };

    setIsLoading(true);
    setProgress(0);
    setResults(null);
    setError(null);
    setPrompt(formInput.prompt);
    const startedAt = Date.now();

    intervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8 + 2, 92));
    }, 220);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formInput),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const normalizedResults = normalizeApiResponse(data, formInput.prompt);
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setResults(normalizedResults);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError(err instanceof Error ? err.message : 'Failed to generate architecture.');
    } finally {
      setIsLoading(false);
    }
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
