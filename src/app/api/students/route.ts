import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { generateInviteCode } from "@/lib/inviteCode";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

// Список учеников ТОЛЬКО текущего залогиненного тренера.
export async function GET(req: NextRequest) {
  const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!trainer) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: ROLES.STUDENT, trainerId: trainer.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(students);
}

async function uniqueInviteCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode();
    const existing = await prisma.user.findUnique({ where: { inviteCode: code } });
    if (!existing) return code;
  }
  throw new Error("Не удалось сгенерировать уникальный код");
}

export async function POST(req: NextRequest) {
  const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!trainer) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();
  const { name, weight } = body as { name?: string; weight?: number };

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
  }

  const inviteCode = await uniqueInviteCode();

  const student = await prisma.user.create({
    data: {
      name: name.trim(),
      role: ROLES.STUDENT,
      weight: weight ?? null,
      trainerId: trainer.id,
      inviteCode,
    },
  });

  return NextResponse.json(student, { status: 201 });
}
