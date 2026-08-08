import { prisma } from "@/lib/prisma";

export async function getOrCreateCharacter(userId: string) {
  return prisma.character.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}
