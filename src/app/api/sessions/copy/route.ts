import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

const sessionInclude = {
  program: {
    include: {
      exercises: {
        include: { exercise: true, sets: { orderBy: { order: "asc" as const } } },
        orderBy: { order: "asc" as const },
      },
    },
  },
  student: true,
  changeRequest: true,
};

// Копирует все тренировки ученика с одной даты на другую. Доступно только тренеру.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, sourceDate, targetDate } = body as {
    studentId?: string;
    sourceDate?: string;
    targetDate?: string;
  };

  if (!studentId || !sourceDate || !targetDate) {
    return NextResponse.json(
      { error: "Ученик, дата-источник и дата назначения обязательны" },
      { status: 400 }
    );
  }

  const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || !trainer || student.trainerId !== trainer.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
  }

  const sourceSessions = await prisma.trainingSession.findMany({
    where: { studentId, date: sourceDate },
  });

  if (sourceSessions.length === 0) {
    return NextResponse.json({ error: "На эту дату нет тренировок" }, { status: 400 });
  }

  const created = await prisma.$transaction(
    sourceSessions.map((s) =>
      prisma.trainingSession.create({
        data: {
          date: targetDate,
          startTime: s.startTime,
          endTime: s.endTime,
          title: s.title,
          studentId: s.studentId,
          trainerId: trainer.id,
          programId: s.programId,
          notes: s.notes,
          createdBy: "TRAINER",
        },
        include: sessionInclude,
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}
