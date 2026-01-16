import React from 'react';
import { motion } from 'framer-motion';
import { TestMetric } from '@shared/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Shield, Zap, Clock, Download, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
interface DetailedWaterfallProps {
  edge: TestMetric;
  origin: TestMetric;
}
export function DetailedWaterfall({ edge, origin }: DetailedWaterfallProps) {
  const maxTime = Math.max(edge.totalTime, origin.totalTime, 1);
  const renderStack = (metric: TestMetric, isEdge: boolean) => {
    const { breakdown } = metric;
    const phases = [
      { label: 'DNS Lookup', value: breakdown.dns, color: isEdge ? 'bg-[#F38020]/30' : 'bg-slate-300', icon: <Globe className="w-3 h-3" /> },
      { label: 'TCP Connection', value: breakdown.connect, color: isEdge ? 'bg-[#F38020]/50' : 'bg-slate-400', icon: <Zap className="w-3 h-3" /> },
      { label: 'TLS Handshake', value: breakdown.tls, color: isEdge ? 'bg-[#F38020]/70' : 'bg-slate-500', icon: <Shield className="w-3 h-3" /> },
      { label: 'Server Wait', value: breakdown.wait, color: isEdge ? 'bg-[#F38020]' : 'bg-slate-700', icon: <Clock className="w-3 h-3" /> },
      { label: 'Data Transfer', value: breakdown.download, color: isEdge ? 'bg-[#F38020]/90' : 'bg-slate-800', icon: <Download className="w-3 h-3" /> },
    ];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className={cn("text-xs font-bold uppercase tracking-widest mb-1", isEdge ? "text-[#F38020]" : "text-muted-foreground")}>
              {isEdge ? 'Cloudflare Edge' : 'Origin Server'}
            </span>
            <span className="text-2xl font-mono font-bold tabular-nums">{metric.totalTime}ms</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono uppercase pb-1">Total Duration</span>
        </div>
        <div className="relative h-12 w-full bg-secondary/30 rounded-lg overflow-hidden flex">
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
                      className={cn("h-full cursor-help border-r border-white/10 last:border-0", phase.color)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter border-b pb-1">
                      {phase.icon} {phase.label}
                    </div>
                    <div className="flex justify-between gap-8 text-sm">
                      <span className="text-muted-foreground">Timing:</span>
                      <span className="font-mono font-bold">{phase.value}ms</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground max-w-[150px]">
                      {phase.label === 'Server Wait' ? 'Time spent processing request at the application layer.' : `Network phase duration for ${phase.label.toLowerCase()}.`}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {phases.map((phase, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={cn("w-full h-1 rounded-full mb-1", phase.value > 0 ? phase.color : "bg-transparent")} />
              <span className="text-[8px] font-bold uppercase text-muted-foreground truncate w-full text-center">
                {phase.value > 0 ? phase.value : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-card border rounded-3xl p-8 shadow-sm">
      <div className="absolute top-4 right-8 flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
        <Info className="w-3 h-3" />
        Shared Scale Breakdown
      </div>
      {renderStack(edge, true)}
      {renderStack(origin, false)}
    </div>
  );
}