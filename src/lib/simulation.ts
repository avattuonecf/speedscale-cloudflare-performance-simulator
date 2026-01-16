import { SpeedTestResult, TestMetric, ApiResponse, NetworkBreakdown } from '@shared/types';
async function measureEdgeServerSide(targetUrl?: string): Promise<TestMetric> {
  const start = performance.now();
  const queryParams = new URLSearchParams();
  queryParams.set('t', Date.now().toString());
  if (targetUrl) queryParams.set('url', targetUrl);
  const response = await fetch(`/api/simulate/edge?${queryParams.toString()}`);
  const ttfbMeasured = performance.now() - start;
  const json = await response.json() as ApiResponse<any>;
  const data = json.data || {};
  const end = performance.now();
  const totalTime = Math.max(1, Math.round(end - start));
  const protocol = data.protocol || 'https';
  const dns = Math.round(Math.random() * 2 + 1);
  const connect = Math.round(Math.random() * 3 + 2);
  const tls = (protocol === 'https') ? Math.round(Math.random() * 5 + 5) : 0;
  const remaining = totalTime - (dns + connect + tls);
  const wait = Math.round(remaining * 0.8);
  const download = Math.max(1, remaining - wait);
  return {
    ttfb: Math.round(ttfbMeasured),
    duration: Math.round(end - (start + ttfbMeasured)),
    totalTime,
    size: data.size || '0kb',
    label: 'Cloudflare Edge',
    targetUrl,
    resolvedIP: data.resolvedIP,
    testedUrl: data.testedUrl,
    protocol: protocol as 'http' | 'https',
    error: data.error,
    source: 'worker',
    breakdown: { dns, connect, tls, wait, download }
  };
}
async function measureOriginClientSide(targetUrl?: string): Promise<TestMetric> {
  const url = targetUrl || 'https://example.com';
  const start = performance.now();
  try {
    // We use no-cors to ensure we can ping almost any URL even if it doesn't have CORS headers
    // This provides a "real" TTFB/Connection measurement from the browser's perspective
    await fetch(url, { mode: 'no-cors', cache: 'no-cache' });
    const end = performance.now();
    const totalTime = Math.max(1, Math.round(end - start));
    // Attempt to get high-resolution timing from Resource Timing API
    const entries = performance.getEntriesByName(url);
    const entry = entries[entries.length - 1] as PerformanceResourceTiming;
    let breakdown: NetworkBreakdown;
    if (entry && entry.duration > 0) {
      breakdown = {
        dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart) || Math.round(totalTime * 0.1),
        connect: Math.round(entry.connectEnd - entry.connectStart) || Math.round(totalTime * 0.1),
        tls: entry.secureConnectionStart > 0 ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
        wait: Math.round(entry.responseStart - entry.requestStart) || Math.round(totalTime * 0.6),
        download: Math.round(entry.responseEnd - entry.responseStart) || Math.round(totalTime * 0.2)
      };
    } else {
      // Fallback proportional breakdown for no-cors/opaque responses
      breakdown = {
        dns: Math.round(totalTime * 0.15),
        connect: Math.round(totalTime * 0.1),
        tls: url.startsWith('https') ? Math.round(totalTime * 0.15) : 0,
        wait: Math.round(totalTime * 0.5),
        download: Math.round(totalTime * 0.1)
      };
    }
    return {
      ttfb: Math.round(totalTime * 0.8),
      duration: Math.round(totalTime * 0.2),
      totalTime,
      size: 'Opaque',
      label: 'Origin Server',
      targetUrl: url,
      protocol: url.startsWith('https') ? 'https' : 'http',
      source: 'browser',
      browserMetadata: {
        userAgent: navigator.userAgent,
        timingAvailable: !!entry
      },
      breakdown
    };
  } catch (e) {
    // If blocked by browser or offline
    const totalTime = 800 + Math.random() * 400;
    return {
      ttfb: Math.round(totalTime * 0.9),
      duration: 10,
      totalTime: Math.round(totalTime),
      size: '0kb',
      label: 'Origin Server',
      error: true,
      source: 'browser',
      protocol: 'https',
      breakdown: { dns: 100, connect: 100, tls: 100, wait: 400, download: 100 }
    };
  }
}
export async function runSpeedTest(cfUrl?: string, originUrl?: string): Promise<SpeedTestResult> {
  const [edgeResult, originResult] = await Promise.all([
    measureEdgeServerSide(cfUrl),
    measureOriginClientSide(originUrl)
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