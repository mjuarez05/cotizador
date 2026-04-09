import { NextResponse } from "next/server";
import { getLocalidades } from "@/lib/mercantilClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");

  if (!cp) {
    return NextResponse.json({ error: "cp requerido" }, { status: 400 });
  }

  const data = await getLocalidades(cp);
  return NextResponse.json(data);
}
