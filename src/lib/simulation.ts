import { SpeedTestResult, TestMetric, ApiResponse } from '@shared/types';
async function measureRequest(endpoint: string, label: string, targetUrl?: string): Promise<TestMetric> {
  const start = performance.now();
  const queryParams = new URLSearchParams();
  queryParams.set('t', Date.now().toString());
  if (targetUrl) {
    queryParams.set('url', targetUrl);
  }
  try {
    const response = await fetch(`${endpoint}?${queryParams.toString()}`);
    const ttfb = performance.now() - start;
    const json = await response.json() as ApiResponse<any>;
    const data = json.data || {};
    const end = performance.now();
    return {
      ttfb: Math.max(0, Math.round(ttfb)),
      duration: Math.max(0, Math.round(end - (start + ttfb))),
      totalTime: Math.max(1, Math.round(end - start)), // Ensure at least 1ms to prevent division by zero
      size: data.size || '0kb',
      label,
      targetUrl: targetUrl,
      resolvedIP: data.resolvedIP,
      testedUrl: data.testedUrl
    };
  } catch (error) {
    console.error(`Measurement failed for ${label}`, error);
    throw error;
  }
}
export async function runSpeedTest(cfUrl?: string, originUrl?: string): Promise<SpeedTestResult> {
  // Parallel execution
  const [edgeResult, originResult] = await Promise.all([
    measureRequest('/api/simulate/edge', 'Cloudflare Edge', cfUrl),
    measureRequest('/api/simulate/origin', 'Origin Server', originUrl)
  ]);
  // Calculate speedup with protection against zero-division
  let speedup = 1.0;
  if (edgeResult.totalTime > 0) {
    speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  }
  // Fire and forget stats increment
  fetch('/api/stats/increment', { method: 'POST' }).catch(() => {});
  return {
    edge: edgeResult,
    origin: originResult,
    speedup: isNaN(speedup) || !isFinite(speedup) ? 1.0 : speedup,
    targetUrl: cfUrl,
    originUrl: originUrl
  };
}