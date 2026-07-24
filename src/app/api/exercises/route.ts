import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search
        ? { name: { contains: search } }
        : {}),
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(exercises);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, category, description } = body as {
    name?: string;
    category?: string;
    description?: string;
  };

  if (!name || !name.trim() || !category) {
    return NextResponse.json({ error: "Название и категория обязательны" }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: name.trim(),
      category,
      description: description?.trim() || null,
      isCustom: true,
    },
  });
  return NextResponse.json(exercise, { status: 201 });
}
