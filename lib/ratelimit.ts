// RN-02: limite de requisicoes por IP em uma janela de tempo.
// Implementacao em memoria (por instancia do servidor).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 600_000);
const MAX_REQ = Number(process.env.RATE_LIMIT_MAX || 60);

export type RateLimitResult = { allowed: boolean; remaining: number; reset: number };

export function rateLimitCheck(ip: string): RateLimitResult {
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

export function getIp(req: Request): string {
  return (
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

/** Retorna uma resposta 429 quando o IP excedeu o limite, ou null quando pode seguir. */
export function rejectIfRateLimited(req: Request): Response | null {
  const r = rateLimitCheck(getIp(req));
  if (r.allowed) return null;
  const seconds = Math.ceil(r.reset / 1000);
  return new Response(
    JSON.stringify({ error: `Limite de requisições atingido. Tente novamente em ${seconds} segundos.` }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(seconds) } }
  );
}
