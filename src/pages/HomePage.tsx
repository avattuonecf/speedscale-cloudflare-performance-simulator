import React, { useState, useEffect } from 'react';
import { Zap, Globe, RefreshCcw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from '@/components/ui/sonner';
import { runSpeedTest, SpeedTestResult } from '@/lib/simulation';
import { SpeedVisualizer } from '@/components/SpeedVisualizer';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'results'>('idle');
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const [globalStats, setGlobalStats] = useState<number>(0);
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
    setStatus('running');
    toast.info('Initiating speed simulation...');
    try {
      const testResults = await runSpeedTest();
      setResults(testResults);
      setStatus('results');
      fetchGlobalStats();
      toast.success('Simulation complete!');
    } catch (e) {
      setStatus('idle');
      toast.error('Simulation failed. Please try again.');
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 min-h-screen flex flex-col">
        <ThemeToggle />
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F38020] rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SpeedScale</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Network Status</span>
              <span className="flex items-center gap-1.5 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Edge Nodes Active
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Global Simulations</span>
              <span className="font-medium tabular-nums">{globalStats.toLocaleString()}</span>
            </div>
          </div>
        </header>
        {/* Hero / Main Interaction Area */}
        <main className="flex-1">
          {status === 'idle' && (
            <div className="max-w-3xl mx-auto text-center space-y-8 py-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border">
                <Globe className="w-3 h-3" />
                Built on Cloudflare Workers
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
                Experience the <span className="text-[#F38020]">Edge</span> performance.
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-xl mx-auto">
                Compare direct-to-origin latency against Cloudflare's global network in real-time. 
                Visualize the impact of caching and proximity.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={startTest} 
                  size="lg"
                  className="bg-[#F38020] hover:bg-[#E55A1B] text-white px-10 h-14 text-lg font-semibold shadow-lg shadow-[#F38020]/20 rounded-full"
                >
                  Run Simulation
                </Button>
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
                <p className="text-muted-foreground animate-pulse">Requesting from global edge nodes & origin...</p>
              </div>
            </div>
          )}
          {status === 'results' && results && (
            <div className="space-y-12">
              <SpeedVisualizer results={results} />
              <div className="flex justify-center pb-20">
                <Button 
                  variant="outline" 
                  onClick={() => setStatus('idle')}
                  className="gap-2 rounded-full px-6"
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
            <a href="#" className="hover:underline">Methodology</a>
            <a href="#" className="hover:underline">Network Map</a>
            <a href="#" className="hover:underline">Documentation</a>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}