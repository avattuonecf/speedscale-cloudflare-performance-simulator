import React from 'react';
import { SpeedTestResult, NetworkBreakdown } from '@shared/types';
import { MetricCard } from '@/components/ui/metric-card';
import { DetailedWaterfall } from '@/components/DetailedWaterfall';
import { TracerouteSection } from '@/components/TracerouteSection';
import { Zap, Globe, ArrowRight, MousePointer2, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-8">
        <div className="flex flex-wrap justify-center gap-3">
          <SourceBadge label="Local Browser" />
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-[#F38020]/20 bg-[#F38020]/5 text-[#F38020] rounded-full text-[9px] font-black uppercase tracking-tighter">
            <ShieldCheck className="w-2.5 h-2.5" />
            Edge IP: {results.edge.resolvedIP}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-slate-200 bg-slate-50 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
            <Globe className="w-2.5 h-2.5" />
            Origin IP: {results.origin.resolvedIP}
          </Badge>
        </div>
        <div className="space-y-4">
          <h2 className="text-8xl md:text-9xl font-black tracking-tighter leading-none">
            <span className="text-[#F38020]">{results.speedup}x</span>
          </h2>
          <div className="text-3xl font-black tracking-tighter uppercase italic opacity-80">Faster via Cloudflare Edge</div>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.4em] pt-4">
            <span className="opacity-50">Origin: {results.origin.totalTime}ms</span>
            <ArrowRight className="w-3 h-3 text-[#F38020]" />
            <span className="text-[#F38020]">Edge: {results.edge.totalTime}ms</span>
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
          subValue="Edge Handshake"
          variant="edge"
        />
        <MetricCard
          label="Direct TTFB"
          value={`${results.origin.ttfb}ms`}
          subValue="Origin Handshake"
          variant="origin"
        />
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black uppercase tracking-tighter">Latency Spectrum Analysis</h3>
        </div>
        <DetailedWaterfall edge={results.edge} origin={results.origin} />
      </div>
      <div className="space-y-6">
        <TracerouteSection edge={results.edge} origin={results.origin} />
      </div>
      <div className="bg-secondary/20 rounded-2xl p-6 text-center border border-dashed">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold text-foreground">Technical Methodology:</span> All benchmarks are executed
          <span className="text-[#F38020] font-bold"> natively in-browser</span> via W3C Resource Timing API.
          Traceroute hops are estimated based on local RTT signatures and regional IXP database mapping.
        </p>
      </div>
    </div>
  );
}