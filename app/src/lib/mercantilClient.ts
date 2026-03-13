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

export async function getMarcas() {
  return mercantilFetch("/vehiculos/v1/marcas");
}

export async function getModelos(marca: string, anio: string) {
  return mercantilFetch(`/vehiculos/v1/marcas/${marca}/${anio}`);
}
export async function getVersiones(marca: string, anio: string, modelo: string) {
  return mercantilFetch(`/vehiculos/v1/marcas/${marca}/${anio}/${modelo}`);
}