import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCcw, Activity, Server, MousePointer2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const startTest = async () => {
    setResults(null);
    setStatus('running');
    toast.info('Initiating browser-level handshake...');
    try {
      const testResults = await runSpeedTest(
        cfUrlInput.trim() || undefined,
        originUrlInput.trim() || undefined
      );
      // Simulate diagnostic processing time for UX impact
      setTimeout(() => {
        setResults(testResults);
        setStatus('results');
        fetchGlobalStats();
        toast.success('Benchmark complete!');
      }, 2000);
    } catch (e) {
      setStatus('idle');
      toast.error('Performance analysis failed. Check your connection.');
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
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Local Browser Diagnostic Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div className="flex flex-col items-end border-l pl-8">
              <span className="uppercase text-[9px] font-black tracking-widest text-muted-foreground">Global Reach</span>
              <span className="font-mono font-bold tabular-nums text-foreground">{globalStats.toLocaleString()} tests run</span>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto text-center space-y-10 py-12 md:py-20"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 shadow-sm">
                  <MousePointer2 className="w-3 h-3" />
                  100% Client-Side Benchmarking
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-tight">
                  Benchmark from <span className="text-[#F38020]">Your Browser</span>.
                </h2>
                <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto font-medium">
                  Measure authentic network performance between Cloudflare's Edge and your direct connection, captured right from your device.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[#F38020] px-1">Edge Target (CF)</label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F38020]" />
                      <Input
                        placeholder="e.g. cloudflare.com"
                        value={cfUrlInput}
                        onChange={(e) => setCfUrlInput(e.target.value)}
                        className="pl-12 h-14 bg-secondary/30 rounded-2xl text-lg font-medium border-0 focus:ring-2 focus:ring-[#F38020]/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">Direct Target (Origin)</label>
                    <div className="relative">
                      <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                      <Input
                        placeholder="e.g. google.com"
                        value={originUrlInput}
                        onChange={(e) => setOriginUrlInput(e.target.value)}
                        className="pl-12 h-14 bg-secondary/30 rounded-2xl text-lg font-medium border-0 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="max-w-xs mx-auto pt-6">
                  <Button
                    onClick={startTest}
                    size="lg"
                    className="w-full bg-[#F38020] hover:bg-[#E55A1B] text-white h-14 text-xl font-black shadow-xl shadow-[#F38020]/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    START LOCAL TEST
                  </Button>
                </div>
              </motion.div>
            )}
            {status === 'running' && (
              <motion.div 
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto py-20 text-center space-y-12"
              >
                <div className="relative inline-flex items-center justify-center">
                  <Activity className="w-16 h-16 text-[#F38020] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic">Measuring Client Latency...</h3>
                  <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Capturing high-fidelity browser timings</p>
                </div>
                <div className="max-w-md mx-auto space-y-6">
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                        className="h-full bg-[#F38020]"
                      />
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>Handshake</span>
                     <span>Resolution</span>
                     <span>Payload Capture</span>
                   </div>
                </div>
              </motion.div>
            )}
            {status === 'results' && results && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 pb-20"
              >
                <SpeedVisualizer results={results} />
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStatus('idle')}
                    className="gap-3 rounded-full px-10 h-14 font-bold uppercase tracking-widest text-xs hover:bg-secondary/50"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Rerun New Targets
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <footer className="border-t py-12 mt-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <p>Measured via W3C Performance Timeline API</p>
          </div>
          <div className="flex gap-10">
            <span className="opacity-50 hover:opacity-100 transition-opacity">Diagnostic Mode: Pure Client-Side</span>
          </div>
        </footer>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}