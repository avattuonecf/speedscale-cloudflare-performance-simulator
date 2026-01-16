import { SpeedTestResult, TestMetric, ApiResponse } from '@shared/types';
async function measureRequest(endpoint: string, label: string, targetUrl?: string): Promise<TestMetric> {
  const start = performance.now();
  const queryParams = new URLSearchParams();
  queryParams.set('t', Date.now().toString());
  if (targetUrl) {
    queryParams.set('url', targetUrl);
  }
  const response = await fetch(`${endpoint}?${queryParams.toString()}`);
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
    targetUrl: targetUrl,
    resolvedIP: data.resolvedIP,
    testedUrl: data.testedUrl
  };
}
export async function runSpeedTest(cfUrl?: string, originUrl?: string): Promise<SpeedTestResult> {
  // Parallel execution of edge and origin simulations with their respective targets
  const [edgeResult, originResult] = await Promise.all([
    measureRequest('/api/simulate/edge', 'Cloudflare Edge', cfUrl),
    measureRequest('/api/simulate/origin', 'Origin Server', originUrl)
  ]);
  const speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  try {
    await fetch('/api/stats/increment', { method: 'POST' });
  } catch (e) {
    console.warn('Failed to update global stats', e);
  }
  return {
    edge: edgeResult,
    origin: originResult,
    speedup,
    targetUrl: cfUrl,
    originUrl: originUrl
  };
}