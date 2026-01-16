import { SpeedTestResult, TestMetric, ApiResponse, NetworkBreakdown } from '@shared/types';
async function measureRequest(endpoint: string, label: string, targetUrl?: string): Promise<TestMetric> {
  const start = performance.now();
  const queryParams = new URLSearchParams();
  queryParams.set('t', Date.now().toString());
  if (targetUrl) {
    queryParams.set('url', targetUrl);
  }
  try {
    const response = await fetch(`${endpoint}?${queryParams.toString()}`);
    const ttfbMeasured = performance.now() - start;
    const json = await response.json() as ApiResponse<any>;
    const data = json.data || {};
    const end = performance.now();
    const totalTime = Math.max(1, Math.round(end - start));
    // Simulate granular breakdown based on the label and total time
    const isEdge = label.includes('Edge');
    const protocol = data.protocol || 'https';
    // Realistic proportions
    // Edge has near-zero DNS/Connect/TLS due to global anycast and warm connections
    const dns = isEdge ? Math.round(Math.random() * 2 + 1) : Math.round(totalTime * 0.15);
    const connect = isEdge ? Math.round(Math.random() * 3 + 2) : Math.round(totalTime * 0.1);
    const tls = (protocol === 'https') 
      ? (isEdge ? Math.round(Math.random() * 5 + 5) : Math.round(totalTime * 0.15))
      : 0;
    // Remaining time is Wait (TTFB) and Download
    const remaining = totalTime - (dns + connect + tls);
    const wait = Math.round(remaining * 0.8);
    const download = Math.max(1, remaining - wait);
    const breakdown: NetworkBreakdown = {
      dns,
      connect,
      tls,
      wait,
      download
    };
    return {
      ttfb: Math.round(ttfbMeasured),
      duration: Math.round(end - (start + ttfbMeasured)),
      totalTime,
      size: data.size || '0kb',
      label,
      targetUrl,
      resolvedIP: data.resolvedIP,
      testedUrl: data.testedUrl,
      protocol: protocol as 'http' | 'https',
      error: data.error,
      breakdown
    };
  } catch (error) {
    console.error(`Measurement failed for ${label}`, error);
    throw error;
  }
}
export async function runSpeedTest(cfUrl?: string, originUrl?: string): Promise<SpeedTestResult> {
  const [edgeResult, originResult] = await Promise.all([
    measureRequest('/api/simulate/edge', 'Cloudflare Edge', cfUrl),
    measureRequest('/api/simulate/origin', 'Origin Server', originUrl)
  ]);
  let speedup = 1.0;
  if (edgeResult.totalTime > 0) {
    speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  }
  fetch('/api/stats/increment', { method: 'POST' }).catch(() => {});
  return {
    edge: edgeResult,
    origin: originResult,
    speedup: isNaN(speedup) || !isFinite(speedup) ? 1.0 : speedup,
    targetUrl: cfUrl,
    originUrl: originUrl
  };
}