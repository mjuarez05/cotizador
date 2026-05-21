import { NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marca = searchParams.get("marca");
  const anio = searchParams.get("anio");
  const modelo = searchParams.get("modelo");

  if (!marca || !anio || !modelo) {
    return NextResponse.json({ error: "Falta marca, anio o modelo" }, { status: 400 });
  }

  const providers = getAllActiveProviders();
  const provider = providers[0];

  if (!provider?.getVersions) {
    return NextResponse.json({ error: "No provider with versions support" }, { status: 400 });
  }

  try {
    const data = await provider.getVersions(marca, parseInt(anio), modelo);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[versiones/route] Error fetching versions:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
