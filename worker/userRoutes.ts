import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Edge Simulation: Fast response, small payload
    app.get('/api/simulate/edge', async (c) => {
        // Simulating processing time at edge (minimal)
        await new Promise(r => setTimeout(r, Math.random() * 20 + 5));
        return c.json({
            success: true,
            source: 'Cloudflare Edge (Worker)',
            size: '1.2kb',
            timestamp: Date.now(),
            region: 'Earth-1'
        });
    });
    // Origin Simulation: Slow response, large payload
    app.get('/api/simulate/origin', async (c) => {
        // Simulating origin latency + network hop (800ms - 1500ms)
        const delay = Math.floor(Math.random() * 700) + 800;
        await new Promise(r => setTimeout(r, delay));
        // Large-ish payload simulation
        const data = Array.from({ length: 100 }, (_, i) => ({ id: i, data: "Unoptimized payload content for testing simulation latency." }));
        return c.json({
            success: true,
            source: 'Simulated Origin Server',
            size: '256kb',
            timestamp: Date.now(),
            latency_injected: delay,
            data
        });
    });
    // Stats endpoints
    app.get('/api/stats', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getCounterValue();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
    app.post('/api/stats/increment', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.increment();
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
}