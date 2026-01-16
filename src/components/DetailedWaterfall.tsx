import React from 'react';
import { motion } from 'framer-motion';
import { TestMetric, NetworkBreakdown } from '@shared/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Zap, Clock, Download, Globe, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
interface DetailedWaterfallProps {
  edge: TestMetric;
  origin: TestMetric;
}
export function DetailedWaterfall({ edge, origin }: DetailedWaterfallProps) {
  // Use the actual max of the two tests, minimum 10ms for safety
  const maxTime = Math.max(edge.totalTime || 0, origin.totalTime || 0, 10);
  const renderStack = (metric: TestMetric) => {
    const isEdge = metric.label.includes('Edge');
    const breakdown: NetworkBreakdown = metric.breakdown || { dns: 0, connect: 0, tls: 0, wait: 0, download: 0 };
    const phases = [
      { label: 'DNS Resolution', value: breakdown.dns, color: isEdge ? 'bg-orange-200' : 'bg-slate-200', icon: <Globe className="w-3 h-3" /> },
      { label: 'TCP Handshake', value: breakdown.connect, color: isEdge ? 'bg-orange-300' : 'bg-slate-300', icon: <Zap className="w-3 h-3" /> },
      { label: 'SSL/TLS Security', value: breakdown.tls, color: isEdge ? 'bg-orange-400' : 'bg-slate-400', icon: <Shield className="w-3 h-3" /> },
      { label: 'Time to First Byte', value: breakdown.wait, color: isEdge ? 'bg-[#F38020]' : 'bg-slate-500 dark:bg-slate-600', icon: <Clock className="w-3 h-3" /> },
      { label: 'Data Transfer', value: breakdown.download, color: isEdge ? 'bg-orange-700' : 'bg-slate-800 dark:bg-slate-400', icon: <Download className="w-3 h-3" /> },
    ];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isEdge ? "text-[#F38020]" : "text-muted-foreground")}>
                {isEdge ? 'Edge Performance Pathway' : 'Direct Origin Pathway'}
              </span>
              {metric.isEstimated && (
                <Badge variant="outline" className="h-4 text-[7px] font-black uppercase px-1.5 py-0 border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                  Estimated Phases
                </Badge>
              )}
            </div>
            <span className="text-3xl font-mono font-bold tabular-nums">{metric.totalTime}ms</span>
          </div>
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
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={cn(
                        "h-full cursor-help border-r border-white/20 last:border-0", 
                        phase.color,
                        "hover:opacity-90 transition-opacity"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 bg-black/90 backdrop-blur text-white border-0">
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider pb-1.5 border-b border-white/10">
                      {phase.icon} {phase.label}
                    </div>
                    <div className="flex justify-between gap-8 text-xs font-mono mt-2">
                      <span className="opacity-70">Duration:</span>
                      <span className="font-bold">{phase.value}ms</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-card border rounded-3xl p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-4 right-8 flex items-center gap-2 text-[8px] uppercase font-black text-muted-foreground/30 tracking-widest">
        <Info className="w-3 h-3" />
        Shared Scale Diagnostics
      </div>
      {renderStack(edge)}
      {renderStack(origin)}
    </div>
  );
}