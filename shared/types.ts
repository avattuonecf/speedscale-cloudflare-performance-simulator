export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface NetworkBreakdown {
  dns: number;
  connect: number;
  tls: number;
  wait: number;
  download: number;
}
export interface TracerouteHop {
  id: number;
  label: string;
  latency: number;
  ip: string;
}
export interface TestMetric {
  ttfb: number;
  duration: number;
  totalTime: number;
  size: string;
  label: string;
  targetUrl?: string;
  resolvedIP?: string;
  testedUrl?: string;
  breakdown: NetworkBreakdown;
  traceroute?: TracerouteHop[];
  protocol: 'http' | 'https';
  error?: boolean;
  source: 'worker' | 'browser';
  isEstimated?: boolean;
  ipAddress?: string;
  asn?: string;
  browserMetadata?: {
    userAgent: string;
    timingAvailable: boolean;
  };
}
export interface SpeedTestResult {
  edge: TestMetric;
  origin: TestMetric;
  speedup: number;
  targetUrl?: string;
  originUrl?: string;
  measuredAt: number;
}