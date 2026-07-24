import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { createSession, hashPassword, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body as { name?: string; email?: string; password?: string };

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Введите имя" }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const trainer = await prisma.user.create({
    data: {
      name: name.trim(),
      role: ROLES.TRAINER,
      email: normalizedEmail,
      passwordHash,
    },
  });

  const token = await createSession(trainer.id);
  const res = NextResponse.json({ id: trainer.id, name: trainer.name, email: trainer.email }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
