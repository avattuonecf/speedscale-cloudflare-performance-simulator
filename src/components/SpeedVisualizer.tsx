import React from 'react';
import { SpeedTestResult, NetworkBreakdown } from '@shared/types';
import { MetricCard } from '@/components/ui/metric-card';
import { DetailedWaterfall } from '@/components/DetailedWaterfall';
import { Zap, Server, Shield, Globe, Clock, ArrowRight, MousePointer2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface SpeedVisualizerProps {
  results: SpeedTestResult;
}
const SourceBadge = ({ source }: { source: 'worker' | 'browser' }) => {
  if (source === 'browser') {
    return (
      <Badge variant="outline" className="px-3 py-1 gap-1.5 border-blue-200 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
        <MousePointer2 className="w-2.5 h-2.5" />
        Measured from Browser ↗
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="px-3 py-1 gap-1.5 border-[#F38020]/30 bg-[#F38020]/5 text-[#F38020] rounded-full text-[9px] font-black uppercase tracking-tighter">
      <Zap className="w-2.5 h-2.5" />
      Cloudflare Edge Proxy 🌐
    </Badge>
  );
};
export function SpeedVisualizer({ results }: SpeedVisualizerProps) {
  const edgeBreakdown: NetworkBreakdown = results.edge?.breakdown || { dns: 0, connect: 0, tls: 0, wait: 0, download: 0 };
  const originBreakdown: NetworkBreakdown = results.origin?.breakdown || { dns: 0, connect: 0, tls: 0, wait: 0, download: 0 };
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-3">
          <SourceBadge source={results.edge.source} />
          <SourceBadge source={results.origin.source} />
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            <span className="text-[#F38020]">{results.speedup}x</span> Faster
          </h2>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">
            <span>Origin (Local): {results.origin.totalTime}ms</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[#F38020]">Edge (Cloudflare): {results.edge.totalTime}ms</span>
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
        <MetricCard 
          label="Edge Hop Time" 
          value={`${results.edge.totalTime}ms`} 
          subValue="via CF Global Network" 
          variant="edge" 
        />
        <MetricCard 
          label="Browser Latency" 
          value={`${results.origin.totalTime}ms`} 
          subValue="Direct from your device" 
          variant="origin" 
        />
        <MetricCard 
          label="Resolution (Edge)" 
          value={`${edgeBreakdown.dns}ms`} 
          subValue="Anycast Speed" 
          variant="edge" 
        />
        <MetricCard 
          label="TLS (Edge)" 
          value={`${edgeBreakdown.tls}ms`} 
          subValue="Optimized 1.3" 
          variant="edge" 
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold tracking-tight">Full Request Diagnostics</h3>
          <span className="text-xs text-muted-foreground font-medium italic">Waterfall comparison</span>
        </div>
        <DetailedWaterfall edge={results.edge} origin={results.origin} />
      </div>
      <div className="bg-secondary/20 rounded-2xl p-6 text-center border border-dashed">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <span className="font-bold text-foreground">Real User Experience Insight:</span> We compared a request routed via Cloudflare's Edge to a direct request initiated by <span className="text-blue-600 font-bold">your local browser</span>. The Edge path is consistently faster due to warm connections and global DNS caching.
        </p>
      </div>
    </div>
  );
}