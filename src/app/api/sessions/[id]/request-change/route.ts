import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ученик предлагает перенести дату/время сессии - требует подтверждения тренера.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { date, startTime, endTime } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
  };

  if (!date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Дата и время начала/конца обязательны" },
      { status: 400 }
    );
  }

  const request = await prisma.sessionChangeRequest.upsert({
    where: { sessionId: id },
    create: {
      sessionId: id,
      requestedDate: date,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      status: "PENDING",
    },
    update: {
      requestedDate: date,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      status: "PENDING",
      resolvedAt: null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
