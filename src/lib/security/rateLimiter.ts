/**
 * Rate Limiter en memoria ligero para Next.js App Router.
 * Emplea ventana deslizante por IP y clave de acción.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpieza periódica de entradas vencidas cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function checkRateLimit(
  ip: string,
  action: string,
  options: RateLimitOptions,
  identifier?: string
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const cleanIp = ip || "unknown";
  const keys = [`${action}:ip:${cleanIp}`];

  if (identifier && identifier.trim()) {
    keys.push(`${action}:id:${identifier.trim().toLowerCase()}`);
  }

  for (const key of keys) {
    const entry = rateLimitMap.get(key);
    if (entry && now <= entry.resetAt && entry.count >= options.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      };
    }
  }

  let minRemaining = options.limit;
  let maxResetInSec = Math.ceil(options.windowMs / 1000);

  for (const key of keys) {
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      minRemaining = Math.min(minRemaining, options.limit - 1);
    } else {
      entry.count += 1;
      minRemaining = Math.min(minRemaining, options.limit - entry.count);
      maxResetInSec = Math.max(maxResetInSec, Math.ceil((entry.resetAt - now) / 1000));
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, minRemaining),
    resetInSec: maxResetInSec,
  };
}

export function getClientIp(request: Request): string {
  // 1. Cloudflare header (no falsificable por el cliente si pasa por Cloudflare)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  // 2. Header estándar de reverse proxy (Nginx / Vercel / Cloud Run)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // 3. Si se usa x-forwarded-for, tomar la última IP confiable anexada por el reverse proxy
  // para evitar bypasses donde el cliente inyecta una IP falsa al inicio
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (ips.length > 0) {
      // Retornar la última IP registrada por la cadena de proxies
      return ips[ips.length - 1];
    }
  }

  return "127.0.0.1";
}
