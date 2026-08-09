import { prisma } from "@/lib/prisma";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

/**
 * DB-backed brute-force guard for /login and /signup - no third-party
 * rate-limiting service. Old rows are pruned lazily on each check.
 */
export async function isRateLimited(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  await prisma.loginAttempt.deleteMany({
    where: { attemptedAt: { lt: windowStart } },
  });
  const count = await prisma.loginAttempt.count({
    where: { identifier, attemptedAt: { gte: windowStart } },
  });
  return count >= MAX_ATTEMPTS;
}

export async function recordAttempt(identifier: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { identifier } });
}

export function identifierFromRequest(request: Request, email: string): string[] {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip ? [email, ip] : [email];
}
