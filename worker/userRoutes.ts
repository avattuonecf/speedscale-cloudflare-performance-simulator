import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
async function resolveIP(hostname: string): Promise<string | null> {
    if (!hostname || hostname === 'Simulation Mode' || hostname === 'N/A') {
        return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
        const res = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`, {
            signal: controller.signal
        });
        const json: any = await res.json();
        clearTimeout(timeoutId);
        if (json.Answer && json.Answer.length > 0) {
            return json.Answer[0].data;
        }
        return null;
    } catch (e) {
        clearTimeout(timeoutId);
        console.error(`DNS Resolution failed or timed out for ${hostname}:`, e);
        return null;
    }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const validateUrl = (url: string | null | undefined) => {
        if (!url) return null;
        try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return parsed.protocol.startsWith('http') ? parsed.toString() : null;
        } catch {
            return null;
        }
    };
    // Edge Simulation
    app.get('/api/simulate/edge', async (c) => {
        try {
            const urlParam = c.req.query('url');
            const targetUrl = validateUrl(urlParam);
            let realSize = '1.2kb';
            let ip = '1.1.1.1';
            if (targetUrl) {
                const host = new URL(targetUrl).hostname;
                const resolved = await resolveIP(host);
                if (resolved) ip = resolved;
                try {
                    const res = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });
                    const bytes = res.headers.get('content-length');
                    realSize = bytes ? `${(parseInt(bytes) / 1024).toFixed(1)}kb` : '4.5kb';
                } catch (e) {
                    console.error("Edge fetch error", e);
                }
            }
            await new Promise(r => setTimeout(r, Math.random() * 15 + 5));
            return c.json({
                success: true,
                data: {
                    source: 'Cloudflare Edge',
                    size: realSize,
                    resolvedIP: ip,
                    testedUrl: targetUrl || 'Simulation Mode',
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            return c.json({ success: false, error: 'Edge simulation failed' }, 500);
        }
    });
    // Origin Simulation
    app.get('/api/simulate/origin', async (c) => {
        try {
            const urlParam = c.req.query('url');
            const targetUrl = validateUrl(urlParam);
            const injectedDelay = Math.floor(Math.random() * 700) + 800;
            let realSize = '256kb';
            let ip = '8.8.8.8';
            if (targetUrl) {
                const host = new URL(targetUrl).hostname;
                const resolved = await resolveIP(host);
                if (resolved) ip = resolved;
                try {
                    const res = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });
                    const bytes = res.headers.get('content-length');
                    realSize = bytes ? `${(parseInt(bytes) / 1024).toFixed(1)}kb` : '256kb';
                } catch (e) {
                    console.error("Origin fetch error", e);
                }
            }
            await new Promise(r => setTimeout(r, injectedDelay));
            return c.json({
                success: true,
                data: {
                    source: 'Origin Server',
                    size: realSize,
                    latency_injected: injectedDelay,
                    resolvedIP: ip,
                    testedUrl: targetUrl || 'Simulation Mode',
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            return c.json({ success: false, error: 'Origin simulation failed' }, 500);
        }
    });
    app.get('/api/stats', async (c) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.getCounterValue();
            return c.json({ success: true, data } satisfies ApiResponse<number>);
        } catch (err) {
            return c.json({ success: false, error: 'Failed to fetch stats' }, 500);
        }
    });
    app.post('/api/stats/increment', async (c) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.increment();
            return c.json({ success: true, data } satisfies ApiResponse<number>);
        } catch (err) {
            return c.json({ success: false, error: 'Failed to increment' }, 500);
        }
    });
}