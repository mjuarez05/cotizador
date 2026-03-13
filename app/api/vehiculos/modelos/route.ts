import { NextResponse } from "next/server";
import { getModelos } from "@/lib/mercantilClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const marca = searchParams.get("marca");
  const anio = searchParams.get("anio");

  if (!marca || !anio) {
    return NextResponse.json(
      { error: "marca y anio requeridos" },
      { status: 400 }
    );
  }

  const data = await getModelos(marca, anio);

  return NextResponse.json(data);
}