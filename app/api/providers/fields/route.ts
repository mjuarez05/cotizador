import { NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";

export async function GET() {
  const providers = getAllActiveProviders();

  const fieldsByProvider = providers.map((provider) => ({
    providerId: provider.id,
    providerName: provider.displayName,
    fields: provider.getRequiredFields(),
  }));

  const allFields = providers.flatMap((p) => p.getRequiredFields());

  return NextResponse.json({
    providers: fieldsByProvider,
    mergedFields: allFields,
  });
}
