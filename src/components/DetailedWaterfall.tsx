import React from 'react';
import { motion } from 'framer-motion';
import { TestMetric, NetworkBreakdown } from '@shared/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Shield, Zap, Clock, Download, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
interface DetailedWaterfallProps {
  edge: TestMetric;
  origin: TestMetric;
}
export function DetailedWaterfall({ edge, origin }: DetailedWaterfallProps) {
  const maxTime = Math.max(edge.totalTime || 1, origin.totalTime || 1, 1);
  const renderStack = (metric: TestMetric) => {
    const isEdge = metric.source === 'worker';
    const breakdown: NetworkBreakdown = metric.breakdown || { dns: 0, connect: 0, tls: 0, wait: 0, download: 0 };
    const phases = [
      { label: isEdge ? 'Anycast DNS' : 'Browser DNS', value: breakdown.dns, color: isEdge ? 'bg-[#F38020]/30' : 'bg-slate-300', icon: <Globe className="w-3 h-3" /> },
      { label: isEdge ? 'Edge Connect' : 'TCP Connect', value: breakdown.connect, color: isEdge ? 'bg-[#F38020]/50' : 'bg-slate-400', icon: <Zap className="w-3 h-3" /> },
      { label: isEdge ? 'Edge TLS' : 'Client TLS', value: breakdown.tls, color: isEdge ? 'bg-[#F38020]/70' : 'bg-slate-500', icon: <Shield className="w-3 h-3" /> },
      { label: 'Time to First Byte', value: breakdown.wait, color: isEdge ? 'bg-[#F38020]' : 'bg-slate-700', icon: <Clock className="w-3 h-3" /> },
      { label: 'Payload Transfer', value: breakdown.download, color: isEdge ? 'bg-[#F38020]/90' : 'bg-slate-800', icon: <Download className="w-3 h-3" /> },
    ];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1", isEdge ? "text-[#F38020]" : "text-muted-foreground")}>
              {isEdge ? 'Cloudflare Edge Path' : 'Direct Browser Path'}
            </span>
            <span className="text-3xl font-mono font-bold tabular-nums">{metric.totalTime}ms</span>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono uppercase pb-1 tracking-widest">Latency Spectrum</span>
        </div>
        <div className="relative h-14 w-full bg-secondary/30 rounded-xl overflow-hidden flex border shadow-inner">
          <TooltipProvider delayDuration={0}>
            {phases.map((phase, idx) => {
              if (phase.value <= 0) return null;
              const widthPct = (phase.value / maxTime) * 100;
              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                      className={cn("h-full cursor-help border-r border-white/5 last:border-0", phase.color)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 space-y-2 glass-dark text-white border-0">
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider border-b border-white/10 pb-1.5">
                      {phase.icon} {phase.label}
                    </div>
                    <div className="flex justify-between gap-8 text-xs font-mono">
                      <span className="opacity-70">Duration:</span>
                      <span className="font-bold">{phase.value}ms</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-5 gap-1 pt-1">
          {phases.map((phase, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={cn("w-full h-1 rounded-full mb-1 opacity-50", phase.value > 0 ? phase.color : "bg-transparent")} />
              <span className="text-[8px] font-black uppercase text-muted-foreground/60 truncate w-full text-center">
                {phase.value > 0 ? `${phase.value}ms` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-card border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-4 right-10 flex items-center gap-2 text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.2em]">
        <Info className="w-3 h-3" />
        Shared Scale Breakdown
      </div>
      {renderStack(edge)}
      {renderStack(origin)}
    </div>
  );
}