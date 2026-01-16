import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { SpeedTestResult } from '@shared/types';
import { MetricCard } from '@/components/ui/metric-card';
import { Globe, Zap, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface SpeedVisualizerProps {
  results: SpeedTestResult;
}
export function SpeedVisualizer({ results }: SpeedVisualizerProps) {
  const simplifiedData = [
    { name: 'Cloudflare Edge', value: results.edge.totalTime, color: '#F38020' },
    { name: 'Origin Server', value: results.origin.totalTime, color: '#94a3b8' },
  ];
  const maxTime = Math.max(results.edge.totalTime, results.origin.totalTime, 1);
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="px-3 py-1 gap-2 border-[#F38020]/20 bg-[#F38020]/5 text-[#F38020]">
            <Zap className="w-3 h-3" />
            CF: {results.edge.testedUrl?.replace(/^https?:\/\//, '') || 'Edge Node'} (IP: {results.edge.resolvedIP})
          </Badge>
          <Badge variant="outline" className="px-3 py-1 gap-2 border-slate-300 bg-slate-50 text-slate-600">
            <Server className="w-3 h-3" />
            Origin: {results.origin.testedUrl?.replace(/^https?:\/\//, '') || 'Direct'} (IP: {results.origin.resolvedIP})
          </Badge>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Cloudflare is <span className="text-[#F38020]">{results.speedup}x</span> faster
        </h2>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">
          Real dual-site comparison • Resolved via Google DNS
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Edge Total" value={`${results.edge.totalTime}ms`} subValue={results.edge.size} variant="edge" />
        <MetricCard label="Origin Total" value={`${results.origin.totalTime}ms`} subValue={results.origin.size} variant="origin" />
        <MetricCard label="Edge TTFB" value={`${results.edge.ttfb}ms`} subValue="Resolved IP Connect" variant="edge" />
        <MetricCard label="Origin TTFB" value={`${results.origin.ttfb}ms`} subValue="Network Latency" variant="origin" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-2xl p-6 h-[400px] shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Latency Index <span className="text-[10px] uppercase text-muted-foreground font-normal tracking-widest">(ms)</span>
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={simplifiedData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border p-2 rounded-lg shadow-xl text-xs font-bold">
                        {payload[0].value}ms
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                {simplifiedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border rounded-2xl p-6 space-y-8 shadow-sm">
          <h3 className="text-lg font-semibold flex items-center justify-between">
            Waterfall Timeline
            <span className="text-[10px] text-muted-foreground font-mono">1px = {Math.round(maxTime / 100)}ms</span>
          </h3>
          <div className="space-y-12 py-2">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold tracking-tight">
                <span className="text-[#F38020]">Cloudflare Edge</span>
                <span className="tabular-nums font-mono">{results.edge.totalTime}ms</span>
              </div>
              <div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.edge.ttfb / maxTime) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#F38020]/40"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.edge.duration / maxTime) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="h-full bg-[#F38020]"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold tracking-tight text-slate-500">
                <span>Origin Server</span>
                <span className="tabular-nums font-mono">{results.origin.totalTime}ms</span>
              </div>
              <div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.origin.ttfb / maxTime) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-slate-400"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.origin.duration / maxTime) * 100}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-slate-600"
                />
              </div>
            </div>
          </div>
          <div className="pt-6 border-t flex flex-wrap gap-x-6 gap-y-2 text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F38020]/40" /> DNS / TTFB
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F38020]" /> Edge Delivery
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" /> Origin Wait
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-600" /> Download
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}