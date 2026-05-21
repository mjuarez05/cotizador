import { NextRequest, NextResponse } from "next/server";
import { getAllActiveProviders } from "@/lib/providers/registry";
import { CommonQuoteInput } from "@/lib/types/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { infoauto, anio, uso, gnc, localidad, providerSpecificFields } = body;

    if (!infoauto || !anio || uso === undefined || gnc === undefined || !localidad?.id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: infoauto, anio, uso, gnc, localidad.id" },
        { status: 400 }
      );
    }

    const commonInput: CommonQuoteInput = {
      vehicleYear: anio,
      zipCode: localidad.codigo_postal?.toString() ?? "",
      infoauto,
      uso,
      gnc,
      providerSpecificFields: {
        ...providerSpecificFields,
        localidadId: localidad.id,
        codigoPostal: localidad.codigo_postal,
      },
    };

    const providers = getAllActiveProviders();

    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const params = provider.mapRequest(commonInput);
        const raw = await provider.fetchQuote(params);
        return provider.normalizeResponse(raw);
      })
    );

    const successfulQuotes = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any>).value);

    const errors = results
      .map((r, idx) => ({ result: r, provider: providers[idx].displayName }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ result, provider }) => ({
        provider,
        error: result.status === "rejected" && result.reason instanceof Error
          ? result.reason.message
          : "Unknown error",
      }));

    return NextResponse.json({ quotes: successfulQuotes, errors });
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al procesar la cotización" },
      { status: 500 }
    );
  }
}
