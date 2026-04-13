import { NextResponse } from "next/server";
import { getCotizaciones } from "@/lib/mercantilClient";

export async function GET() {
  try {
    const cotizaciones = await getCotizaciones();
    return NextResponse.json(cotizaciones);
  } catch (error) {
    console.error("Error fetching cotizaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones" },
      { status: 500 }
    );
  }
}