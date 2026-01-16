import { SpeedTestResult, TestMetric, ApiResponse } from '@shared/types';
async function measureRequest(url: string, label: string, targetUrl?: string): Promise<TestMetric> {
  const start = performance.now();
  const queryParams = new URLSearchParams();
  queryParams.set('t', Date.now().toString());
  if (targetUrl) {
    queryParams.set('url', targetUrl);
  }
  const response = await fetch(`${url}?${queryParams.toString()}`);
  const ttfb = performance.now() - start;
  const json = await response.json() as ApiResponse<any>;
  const data = json.data || {};
  const end = performance.now();
  return {
    ttfb: Math.round(ttfb),
    duration: Math.round(end - (start + ttfb)),
    totalTime: Math.round(end - start),
    size: data.size || '0kb',
    label,
    targetUrl: targetUrl
  };
}
export async function runSpeedTest(targetUrl?: string): Promise<SpeedTestResult> {
  // Parallel execution of edge and origin simulations
  const [edgeResult, originResult] = await Promise.all([
    measureRequest('/api/simulate/edge', 'Cloudflare Edge', targetUrl),
    measureRequest('/api/simulate/origin', 'Origin Server', targetUrl)
  ]);
  const speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  // Sync with Global Durable Object stats
  try {
    await fetch('/api/stats/increment', { method: 'POST' });
  } catch (e) {
    console.warn('Failed to update global stats', e);
  }
  return {
    edge: edgeResult,
    origin: originResult,
    speedup,
    targetUrl
  };
}