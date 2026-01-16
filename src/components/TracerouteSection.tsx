import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestMetric, TracerouteHop } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, MapPin, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface TracerouteSectionProps {
  edge: TestMetric;
  origin: TestMetric;
}
export function TracerouteSection({ edge, origin }: TracerouteSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const rerunTraceroute = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };
  const renderTrace = (metric: TestMetric, color: string) => {
    const hops = metric.traceroute || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Path to {metric.label}
          </h4>
          <Badge variant="outline" className="text-[9px] font-bold h-5 rounded-full px-2">
            {metric.resolvedIP}
          </Badge>
        </div>
        <div className="relative pl-8 space-y-8">
          {/* Vertical connection line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-border" />
          {hops.map((hop, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex items-center justify-between"
            >
              <div className="absolute -left-[22px] z-10">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 border-background ring-4 ring-transparent",
                  idx === 5 ? color : "bg-muted-foreground/30",
                  isAnimating && "animate-ping"
                )} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-foreground">{hop.label}</span>
                <span className="text-[9px] font-mono text-muted-foreground opacity-70">{hop.ip}</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-mono font-bold tabular-nums">
                  {hop.latency}ms
                </span>
                <div className="w-16 h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(hop.latency / (metric.totalTime || 1)) * 100}%` }}
                    className={cn("h-full", idx === 5 ? color : "bg-muted-foreground/30")}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="border rounded-3xl bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-between p-6 h-auto hover:bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F38020]/10 rounded-lg">
                <Globe className="w-4 h-4 text-[#F38020]" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase tracking-widest">Network Path Diagnostics</h3>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Simulated via browser RTTEstimator (no ICMP)</p>
              </div>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-8 pt-0 space-y-8 border-t bg-secondary/10">
            <div className="flex justify-center pt-6">
              <Button 
                onClick={rerunTraceroute} 
                disabled={isAnimating}
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full font-black text-[9px] uppercase tracking-widest"
              >
                <RefreshCcw className={cn("w-3 h-3", isAnimating && "animate-spin")} />
                Trace Route
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {renderTrace(edge, "bg-[#F38020]")}
              {renderTrace(origin, "bg-blue-500")}
            </div>
            <div className="text-center pt-4 opacity-40">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]">End-to-End Hop Latency Verification</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}