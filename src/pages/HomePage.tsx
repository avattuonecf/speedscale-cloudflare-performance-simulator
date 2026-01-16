import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Globe, RefreshCcw, Activity, Server, Info, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { runSpeedTest } from '@/lib/simulation';
import { SpeedTestResult } from '@shared/types';
import { SpeedVisualizer } from '@/components/SpeedVisualizer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function HomePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'results'>('idle');
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const [globalStats, setGlobalStats] = useState<number>(0);
  const [cfUrlInput, setCfUrlInput] = useState('');
  const [originUrlInput, setOriginUrlInput] = useState('');
  const fetchGlobalStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) setGlobalStats(json.data);
    } catch (e) {
      console.warn('Failed to load global stats');
    }
  }, []);
  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);
  const getDisplayHostname = (urlStr: string, fallback: string) => {
    if (!urlStr) return fallback;
    try {
      const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      return new URL(formatted).hostname;
    } catch {
      return fallback;
    }
  };
  const startTest = async () => {
    let cfTarget = cfUrlInput.trim();
    let originTarget = originUrlInput.trim();
    if (cfTarget && !cfTarget.match(/^https?:\/\//)) cfTarget = `https://${cfTarget}`;
    if (originTarget && !originTarget.match(/^https?:\/\//)) originTarget = `https://${originTarget}`;
    setStatus('running');
    toast.info('Analyzing Browser vs. Edge performance...');
    try {
      const testResults = await runSpeedTest(cfTarget || undefined, originTarget || undefined);
      // Wait for visuals
      setTimeout(() => {
        setResults(testResults);
        setStatus('results');
        fetchGlobalStats();
        toast.success('Benchmarking complete!');
      }, 3000);
    } catch (e) {
      setStatus('idle');
      toast.error('Simulation failed. Target site may be blocking requests.');
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 min-h-screen flex flex-col">
        <ThemeToggle />
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F38020] rounded-xl shadow-lg shadow-[#F38020]/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">SpeedScale</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Network Diagnostics v2</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div className="flex flex-col items-end">
              <span className="uppercase text-[9px] font-black tracking-widest text-muted-foreground">Local Node</span>
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Browser Path
              </span>
            </div>
            <div className="flex flex-col items-end border-l pl-8">
              <span className="uppercase text-[9px] font-black tracking-widest text-muted-foreground">Global Reach</span>
              <span className="font-mono font-bold tabular-nums text-foreground">{globalStats.toLocaleString()} tests</span>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {status === 'idle' && (
            <div className="max-w-4xl mx-auto text-center space-y-10 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border shadow-sm">
                <MousePointer2 className="w-3 h-3 text-blue-500" />
                Real User Experience Benchmarking
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-balance">
                Measure Your <span className="text-[#F38020]">Edge</span>.
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto font-medium">
                Benchmark real-time network performance between Cloudflare's Edge and your direct browser-to-origin connection.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[#F38020]">Cloudflare Hop</label>
                  </div>
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F38020]" />
                    <Input
                      placeholder="e.g. cloudflare.com"
                      value={cfUrlInput}
                      onChange={(e) => setCfUrlInput(e.target.value)}
                      className="pl-12 h-14 bg-secondary/30 border-input focus:border-[#F38020] focus:ring-[#F38020]/10 rounded-2xl text-lg font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Browser Direct</label>
                  <div className="relative group">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <Input
                      placeholder="e.g. example.com"
                      value={originUrlInput}
                      onChange={(e) => setOriginUrlInput(e.target.value)}
                      className="pl-12 h-14 bg-secondary/30 border-input focus:border-blue-500 focus:ring-blue-500/10 rounded-2xl text-lg font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="max-w-xs mx-auto pt-6">
                <Button
                  onClick={startTest}
                  size="lg"
                  className="w-full bg-[#F38020] hover:bg-[#E55A1B] text-white h-14 text-xl font-black shadow-xl shadow-[#F38020]/20 rounded-2xl"
                >
                  RUN BENCHMARK
                </Button>
              </div>
            </div>
          )}
          {status === 'running' && (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-12">
              <div className="relative inline-flex items-center justify-center">
                <Activity className="w-16 h-16 text-[#F38020] animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter uppercase italic">Syncing browser metrics...</h3>
                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Benchmarking local vs. Edge pathing</p>
              </div>
              <div className="max-w-md mx-auto bg-card border p-8 rounded-3xl shadow-sm space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[#F38020]">Edge Proxy Hop</span>
                    <span className="text-emerald-500">Live</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-[#F38020]"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-blue-500">Local Browser Path</span>
                    <span className="animate-pulse">Handshaking...</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {status === 'results' && results && (
            <div className="space-y-12 pb-20">
              <SpeedVisualizer results={results} />
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => setStatus('idle')}
                  className="gap-3 rounded-full px-10 h-14 font-bold uppercase tracking-widest text-xs"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Rerun Simulation
                </Button>
              </div>
            </div>
          )}
        </main>
        <footer className="border-t py-12 mt-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p>Cloudflare Workers Edge Network Enabled</p>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-[#F38020]">Browser Timing API</a>
            <a href="#" className="hover:text-[#F38020]">Edge Core Logs</a>
          </div>
        </footer>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}