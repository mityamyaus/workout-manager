import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const exerciseId = searchParams.get("exerciseId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId обязателен" }, { status: 400 });
  }

  const entries = await prisma.progressEntry.findMany({
    where: {
      studentId,
      ...(exerciseId ? { exerciseId } : {}),
    },
    include: { exercise: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, exerciseId, date, weight, reps, sets } = body as {
    studentId?: string;
    exerciseId?: string;
    date?: string;
    weight?: number;
    reps?: number;
    sets?: number;
  };

  if (!studentId || !exerciseId || !date || weight === undefined || reps === undefined) {
    return NextResponse.json(
      { error: "Ученик, упражнение, дата, вес и повторения обязательны" },
      { status: 400 }
    );
  }

  const entry = await prisma.progressEntry.create({
    data: {
      studentId,
      exerciseId,
      date,
      weight,
      reps,
      sets: sets ?? 1,
    },
    include: { exercise: true },
  });

  return NextResponse.json(entry, { status: 201 });
}
