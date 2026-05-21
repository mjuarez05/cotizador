import {
  CommonQuoteInput,
  NormalizedQuoteResult,
  DomainMarca,
  DomainModelo,
  DomainVersion,
  DomainLocalidad,
} from '../../types/domain';
import {
  CotizacionDetail,
  CotizacionResultado,
} from '../../mercantilClient';

export function mapToCommonInput(mercantilParams: {
  infoauto: number;
  anio: number;
  uso: number;
  gnc: boolean;
  localidadId: number;
  codigoPostal: number;
}): CommonQuoteInput {
  return {
    vehicleYear: mercantilParams.anio,
    zipCode: mercantilParams.codigoPostal.toString(),
    infoauto: mercantilParams.infoauto,
    uso: mercantilParams.uso,
    gnc: mercantilParams.gnc,
  };
}

export function mapRequest(commonInput: CommonQuoteInput): Record<string, any> {
  return {
    infoauto: commonInput.infoauto!,
    anio: commonInput.vehicleYear,
    uso: commonInput.uso ?? 1,
    gnc: commonInput.gnc ?? false,
    localidad: {
      id: commonInput.providerSpecificFields?.localidadId ?? 0,
      codigo_postal: parseInt(commonInput.zipCode),
    },
  };
}

export function normalizeResponse(raw: CotizacionDetail): NormalizedQuoteResult[] {
  return raw.resultado.map((r: CotizacionResultado) => ({
    providerId: 'mercantil',
    providerName: 'Mercantil Andina',
    productName: r.producto,
    premium: r.costo,
    installments: r.desglose.cuotas.map((c) => ({
      count: r.cantidad_cuotas,
      amount: c.cuota ?? c.premio,
    })),
    coverageDetails: {
      puntaje: r.puntaje,
      franquicia: r.franquicia,
      codigo_producto: r.codigo_producto,
      granizo: r.adicional?.granizo ?? false,
      texto: r.texto,
      titulo: r.titulo,
      descripcion: r.descripcion,
    },
    rawResponse: r,
  }));
}

export function mapMarcas(mercantilData: any[]): DomainMarca[] {
  const seen = new Set<string>();
  return mercantilData
    .map((m: any, idx: number) => ({
      id: m.id?.toString() ?? m.cod?.toString() ?? m.codigo?.toString() ?? m.numero?.toString() ?? m.code?.toString() ?? `fallback-${idx}`,
      name: m.nombre ?? m.name ?? m.descripcion ?? m.desc ?? m.label ?? '',
    }))
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
}

export function mapModelos(mercantilData: any[]): DomainModelo[] {
  if (mercantilData.length > 0 && typeof mercantilData[0] === 'string') {
    return (mercantilData as string[]).map((name: string) => ({
      id: name,
      name,
      year: 0,
    }));
  }
  const seen = new Set<string>();
  return mercantilData
    .map((m: any, idx: number) => ({
      id: m.id?.toString() ?? m.codigo?.toString() ?? m.numero?.toString() ?? m.code?.toString() ?? m.id_modelo?.toString() ?? m.codigo_modelo?.toString() ?? `fallback-${idx}`,
      name: m.nombre ?? m.descripcion ?? m.desc ?? m.name ?? m.label ?? '',
      year: m.anio ?? 0,
    }))
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
}

export function mapVersiones(mercantilData: any[]): DomainVersion[] {
  const seen = new Set<string>();
  return mercantilData
    .map((v: any, idx: number) => ({
      id: v.id?.toString() ?? v.codigo?.toString() ?? v.numero?.toString() ?? v.code?.toString() ?? v.id_version?.toString() ?? v.codigo_version?.toString() ?? `fallback-${idx}`,
      name: v.nombre ?? v.descripcion ?? v.desc ?? v.name ?? v.label ?? '',
      vehicleId: v.infoauto?.toString() ?? '',
    }))
    .filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
}

export function mapLocalidades(mercantilData: any[]): DomainLocalidad[] {
  return mercantilData.map((l: any) => ({
    id: l.id ?? 0,
    name: l.nombre ?? '',
    province: l.provincia ?? '',
    zipCode: l.codigo_postal ?? 0,
  }));
}
