import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function listActivity(userId: string, cursor?: string) {
  const items = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > PAGE_SIZE;
  return {
    items: items.slice(0, PAGE_SIZE),
    nextCursor: hasMore ? items[PAGE_SIZE - 1]?.id ?? null : null,
  };
}
