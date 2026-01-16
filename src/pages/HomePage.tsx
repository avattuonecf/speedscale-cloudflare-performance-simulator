import React, { useState, useEffect } from 'react';
import { Zap, Globe, RefreshCcw, Activity, Link as LinkIcon } from 'lucide-react';
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
  const [urlInput, setUrlInput] = useState('');
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
  const startTest = async () => {
    let target = urlInput.trim();
    if (target && !target.match(/^https?:\/\//)) {
      target = `https://${target}`;
    }
    setStatus('running');
    toast.info(target ? `Testing performance for ${target}...` : 'Initiating speed simulation...');
    try {
      const testResults = await runSpeedTest(target || undefined);
      setResults(testResults);
      setStatus('results');
      fetchGlobalStats();
      toast.success('Simulation complete!');
    } catch (e) {
      setStatus('idle');
      toast.error('Simulation failed. Please check the URL and try again.');
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
              <span className="uppercase text-[10px] font-bold tracking-widest">Edge Status</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Optimal
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="uppercase text-[10px] font-bold tracking-widest">Global Tests</span>
              <span className="font-medium tabular-nums text-foreground">{globalStats.toLocaleString()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {status === 'idle' && (
            <div className="max-w-3xl mx-auto text-center space-y-8 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border">
                <Globe className="w-3 h-3 text-[#F38020]" />
                Live Network Simulation
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
                Experience the <span className="text-[#F38020]">Edge</span> performance.
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-xl mx-auto">
                Compare direct-to-origin latency against Cloudflare's global network in real-time.
              </p>
              <div className="max-w-md mx-auto space-y-4 pt-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-[#F38020] transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-input focus:border-[#F38020] focus:ring-[#F38020]/20 rounded-xl transition-all"
                  />
                </div>
                <Button
                  onClick={startTest}
                  size="lg"
                  className="w-full bg-[#F38020] hover:bg-[#E55A1B] text-white h-12 text-lg font-semibold shadow-lg shadow-[#F38020]/20 rounded-xl"
                >
                  Run Simulation
                </Button>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Leave empty to use sample data
                </p>
              </div>
            </div>
          )}
          {status === 'running' && (
            <div className="max-w-2xl mx-auto py-32 text-center space-y-12">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-[#F38020]/20 blur-3xl rounded-full animate-pulse" />
                <Activity className="w-16 h-16 text-[#F38020] animate-bounce" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Testing Latency...</h3>
                <div className="w-full max-w-sm mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-[#F38020] animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
                </div>
                <p className="text-muted-foreground animate-pulse">Requesting payload from {urlInput || 'Edge & Origin'}...</p>
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
                  Run New Test
                </Button>
              </div>
            </div>
          )}
        </main>
        <footer className="border-t py-8 mt-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2024 SpeedScale Engine. Real-world performance may vary.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Methodology</a>
            <a href="#" className="hover:text-foreground transition-colors">Network Map</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}