import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get("trainerId");
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");

  const requests = await prisma.sessionChangeRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      session: {
        ...(trainerId ? { trainerId } : {}),
        ...(studentId ? { studentId } : {}),
      },
    },
    include: { session: { include: { student: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
