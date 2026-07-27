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
  progressEntries: true,
};

type SessionWithRelations = Awaited<ReturnType<typeof prisma.trainingSession.findMany<{ include: typeof sessionInclude }>>>[number];

// Тренировка считается выполненной, когда по каждому сету программы залогирован
// хотя бы один подход именно в рамках этой тренировки (progressEntries.sessionId).
function attachCompleted(session: SessionWithRelations) {
  const { progressEntries, ...rest } = session;
  if (!rest.program) {
    return { ...rest, completed: false };
  }

  const doneCounts = new Map<string, number>();
  for (const e of progressEntries) {
    doneCounts.set(e.exerciseId, (doneCounts.get(e.exerciseId) ?? 0) + 1);
  }

  const totalSets = rest.program.exercises.reduce((sum, pe) => sum + pe.sets.length, 0);
  const doneSets = rest.program.exercises.reduce(
    (sum, pe) => sum + Math.min(doneCounts.get(pe.exerciseId) ?? 0, pe.sets.length),
    0
  );

  return { ...rest, completed: totalSets > 0 && doneSets >= totalSets };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const trainerId = searchParams.get("trainerId");
  const month = searchParams.get("month"); // YYYY-MM

  const sessions = await prisma.trainingSession.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      ...(trainerId ? { trainerId } : {}),
      ...(month ? { date: { startsWith: month } } : {}),
    },
    include: sessionInclude,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(sessions.map(attachCompleted));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { date, startTime, endTime, title, studentId, trainerId, programId, notes, createdBy, reminderMinutesBefore } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
    title?: string;
    studentId?: string;
    trainerId?: string | null;
    programId?: string | null;
    notes?: string;
    createdBy?: "TRAINER" | "STUDENT";
    reminderMinutesBefore?: number | null;
  };

  if (!date || !startTime || !endTime || !studentId) {
    return NextResponse.json(
      { error: "Дата, время начала/конца и ученик обязательны" },
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
      trainerId: trainerId || null,
      programId: programId || null,
      notes: notes?.trim() || null,
      createdBy: createdBy || "TRAINER",
      reminderMinutesBefore: reminderMinutesBefore ?? null,
    },
    include: sessionInclude,
  });

  return NextResponse.json(attachCompleted(session), { status: 201 });
}
