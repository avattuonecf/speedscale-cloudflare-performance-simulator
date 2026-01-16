import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$/;
function isIPAddress(hostname: string): boolean {
    return IP_REGEX.test(hostname);
}
async function resolveIP(hostname: string): Promise<string | null> {
    if (!hostname || hostname === 'Simulation Mode' || hostname === 'N/A' || isIPAddress(hostname)) {
        return isIPAddress(hostname) ? hostname : null;
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
        return null;
    }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const validateUrl = (url: string | null | undefined) => {
        if (!url) return null;
        try {
            const hasProtocol = url.startsWith('http');
            const cleanUrl = hasProtocol ? url : `https://${url}`;
            const parsed = new URL(cleanUrl);
            return parsed.toString();
        } catch {
            return null;
        }
    };
    app.get('/api/simulate/edge', async (c) => {
        try {
            const urlParam = c.req.query('url');
            const targetUrl = validateUrl(urlParam);
            let realSize = '4.2kb';
            let ip = '1.1.1.1';
            let protocol: 'http' | 'https' = 'https';
            if (targetUrl) {
                const urlObj = new URL(targetUrl);
                protocol = urlObj.protocol === 'https:' ? 'https' : 'http';
                const resolved = await resolveIP(urlObj.hostname);
                if (resolved) ip = resolved;
                try {
                    const res = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });
                    const bytes = res.headers.get('content-length');
                    realSize = bytes ? `${(parseInt(bytes) / 1024).toFixed(1)}kb` : '4.5kb';
                } catch (e) {}
            }
            // Minimal simulated delay for the Edge proxy hop
            await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
            return c.json({
                success: true,
                data: {
                    source: 'Cloudflare Edge',
                    size: realSize,
                    resolvedIP: ip,
                    testedUrl: targetUrl || 'Simulation Mode',
                    protocol,
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            return c.json({ success: true, data: { error: true, source: 'Cloudflare Edge', size: '0kb', protocol: 'http' } });
        }
    });
    app.get('/api/stats', async (c) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.getCounterValue();
            return c.json({ success: true, data } satisfies ApiResponse<number>);
        } catch (err) {
            return c.json({ success: false, error: 'Failed' }, 500);
        }
    });
    app.post('/api/stats/increment', async (c) => {
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.increment();
            return c.json({ success: true, data } satisfies ApiResponse<number>);
        } catch (err) {
            return c.json({ success: false, error: 'Failed' }, 500);
        }
    });
}