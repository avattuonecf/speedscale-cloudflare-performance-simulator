import React from 'react';
import { SpeedTestResult } from '@shared/types';
import { MetricCard } from '@/components/ui/metric-card';
import { DetailedWaterfall } from '@/components/DetailedWaterfall';
import { Zap, Server, Shield, Globe, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface SpeedVisualizerProps {
  results: SpeedTestResult;
}
export function SpeedVisualizer({ results }: SpeedVisualizerProps) {
  const cleanUrl = (url?: string) => {
    if (!url) return 'Generic Node';
    return url.replace(/^https?:\/\//, '').split('/')[0];
  };
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="px-4 py-1.5 gap-2 border-[#F38020]/30 bg-[#F38020]/5 text-[#F38020] rounded-full">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-bold">Edge Routed:</span> {results.edge.resolvedIP || 'Global Anycast'}
          </Badge>
          <Badge variant="outline" className="px-4 py-1.5 gap-2 border-slate-200 bg-slate-50 text-slate-600 rounded-full">
            <Server className="w-3.5 h-3.5" />
            <span className="font-bold">Direct IP:</span> {results.origin.resolvedIP || 'Direct Path'}
          </Badge>
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            <span className="text-[#F38020]">{results.speedup}x</span> Faster
          </h2>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">
            <span>Origin: {results.origin.totalTime}ms</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[#F38020]">Edge: {results.edge.totalTime}ms</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 pt-2">
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/60">
             <Globe className="w-3 h-3" /> DNS
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/60">
             <Shield className="w-3 h-3" /> TLS
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground/60">
             <Clock className="w-3 h-3" /> TTFB
           </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Delivery Speed" value={`${results.edge.totalTime}ms`} subValue="Cloudflare Network" variant="edge" />
        <MetricCard label="Origin Latency" value={`${results.origin.totalTime}ms`} subValue="Back-end Processing" variant="origin" />
        <MetricCard label="DNS Resolution" value={`${results.edge.breakdown.dns}ms`} subValue="Anycast Cache" variant="edge" />
        <MetricCard label="Network TLS" value={`${results.edge.breakdown.tls}ms`} subValue="1.3 Handshake" variant="edge" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold tracking-tight">Full Request Diagnostics</h3>
          <span className="text-xs text-muted-foreground font-medium italic">Waterfall view (Time-to-Last-Byte)</span>
        </div>
        <DetailedWaterfall edge={results.edge} origin={results.origin} />
      </div>
      <div className="bg-secondary/20 rounded-2xl p-6 text-center border border-dashed">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold text-foreground">Diagnostic Insight:</span> Cloudflare reduces latency primarily by terminating the TLS handshake at the Edge and caching DNS records globally. The origin server in this simulation experienced {Math.round(results.origin.breakdown.wait / results.edge.breakdown.wait)}x more wait time due to unoptimized pathing.
        </p>
      </div>
    </div>
  );
}