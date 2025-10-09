import { prisma } from "./prisma";

export async function awardPoints(userId: string, delta: number, reason: string, meta?: any) {
  await prisma.$transaction([
    prisma.pointsLedger.create({ data: { userId, delta, reason, meta } }),
    prisma.user.update({ where: { id: userId }, data: { points: { increment: delta } } }),
  ]);
}
