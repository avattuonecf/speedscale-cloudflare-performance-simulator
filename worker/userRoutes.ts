import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const validateUrl = (url: string | null) => {
        if (!url) return null;
        try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return parsed.protocol === 'https:' ? parsed.toString() : null;
        } catch {
            return null;
        }
    };
    // Edge Simulation: Rapid response
    app.get('/api/simulate/edge', async (c) => {
        const targetUrl = validateUrl(c.req.query('url'));
        let realSize = '1.2kb';
        if (targetUrl) {
            try {
                const start = Date.now();
                const res = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });
                const bytes = res.headers.get('content-length');
                realSize = bytes ? `${(parseInt(bytes) / 1024).toFixed(1)}kb` : '4.5kb';
                // Simulate Edge processing
                await new Promise(r => setTimeout(r, Math.random() * 15 + 5));
            } catch (e) {
                await new Promise(r => setTimeout(r, 20));
            }
        } else {
            await new Promise(r => setTimeout(r, Math.random() * 20 + 5));
        }
        return c.json({
            success: true,
            data: {
                source: 'Cloudflare Edge',
                size: realSize,
                timestamp: Date.now()
            }
        });
    });
    // Origin Simulation: High latency + network overhead
    app.get('/api/simulate/origin', async (c) => {
        const targetUrl = validateUrl(c.req.query('url'));
        const injectedDelay = Math.floor(Math.random() * 700) + 800;
        let realSize = '256kb';
        if (targetUrl) {
            try {
                const res = await fetch(targetUrl, { redirect: 'follow' });
                const bytes = res.headers.get('content-length');
                realSize = bytes ? `${(parseInt(bytes) / 1024).toFixed(1)}kb` : '256kb';
            } catch (e) {
                // Fallback to mock large size
            }
        }
        await new Promise(r => setTimeout(r, injectedDelay));
        return c.json({
            success: true,
            data: {
                source: 'Origin Server',
                size: realSize,
                latency_injected: injectedDelay,
                timestamp: Date.now()
            }
        });
    });
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