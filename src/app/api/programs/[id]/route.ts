import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

const exerciseInclude = {
  exercises: {
    include: { exercise: true, sets: { orderBy: { order: "asc" as const } } },
    orderBy: { order: "asc" as const },
  },
  author: true,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = await prisma.program.findUnique({
    where: { id },
    include: exerciseInclude,
  });
  if (!program) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(program);
}

type SetInput = { weight: number; reps: number };
type ExerciseInput = {
  exerciseId: string;
  restSeconds?: number;
  notes?: string;
  sets: SetInput[];
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, exercises } = body as { name?: string; exercises?: ExerciseInput[] };

  if (!name || !exercises || exercises.length === 0 || exercises.some((ex) => !ex.sets || ex.sets.length === 0)) {
    return NextResponse.json(
      { error: "Название и хотя бы одно упражнение с сетом обязательны" },
      { status: 400 }
    );
  }

  const existing = await prisma.program.findUnique({ where: { id }, include: { student: true } });
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  // Программу, составленную тренером, может редактировать только тренер-владелец
  // ученика. Свою индивидуальную программу ученик редактирует без авторизации.
  if (!existing.isIndividual) {
    const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!trainer || existing.student.trainerId !== trainer.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
    }
  }

  const program = await prisma.$transaction(async (tx) => {
    await tx.programExercise.deleteMany({ where: { programId: id } });
    return tx.program.update({
      where: { id },
      data: {
        name: name.trim(),
        exercises: {
          create: exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            restSeconds: ex.restSeconds ?? 90,
            notes: ex.notes || null,
            order: index,
            sets: {
              create: ex.sets.map((s, sIndex) => ({
                weight: s.weight,
                reps: s.reps,
                order: sIndex,
              })),
            },
          })),
        },
      },
      include: exerciseInclude,
    });
  });

  return NextResponse.json(program);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.program.findUnique({ where: { id }, include: { student: true } });
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  if (!existing.isIndividual) {
    const trainer = await getTrainerByToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!trainer || existing.student.trainerId !== trainer.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 403 });
    }
  }

  await prisma.program.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
