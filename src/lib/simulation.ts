export interface TestMetric {
  ttfb: number;
  duration: number;
  totalTime: number;
  size: string;
  label: string;
}
export interface SpeedTestResult {
  edge: TestMetric;
  origin: TestMetric;
  speedup: number;
}
async function measureRequest(url: string, label: string): Promise<TestMetric> {
  const start = performance.now();
  let ttfb = 0;
  const response = await fetch(`${url}?t=${Date.now()}`);
  ttfb = performance.now() - start;
  const data = await response.json();
  const end = performance.now();
  return {
    ttfb: Math.round(ttfb),
    duration: Math.round(end - (start + ttfb)),
    totalTime: Math.round(end - start),
    size: data.size || '0kb',
    label
  };
}
export async function runSpeedTest(): Promise<SpeedTestResult> {
  // Parallel execution
  const [edgeResult, originResult] = await Promise.all([
    measureRequest('/api/simulate/edge', 'Cloudflare Edge'),
    measureRequest('/api/simulate/origin', 'Origin Server')
  ]);
  const speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  // Sync with DO stats
  try {
    await fetch('/api/stats/increment', { method: 'POST' });
  } catch (e) {
    console.warn('Failed to update global stats', e);
  }
  return {
    edge: edgeResult,
    origin: originResult,
    speedup
  };
}