import { NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");

  if (!cp) {
    return NextResponse.json({ error: "Falta cp" }, { status: 400 });
  }

  const providers = getAllActiveProviders();
  const provider = providers[0];

  if (!provider?.getLocalidades) {
    return NextResponse.json({ error: "No provider with localidades support" }, { status: 400 });
  }

  const data = await provider.getLocalidades(cp);
  return NextResponse.json(data);
}
