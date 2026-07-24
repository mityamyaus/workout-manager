import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await prisma.user.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, weight } = body as { name?: string; weight?: number | null };

  // Смену имени может выполнять только тренер-владелец этого ученика.
  // Вес ученик может менять сам себе без авторизации (как и раньше).
  if (name !== undefined) {
    const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
    const student = await prisma.user.findUnique({ where: { id } });
    if (!student || !trainer || student.trainerId !== trainer.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
    }
  }

  const student = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(weight !== undefined ? { weight } : {}),
    },
  });
  return NextResponse.json(student);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || !trainer || student.trainerId !== trainer.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
