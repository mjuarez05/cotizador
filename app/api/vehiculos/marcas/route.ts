import { NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";

export async function GET() {
  const providers = getAllActiveProviders();
  const provider = providers[0];

  if (!provider?.getBrands) {
    return NextResponse.json({ error: "No provider with brands support" }, { status: 400 });
  }

  try {
    const data = await provider.getBrands();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[marcas/route] Error fetching brands:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
