import { SpeedTestResult, TestMetric, ApiResponse, NetworkBreakdown } from '@shared/types';
async function fetchMetadata(url: string): Promise<{ ip: string; size: string }> {
  try {
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
    const json = await res.json() as ApiResponse<any>;
    if (json.success && json.data) {
      return { ip: json.data.ip, size: json.data.size };
    }
  } catch (e) {
    console.warn('Metadata fetch failed', e);
  }
  return { ip: 'N/A', size: 'Unknown' };
}
async function measureFromBrowser(url: string, label: string): Promise<TestMetric> {
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;
  const start = performance.now();
  try {
    // We use no-cors because we only care about the network timing, not the content
    await fetch(targetUrl, { 
      mode: 'no-cors', 
      cache: 'no-cache',
      credentials: 'omit'
    });
    const end = performance.now();
    const totalTime = Math.max(1, Math.round(end - start));
    // Try to find the performance entry for this specific fetch
    const entries = performance.getEntriesByName(targetUrl);
    const entry = entries[entries.length - 1] as PerformanceResourceTiming;
    const metadata = await fetchMetadata(targetUrl);
    let breakdown: NetworkBreakdown;
    let isEstimated = false;
    // If Timing-Allow-Origin is set, we get high-fidelity phases
    if (entry && entry.duration > 0 && entry.requestStart > 0) {
      breakdown = {
        dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
        connect: Math.round(entry.connectEnd - entry.connectStart),
        tls: entry.secureConnectionStart > 0 ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
        wait: Math.round(entry.responseStart - entry.requestStart),
        download: Math.round(entry.responseEnd - entry.responseStart)
      };
    } else {
      // Fallback: Percentage-based split based on measured totalTime
      isEstimated = true;
      const isHttps = targetUrl.startsWith('https');
      breakdown = {
        dns: Math.round(totalTime * 0.1),
        connect: Math.round(totalTime * 0.1),
        tls: isHttps ? Math.round(totalTime * 0.1) : 0,
        wait: Math.round(totalTime * 0.6),
        download: Math.max(1, totalTime - (Math.round(totalTime * 0.1) + Math.round(totalTime * 0.1) + (isHttps ? Math.round(totalTime * 0.1) : 0) + Math.round(totalTime * 0.6)))
      };
    }
    return {
      ttfb: breakdown.wait,
      duration: breakdown.download,
      totalTime,
      size: metadata.size,
      label,
      targetUrl,
      resolvedIP: metadata.ip,
      testedUrl: targetUrl,
      protocol: targetUrl.startsWith('https') ? 'https' : 'http',
      source: 'browser',
      isEstimated,
      breakdown,
      browserMetadata: {
        userAgent: navigator.userAgent,
        timingAvailable: !!entry
      }
    };
  } catch (err: any) {
    console.error(`Benchmark failed for ${label}: ${err?.message || 'Unknown error'}`);
    // Return a failed metric object instead of crashing
    const totalTime = 1000;
    return {
      ttfb: 800,
      duration: 200,
      totalTime,
      size: '0kb',
      label,
      error: true,
      source: 'browser',
      protocol: 'https',
      breakdown: { dns: 100, connect: 100, tls: 100, wait: 600, download: 100 }
    };
  }
}
export async function runSpeedTest(cfUrl?: string, originUrl?: string): Promise<SpeedTestResult> {
  // Use defaults if none provided
  const targetCf = cfUrl || 'https://www.cloudflare.com';
  const targetOrigin = originUrl || 'https://www.google.com';
  const [edgeResult, originResult] = await Promise.all([
    measureFromBrowser(targetCf, 'Cloudflare Edge'),
    measureFromBrowser(targetOrigin, 'Origin Server')
  ]);
  const speedup = Number((originResult.totalTime / edgeResult.totalTime).toFixed(1));
  // Async stats increment
  fetch('/api/stats/increment', { method: 'POST' }).catch(() => {});
  return {
    edge: edgeResult,
    origin: originResult,
    speedup: isNaN(speedup) || !isFinite(speedup) ? 1.0 : Math.max(0.1, speedup),
    targetUrl: targetCf,
    originUrl: targetOrigin,
    measuredAt: Date.now()
  };
}