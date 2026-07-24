import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const exerciseInclude = {
  exercises: {
    include: { exercise: true, sets: { orderBy: { order: "asc" as const } } },
    orderBy: { order: "asc" as const },
  },
  author: true,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const programs = await prisma.program.findMany({
    where: { ...(studentId ? { studentId } : {}) },
    include: exerciseInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(programs);
}

type SetInput = { weight: number; reps: number };
type ExerciseInput = {
  exerciseId: string;
  restSeconds?: number;
  notes?: string;
  sets: SetInput[];
};

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    studentId,
    authorId,
    isIndividual,
    exercises,
  } = body as {
    name?: string;
    studentId?: string;
    authorId?: string;
    isIndividual?: boolean;
    exercises?: ExerciseInput[];
  };

  if (
    !name ||
    !studentId ||
    !authorId ||
    !exercises ||
    exercises.length === 0 ||
    exercises.some((ex) => !ex.sets || ex.sets.length === 0)
  ) {
    return NextResponse.json(
      { error: "Название, ученик, автор, упражнения и хотя бы один сет на каждое обязательны" },
      { status: 400 }
    );
  }

  const program = await prisma.program.create({
    data: {
      name: name.trim(),
      studentId,
      authorId,
      isIndividual: !!isIndividual,
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

  return NextResponse.json(program, { status: 201 });
}
