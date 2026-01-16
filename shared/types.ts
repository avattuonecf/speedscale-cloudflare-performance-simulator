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
export interface TestMetric {
  ttfb: number;
  duration: number;
  totalTime: number;
  size: string;
  label: string;
  targetUrl?: string;
}
export interface SpeedTestResult {
  edge: TestMetric;
  origin: TestMetric;
  speedup: number;
  targetUrl?: string;
}