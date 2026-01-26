import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({ name, email, password }) {
  return prisma.user.create({ data: { name, email, password } });
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createRefreshToken(userId, token, expiresAt) {
  return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
}

export async function findRefreshTokenByToken(token) {
  return prisma.refreshToken.findUnique({ where: { token } });
}

export async function revokeRefreshTokenById(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
}

export async function deleteRefreshTokenByToken(token) {
  return prisma.refreshToken.delete({ where: { token } });
}

export async function incrementHaircutCount(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { haircutCount: { increment: 1 } },
  });
}

export default prisma;
