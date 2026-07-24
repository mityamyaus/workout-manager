import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { createSession, verifyPassword, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Введите email и пароль" }, { status: 400 });
  }

  const trainer = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!trainer || trainer.role !== ROLES.TRAINER || !trainer.passwordHash) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const valid = await verifyPassword(password, trainer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const token = await createSession(trainer.id);
  const res = NextResponse.json({ id: trainer.id, name: trainer.name, email: trainer.email });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
