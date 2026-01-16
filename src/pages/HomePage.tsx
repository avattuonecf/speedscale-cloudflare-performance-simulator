import React, { useState, useEffect } from 'react';
import { Zap, Globe, RefreshCcw, Activity, Server, Info } from 'lucide-react';
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
  useEffect(() => {
    fetchGlobalStats();
  }, []);
  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) setGlobalStats(json.data);
    } catch (e) {
      console.warn('Failed to load global stats');
    }
  };
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
    toast.info('Initiating multi-phase diagnostics...');
    try {
      const testResults = await runSpeedTest(cfTarget || undefined, originTarget || undefined);
      // Artificial delay to let user see the "running" state animations
      setTimeout(() => {
        setResults(testResults);
        setStatus('results');
        fetchGlobalStats().catch(() => {});
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
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Network Diagnostics</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div className="flex flex-col items-end">
              <span className="uppercase text-[9px] font-black tracking-widest text-muted-foreground">Simulation Node</span>
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Edge Core
              </span>
            </div>
            <div className="flex flex-col items-end border-l pl-8">
              <span className="uppercase text-[9px] font-black tracking-widest text-muted-foreground">Total Benchmarks</span>
              <span className="font-mono font-bold tabular-nums text-foreground">{globalStats.toLocaleString()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {status === 'idle' && (
            <div className="max-w-4xl mx-auto text-center space-y-10 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border shadow-sm">
                <Globe className="w-3 h-3 text-[#F38020]" />
                Anycast DNS & TLS Resilience Engine
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-balance">
                The Speed of <span className="text-[#F38020]">Light</span>.
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto font-medium">
                Benchmark real-world DNS resolution and network handshakes between Cloudflare Edge and direct origin paths.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Edge Optimized</label>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Recommended</span>
                  </div>
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F38020] group-focus-within:scale-110 transition-transform" />
                    <Input
                      placeholder="e.g. cloudflare.com"
                      value={cfUrlInput}
                      onChange={(e) => setCfUrlInput(e.target.value)}
                      className="pl-12 h-14 bg-secondary/30 border-input focus:border-[#F38020] focus:ring-[#F38020]/10 rounded-2xl text-lg font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Origin Direct</label>
                  <div className="relative group">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:scale-110 transition-transform" />
                    <Input
                      placeholder="e.g. 8.8.8.8 or example.com"
                      value={originUrlInput}
                      onChange={(e) => setOriginUrlInput(e.target.value)}
                      className="pl-12 h-14 bg-secondary/30 border-input focus:border-primary focus:ring-primary/10 rounded-2xl text-lg font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="max-w-xs mx-auto space-y-6 pt-4">
                <Button
                  onClick={startTest}
                  size="lg"
                  className="w-full bg-[#F38020] hover:bg-[#E55A1B] text-white h-14 text-xl font-black shadow-xl shadow-[#F38020]/20 rounded-2xl"
                >
                  START SIMULATION
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-[10px] text-muted-foreground uppercase tracking-widest hover:text-foreground underline underline-offset-4 decoration-dotted">
                        Simulation Methodology
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] p-4 text-xs">
                        <p className="font-bold mb-2">How it works:</p>
                        We measure real network TTFB and simulate phase breakdowns (DNS, TCP, TLS) based on observed latency and endpoint headers.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
          {status === 'running' && (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-12 animate-in fade-in duration-500">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-[#F38020]/20 blur-3xl rounded-full animate-pulse" />
                <Activity className="w-16 h-16 text-[#F38020] animate-pulse" />
              </div>
              <div className="space-y-10">
                <div className="space-y-2">
                   <h3 className="text-3xl font-black tracking-tighter uppercase italic">Analyzing Pathing...</h3>
                   <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Calculating multi-stage handshake timings</p>
                </div>
                <div className="space-y-8 text-left max-w-md mx-auto bg-card border p-8 rounded-3xl shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-1.5 text-[#F38020] truncate max-w-[200px]">
                        <Zap className="w-3 h-3 flex-shrink-0" /> {getDisplayHostname(cfUrlInput, 'Edge Anycast')}
                      </span>
                      <span className="text-emerald-500">Fast-Path</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="h-full bg-[#F38020]"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[200px]">
                        <Server className="w-3 h-3 flex-shrink-0" /> {getDisplayHostname(originUrlInput, 'Origin Direct')}
                      </span>
                      <span className="animate-pulse">Handshaking...</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="h-full bg-slate-400"
                      />
                    </div>
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
                  className="gap-3 rounded-full px-10 h-14 border-muted-foreground/20 hover:bg-secondary font-bold uppercase tracking-widest text-xs"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Rerun Diagnostics
                </Button>
              </div>
            </div>
          )}
        </main>
        <footer className="border-t py-12 mt-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p>Cloudflare Workers Edge Node: US-EAST-1</p>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-[#F38020] transition-colors">Methodology</a>
            <a href="#" className="hover:text-[#F38020] transition-colors">Edge Infrastructure</a>
            <a href="#" className="hover:text-[#F38020] transition-colors">API Status</a>
          </div>
        </footer>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}