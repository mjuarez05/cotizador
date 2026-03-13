import { NextResponse } from "next/server";
import { getVersiones } from "@/lib/mercantilClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const marca = searchParams.get("marca");
  const anio = searchParams.get("anio");
  const modelo = searchParams.get("modelo");

  if (!marca || !anio || !modelo) {
    return NextResponse.json(
      { error: "marca y anio requeridos" },
      { status: 400 }
    );
  }

  const data = await getVersiones(marca, anio, modelo);

  return NextResponse.json(data);
}