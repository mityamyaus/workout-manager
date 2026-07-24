import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month = searchParams.get("month"); // YYYY-MM

  const sessions = await prisma.trainingSession.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      ...(month ? { date: { startsWith: month } } : {}),
    },
    include: sessionInclude,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { date, startTime, endTime, title, studentId, trainerId, programId, notes, createdBy } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
    title?: string;
    studentId?: string;
    trainerId?: string;
    programId?: string | null;
    notes?: string;
    createdBy?: "TRAINER" | "STUDENT";
  };

  if (!date || !startTime || !endTime || !studentId || !trainerId) {
    return NextResponse.json(
      { error: "Дата, время начала/конца, ученик и тренер обязательны" },
      { status: 400 }
    );
  }

  const session = await prisma.trainingSession.create({
    data: {
      date,
      startTime,
      endTime,
      title: title?.trim() || null,
      studentId,
      trainerId,
      programId: programId || null,
      notes: notes?.trim() || null,
      createdBy: createdBy || "TRAINER",
    },
    include: sessionInclude,
  });

  return NextResponse.json(session, { status: 201 });
}
