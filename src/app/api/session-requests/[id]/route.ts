import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action } = body as { action?: "approve" | "reject" };

  const changeRequest = await prisma.sessionChangeRequest.findUnique({ where: { id } });
  if (!changeRequest) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (action === "approve") {
    await prisma.trainingSession.update({
      where: { id: changeRequest.sessionId },
      data: {
        date: changeRequest.requestedDate,
        startTime: changeRequest.requestedStartTime,
        endTime: changeRequest.requestedEndTime,
      },
    });
    const updated = await prisma.sessionChangeRequest.update({
      where: { id },
      data: { status: "APPROVED", resolvedAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.sessionChangeRequest.update({
      where: { id },
      data: { status: "REJECTED", resolvedAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Некорректное действие" }, { status: 400 });
}
