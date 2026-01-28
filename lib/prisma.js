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

// Booking functions
export async function createBooking(userId, bookingData) {
  return prisma.booking.create({
    data: {
      userId,
      ...bookingData,
    },
  });
}

export async function getBookingsByUserId(userId) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function getAllBookings() {
  return prisma.booking.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateBookingStatus(id, status, notes = null) {
  return prisma.booking.update({
    where: { id },
    data: { status, notes, updatedAt: new Date() },
    include: { user: true },
  });
}

export async function updateBooking(id, bookingData) {
  return prisma.booking.update({
    where: { id },
    data: { ...bookingData, updatedAt: new Date() },
    include: { user: true },
  });
}

export async function deleteBooking(id) {
  return prisma.booking.delete({
    where: { id },
  });
}

export default prisma;
