import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { date, startTime, endTime, title, programId, notes, reminderMinutesBefore } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
    title?: string;
    programId?: string | null;
    notes?: string;
    reminderMinutesBefore?: number | null;
  };

  const existing = await prisma.trainingSession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  // Тренировку, назначенную тренером, может редактировать только тренер-владелец.
  // Свою собственную тренировку ученик редактирует без дополнительной авторизации.
  if (existing.createdBy === "TRAINER") {
    const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!trainer || existing.trainerId !== trainer.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
    }
  }

  // прямое редактирование (тренером, либо учеником своей же сессии) снимает
  // висящую заявку на перенос, чтобы не оставалась неактуальной
  await prisma.sessionChangeRequest.deleteMany({ where: { sessionId: id } });

  const session = await prisma.trainingSession.update({
    where: { id },
    data: {
      ...(date !== undefined ? { date } : {}),
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(programId !== undefined ? { programId } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(reminderMinutesBefore !== undefined ? { reminderMinutesBefore } : {}),
    },
  });
  return NextResponse.json(session);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.trainingSession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  if (existing.createdBy === "TRAINER") {
    const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!trainer || existing.trainerId !== trainer.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
    }
  }

  await prisma.trainingSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
