import { NextRequest, NextResponse } from "next/server";
import { getTrainerByToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const trainer = await getTrainerByToken(token);
  if (!trainer) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  return NextResponse.json({ id: trainer.id, name: trainer.name, email: trainer.email });
}
