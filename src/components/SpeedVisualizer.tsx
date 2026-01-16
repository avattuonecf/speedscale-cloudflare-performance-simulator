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
import { SpeedTestResult } from '@/lib/simulation';
import { MetricCard } from '@/components/ui/metric-card';
interface SpeedVisualizerProps {
  results: SpeedTestResult;
}
export function SpeedVisualizer({ results }: SpeedVisualizerProps) {
  const chartData = [
    { name: 'TTFB', edge: results.edge.ttfb, origin: results.origin.ttfb },
    { name: 'Download', edge: results.edge.duration, origin: results.origin.duration },
    { name: 'Total', edge: results.edge.totalTime, origin: results.origin.originTime ?? results.origin.totalTime },
  ];
  const simplifiedData = [
    { name: 'Cloudflare Edge', value: results.edge.totalTime, color: '#F38020' },
    { name: 'Origin Server', value: results.origin.totalTime, color: '#94a3b8' },
  ];
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-2">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Cloudflare is <span className="text-[#F38020]">{results.speedup}x</span> faster
        </h2>
        <p className="text-muted-foreground">Comparative analysis of simulated network latency</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Edge Total" value={`${results.edge.totalTime}ms`} subValue="Optimized" variant="edge" />
        <MetricCard label="Origin Total" value={`${results.origin.totalTime}ms`} subValue="Unoptimized" variant="origin" />
        <MetricCard label="Edge TTFB" value={`${results.edge.ttfb}ms`} subValue="Rapid Response" variant="edge" />
        <MetricCard label="Origin TTFB" value={`${results.origin.ttfb}ms`} subValue="Network Overhead" variant="origin" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6 h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Response Time Comparison (ms)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={simplifiedData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border p-2 rounded shadow-lg text-xs">
                        {payload[0].value}ms
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                {simplifiedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold">Request Waterfall</h3>
          <div className="space-y-8 py-4">
            {/* Edge Waterfall */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Cloudflare Edge</span>
                <span>{results.edge.totalTime}ms</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.edge.ttfb / results.origin.totalTime) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-[#F38020]/40"
                  title="TTFB"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.edge.duration / results.origin.totalTime) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-[#F38020]"
                  title="Content Download"
                />
              </div>
            </div>
            {/* Origin Waterfall */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Origin Server</span>
                <span>{results.origin.totalTime}ms</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.origin.ttfb / results.origin.totalTime) * 100}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-slate-400"
                  title="TTFB"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.origin.duration / results.origin.totalTime) * 100}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-slate-600"
                  title="Content Download"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t flex gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#F38020]/40" /> TTFB
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#F38020]" /> Transfer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}