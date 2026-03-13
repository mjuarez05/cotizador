import { NextResponse } from "next/server";
import { getMarcas } from "@/lib/mercantilClient";

export async function GET() {
  const data = await getMarcas();
  return NextResponse.json(data);
}