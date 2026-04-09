import { NextRequest, NextResponse } from "next/server";
import { cotizarVehiculo } from "@/lib/mercantilClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { infoauto, anio, uso, gnc, localidad } = body;

    if (!infoauto || !anio || uso === undefined || gnc === undefined || !localidad || !localidad.id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: infoauto, anio, uso, gnc, localidad.id" },
        { status: 400 }
      );
    }

    const result = await cotizarVehiculo({
      infoauto,
      anio,
      uso,
      gnc,
      localidad: {
        id: parseInt(localidad.id),
        codigo_postal: parseInt(localidad.codigo_postal),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}