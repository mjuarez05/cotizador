import { NextResponse } from "next/server";
import { getCotizacion } from "@/lib/mercantilClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cotizacion = await getCotizacion(Number(id));
    return NextResponse.json(cotizacion);
  } catch (error) {
    console.error("Error fetching cotizacion:", error);
    return NextResponse.json(
      { error: "Error al obtener cotización" },
      { status: 500 }
    );
  }
}