import { prisma } from "@/lib/prisma";

export async function getOrCreateCharacter(userId: string) {
  return prisma.character.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updateUserSettings(
  userId: string,
  data: { name: string; timezone: string }
) {
  await getOrCreateCharacter(userId);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name: data.name } }),
    prisma.character.update({
      where: { userId },
      data: { timezone: data.timezone },
    }),
  ]);
}
