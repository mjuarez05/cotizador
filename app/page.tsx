"use client";

import { useState } from "react";
import Form from "./src/components/Form";
import WhatsappButton from "./src/components/WhatsappButton";

type ResultadoCotizacion = {
  numero: number;
  producto: string;
  titulo: string;
  texto: string;
  costo: number;
  desglose: {
    total: {
      premio: number;
    };
    cuotas: {
      cuota: number;
      premio: number;
    }[];
  };
};

type CotizacionResponse = {
  id: number;
  vehiculo: {
    id: number;
    nombre: string;
    anio: number;
    valor: number;
  };
  localidad: {
    id: number;
    nombre: string;
    provincia: string;
    codigo_postal: number;
  };
  suma_asegurada: number;
  resultado: ResultadoCotizacion[];
};

type FormData = {
  cp: string;
  localidad: string;
  marca: string;
  modelo: string;
  version: string;
  anio: string;
  uso: string;
  gnc: string;
};

export default function Home() {
  const [result, setResult] = useState<CotizacionResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cp: "",
    localidad: "",
    marca: "",
    modelo: "",
    version: "",
    anio: "",
    uso: "1",
    gnc: "false",
  });

  return (
    <main className="container">
      <div className="deco1"></div>
      <div className="deco2"></div>
      <h1 className="title">Cotizador online</h1>
      <Form onResultChange={setResult} onFormDataChange={setFormData} />
      <WhatsappButton result={result} formData={formData} />
    </main>
  );
}