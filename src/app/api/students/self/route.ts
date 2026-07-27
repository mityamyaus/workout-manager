import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { generateInviteCode } from "@/lib/inviteCode";

async function uniqueInviteCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode();
    const existing = await prisma.user.findUnique({ where: { inviteCode: code } });
    if (!existing) return code;
  }
  throw new Error("Не удалось сгенерировать уникальный код");
}

// Публичная регистрация ученика БЕЗ тренера (занимается самостоятельно).
// В отличие от POST /api/students, не требует авторизации тренера.
export async function POST(req: NextRequest) {
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
      trainerId: null,
      inviteCode,
    },
  });

  return NextResponse.json(student, { status: 201 });
}
