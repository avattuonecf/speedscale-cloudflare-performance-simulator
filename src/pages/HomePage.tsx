import React, { useState, useEffect } from 'react';
import { Zap, Globe, RefreshCcw, Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { runSpeedTest } from '@/lib/simulation';
import { SpeedTestResult } from '@shared/types';
import { SpeedVisualizer } from '@/components/SpeedVisualizer';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    toast.info('Initiating dual-target simulation...');
    try {
      const testResults = await runSpeedTest(cfTarget || undefined, originTarget || undefined);
      setTimeout(() => {
        setResults(testResults);
        setStatus('results');
        fetchGlobalStats().catch(() => {}); // Silent update
        toast.success('Simulation complete!');
      }, 2500);
    } catch (e) {
      setStatus('idle');
      toast.error('Simulation failed. Please check the URLs.');
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 min-h-screen flex flex-col">
        <ThemeToggle />
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F38020] rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SpeedScale</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex flex-col items-end">
              <span className="uppercase text-[10px] font-bold tracking-widest text-foreground/60">Edge Status</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Optimal
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="uppercase text-[10px] font-bold tracking-widest text-foreground/60">Global Tests</span>
              <span className="font-medium tabular-nums text-foreground">{globalStats.toLocaleString()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {status === 'idle' && (
            <div className="max-w-4xl mx-auto text-center space-y-8 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border">
                <Globe className="w-3 h-3 text-[#F38020]" />
                Real-World DNS & Latency Simulation
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
                Experience the <span className="text-[#F38020]">Edge</span> performance.
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Compare a Cloudflare-optimized site directly against an origin server.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Cloudflare Site</label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F38020]" />
                    <Input
                      placeholder="https://example.cloudflare.com"
                      value={cfUrlInput}
                      onChange={(e) => setCfUrlInput(e.target.value)}
                      className="pl-10 h-12 bg-secondary/50 border-input focus:border-[#F38020] focus:ring-[#F38020]/20 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Origin / Direct</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com"
                      value={originUrlInput}
                      onChange={(e) => setOriginUrlInput(e.target.value)}
                      className="pl-10 h-12 bg-secondary/50 border-input focus:border-primary focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <div className="max-w-xs mx-auto space-y-4">
                <Button
                  onClick={startTest}
                  size="lg"
                  className="w-full bg-[#F38020] hover:bg-[#E55A1B] text-white h-12 text-lg font-semibold shadow-lg shadow-[#F38020]/20 rounded-xl mt-4"
                >
                  Run Simulation
                </Button>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Leave empty to use sample infrastructure
                </p>
              </div>
            </div>
          )}
          {status === 'running' && (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-12 animate-in fade-in duration-500">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-[#F38020]/20 blur-3xl rounded-full animate-pulse" />
                <Activity className="w-16 h-16 text-[#F38020]" />
              </div>
              <div className="space-y-10">
                <h3 className="text-2xl font-semibold">Real Dual-Site Comparison...</h3>
                <div className="space-y-8 text-left max-w-md mx-auto">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-[#F38020] truncate max-w-[200px]">
                        <Zap className="w-3 h-3 flex-shrink-0" /> {getDisplayHostname(cfUrlInput, 'Cloudflare Edge')}
                      </span>
                      <span className="text-muted-foreground">Resolved</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-[#F38020]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[200px]">
                        <Server className="w-3 h-3 flex-shrink-0" /> {getDisplayHostname(originUrlInput, 'Origin Server')}
                      </span>
                      <span className="text-muted-foreground">Fetching...</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "linear" }}
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
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setStatus('idle')}
                  className="gap-2 rounded-full px-8 h-12 border-muted-foreground/20 hover:bg-secondary"
                >
                  <RefreshCcw className="w-4 h-4" />
                  New Benchmark
                </Button>
              </div>
            </div>
          )}
        </main>
        <footer className="border-t py-8 mt-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2024 SpeedScale Engine. DNS Resolution via Google Public DNS.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Methodology</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}