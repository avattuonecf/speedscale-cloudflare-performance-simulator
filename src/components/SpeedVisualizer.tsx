import React from 'react';
import { SpeedTestResult, NetworkBreakdown } from '@shared/types';
import { MetricCard } from '@/components/ui/metric-card';
import { DetailedWaterfall } from '@/components/DetailedWaterfall';
import { Zap, Shield, Globe, Clock, ArrowRight, MousePointer2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface SpeedVisualizerProps {
  results: SpeedTestResult;
}
const SourceBadge = ({ label }: { label: string }) => (
  <Badge variant="outline" className="px-3 py-1 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm">
    <CheckCircle2 className="w-2.5 h-2.5" />
    {label} Verified
  </Badge>
);
export function SpeedVisualizer({ results }: SpeedVisualizerProps) {
  const edgeBreakdown: NetworkBreakdown = results.edge?.breakdown || { dns: 0, connect: 0, tls: 0, wait: 0, download: 0 };
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-3">
          <SourceBadge label="Local Browser" />
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-blue-200 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
            <MousePointer2 className="w-2.5 h-2.5" />
            Zero-Proxy Measurement
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            <span className="text-[#F38020]">{results.speedup}x</span> Faster
          </h2>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">
            <span>Direct Path: {results.origin.totalTime}ms</span>
            <ArrowRight className="w-3 h-3 text-[#F38020]" />
            <span className="text-[#F38020]">Edge Path: {results.edge.totalTime}ms</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Edge Latency"
          value={`${results.edge.totalTime}ms`}
          subValue={`IP: ${results.edge.resolvedIP || 'N/A'}`}
          variant="edge"
        />
        <MetricCard
          label="Direct Latency"
          value={`${results.origin.totalTime}ms`}
          subValue={`IP: ${results.origin.resolvedIP || 'N/A'}`}
          variant="origin"
        />
        <MetricCard
          label="Edge TTFB"
          value={`${results.edge.ttfb}ms`}
          subValue="First byte from Edge"
          variant="edge"
        />
        <MetricCard
          label="Direct TTFB"
          value={`${results.origin.ttfb}ms`}
          subValue="First byte from Origin"
          variant="origin"
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold tracking-tight">Latency Spectrum Analysis</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/60">
              <Globe className="w-3 h-3" /> DNS
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/60">
              <Shield className="w-3 h-3" /> TLS
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/60">
              <Clock className="w-3 h-3" /> TTFB
            </div>
          </div>
        </div>
        <DetailedWaterfall edge={results.edge} origin={results.origin} />
      </div>
      <div className="bg-secondary/20 rounded-2xl p-6 text-center border border-dashed">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold text-foreground">Technical Note:</span> All benchmarks are executed 
          <span className="text-[#F38020] font-bold"> directly within your browser</span> using the W3C Resource Timing API. 
          This provides a 100% authentic representation of how your specific network connection interacts with both the global Edge and the origin servers.
        </p>
      </div>
    </div>
  );
}