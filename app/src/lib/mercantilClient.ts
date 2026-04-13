import { getMercantilToken } from "@/lib/mercantilAuth";

const BASE_URL = process.env.API_URL!;

async function mercantilFetch(endpoint: string) {
  const token = await getMercantilToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": process.env.API_SUB_KEY!,
    },
  });

  if (!res.ok) {
    throw new Error(`Mercantil API error: ${res.status}`);
  }

  return res.json();
}

async function mercantilPost(endpoint: string, body: unknown) {
  const token = await getMercantilToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": process.env.API_SUB_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Mercantil API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// ============ COTIZACIONES ============

// Response when getting ALL cotizaciones
export type CotizacionesListResponse = {
  usuario: string;
  offset: number;
  limit: number;
  total: number;
  datos: CotizacionListItem[];
  numitems: number;
};

// Item when getting list
export type CotizacionListItem = {
  id: number;
  rama: number;
  bien: string;
  ubicacion: string;
  fecha: string;
  subrama: number;
};

// Full cotizacion details
export type CotizacionDetail = {
  id: number;
  rama: number;
  localidad: {
    id: number;
    nombre: string;
    provincia: string;
    codigo_postal: number;
  };
  vehiculo: {
    id: number;
    nombre: string;
    anio: number;
    valor: number;
    uso: number;
    gnc: boolean;
    infoauto: number;
    rastreo: number;
  };
  suma_asegurada: number;
  iva: number;
  ajuste_suma: number;
  desglose: boolean;
  periodo: number;
  cuotas: number;
  comision: number;
  bonificacion: number;
  bonificacion_extraordinaria: number;
  productor: {
    id: number;
    nombre: string;
  };
  cantidad: number;
  resultado: CotizacionResultado[];
  guardar: boolean;
  advertencia: {
    codigo: string;
    descripcion: string;
    detalle: [];
  };
  fecha_cotizacion: string;
  pago: {
    tipo_pago: string;
    canal: number | null;
    codigo: number | null;
  };
};

export type CotizacionResultado = {
  numero: number | null;
  puntaje: number;
  producto: string;
  texto: string;
  titulo: string;
  descripcion: string;
  costo: number;
  cantidad_cuotas: number;
  desglose: {
    total: {
      cuota: number | null;
      premio: number;
    };
    cuotas: {
      cuota: number | null;
      premio: number;
    }[];
  };
  error: string;
  franquicia: number | null;
  codigo_producto: number;
  adicional: {
    granizo: boolean;
  };
  inspeccion: {
    opciones: {
      id: number | null;
      descripcion: string | null;
    }[];
  };
};

export async function getCotizaciones(): Promise<CotizacionesListResponse> {
  return mercantilFetch("/cotizaciones/v2/");
}

export async function getCotizacion(id: number): Promise<CotizacionDetail> {
  return mercantilFetch(`/cotizaciones/v2/${id}`);
}

// ============ VEHÍCULOS ============

export async function getMarcas() {
  return mercantilFetch("/vehiculos/v1/marcas");
}

export async function getModelos(marca: string, anio: string) {
  return mercantilFetch(`/vehiculos/v1/marcas/${marca}/${anio}`);
}

export async function getVersiones(marca: string, anio: string, modelo: string) {
  return mercantilFetch(`/vehiculos/v1/marcas/${marca}/${anio}/${modelo}`);
}

export async function getLocalidades(cp: string) {
  return mercantilFetch(`/generales/v1/localidades/cp/${cp}`);
}

type CotizacionParams = {
  infoauto: number;
  anio: number;
  uso: number;
  gnc: boolean;
  localidad: {
    id: number;
    codigo_postal: number;
  };
};

type CotizacionResponse = {
  prima: number;
  premio: number;
};

export async function cotizarVehiculo(params: CotizacionParams): Promise<CotizacionResponse> {
  const config = {
    canal: 81,
    comision: 20,
    bonificacion: 30,
    periodo: 1,
    cuotas: 1,
    pago: {
      tipo_pago: "C",
    },
    iva: 5,
    productor: {
      id: 98816,
    },
  };

  const body = {
    canal: config.canal,
    localidad: params.localidad,
    vehiculo: {
      infoauto: params.infoauto,
      anio: params.anio,
      uso: params.uso,
      gnc: params.gnc,
    },
    comision: config.comision,
    bonificacion: config.bonificacion,
    periodo: config.periodo,
    cuotas: config.cuotas,
    pago: config.pago,
    iva: config.iva,
    productor: config.productor,
  };

  return mercantilPost("/cotizaciones/v2/auto", body);
}