import { NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marca = searchParams.get("marca");
  const anio = searchParams.get("anio");

  if (!marca || !anio) {
    return NextResponse.json({ error: "Falta marca o anio" }, { status: 400 });
  }

  const providers = getAllActiveProviders();
  const provider = providers[0];

  if (!provider?.getModels) {
    return NextResponse.json({ error: "No provider with models support" }, { status: 400 });
  }

  try {
    const data = await provider.getModels(marca, parseInt(anio));
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[modelos/route] Error fetching models:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
