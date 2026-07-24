import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export const SESSION_COOKIE = "session_token";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function newSessionExpiry() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: { token, userId, expiresAt: newSessionExpiry() },
  });
  return token;
}

export async function destroySessionByToken(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getTrainerByToken(token: string | undefined | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }
  if (session.user.role !== ROLES.TRAINER) return null;
  return session.user;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
