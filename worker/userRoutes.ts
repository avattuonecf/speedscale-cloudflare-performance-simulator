import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
async function resolveIP(hostname: string): Promise<string | null> {
    try {
        const res = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);
        const json: any = await res.json();
        if (json.Answer && json.Answer.length > 0) {
            return json.Answer[0].data;
        }
        return null;
    } catch (e) {
        console.error(`DNS Resolution failed for ${hostname}:`, e);
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
        const urlParam = c.req.query('url');
        const targetUrl = validateUrl(urlParam);
        let realSize = '1.2kb';
        let ip = 'N/A';
        if (targetUrl) {
            const host = new URL(targetUrl).hostname;
            ip = await resolveIP(host) || '1.1.1.1';
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
    });
    // Origin Simulation
    app.get('/api/simulate/origin', async (c) => {
        const urlParam = c.req.query('url');
        const targetUrl = validateUrl(urlParam);
        const injectedDelay = Math.floor(Math.random() * 700) + 800;
        let realSize = '256kb';
        let ip = 'N/A';
        if (targetUrl) {
            const host = new URL(targetUrl).hostname;
            ip = await resolveIP(host) || '8.8.8.8';
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