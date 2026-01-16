import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse } from '@shared/types';
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$/;
function isIPAddress(hostname: string): boolean {
  return IP_REGEX.test(hostname);
}
async function resolveIP(hostname: string): Promise<string> {
  if (!hostname || hostname === 'Simulation Mode' || hostname === 'N/A' || isIPAddress(hostname)) {
    return isIPAddress(hostname) ? hostname : "N/A";
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`, {
      signal: controller.signal
    });
    const json: any = await res.json();
    clearTimeout(timeoutId);
    if (json.Answer && json.Answer.length > 0) {
      return json.Answer[0].data;
    }
    return "N/A";
  } catch (e) {
    clearTimeout(timeoutId);
    return "N/A";
  }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/metadata', async (c) => {
    const urlParam = c.req.query('url');
    if (!urlParam) {
      return c.json({ success: false, error: 'URL is required' }, 400);
    }
    try {
      const url = new URL(urlParam.startsWith('http') ? urlParam : `https://${urlParam}`);
      const ip = await resolveIP(url.hostname);
      let size = '4.5kb';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      try {
        const res = await fetch(url.toString(), {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow'
        });
        const contentLength = res.headers.get('content-length');
        if (contentLength) {
          const bytes = parseInt(contentLength, 10);
          if (!isNaN(bytes) && bytes > 0) {
            size = `${(bytes / 1024).toFixed(1)}kb`;
          }
        }
      } catch (e) {
        // Ignore non-fatal metadata errors
      } finally {
        clearTimeout(timeoutId);
      }
      return c.json({
        success: true,
        data: {
          ip,
          size,
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '')
        }
      } satisfies ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: 'Invalid URL' }, 400);
    }
  });
  app.get('/api/stats', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const data = await stub.getCounterValue();
      return c.json({ success: true, data } satisfies ApiResponse<number>);
    } catch (err) {
      return c.json({ success: false, error: 'Failed to fetch global stats' }, 500);
    }
  });
  app.post('/api/stats/increment', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const data = await stub.increment();
      return c.json({ success: true, data } satisfies ApiResponse<number>);
    } catch (err) {
      return c.json({ success: false, error: 'Failed to increment stats' }, 500);
    }
  });
}