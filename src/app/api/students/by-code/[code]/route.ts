import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const student = await prisma.user.findUnique({
    where: { inviteCode: code.trim().toUpperCase() },
  });
  if (!student) return NextResponse.json({ error: "Код не найден" }, { status: 404 });
  return NextResponse.json(student);
}
