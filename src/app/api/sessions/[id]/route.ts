import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { date, startTime, endTime, title, programId, notes } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
    title?: string;
    programId?: string | null;
    notes?: string;
  };

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
    },
  });
  return NextResponse.json(session);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.trainingSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
