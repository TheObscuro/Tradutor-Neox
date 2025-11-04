type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 600_000);
const MAX_REQ = Number(process.env.RATE_LIMIT_MAX || 60);

export function rateLimitCheck(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQ - 1, reset: WINDOW_MS };
  }
  if (b.count >= MAX_REQ) return { allowed: false, remaining: 0, reset: b.resetAt - now };
  b.count += 1;
  return { allowed: true, remaining: MAX_REQ - b.count, reset: b.resetAt - now };
}

export function getIp(req: Request) {
  const hdr =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  return hdr as string;
}
