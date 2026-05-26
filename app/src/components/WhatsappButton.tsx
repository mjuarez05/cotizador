"use client";

import Image from "next/image";
import { NormalizedQuoteResult } from "@/lib/types/domain";

type Props = {
  result: { quotes: NormalizedQuoteResult[]; errors: any[] } | null;
  formData: {
    cp: string;
    localidad: string;
    marca: string;
    modelo: string;
    anio: string;
  };
};

export default function WhatsappButton({ result, formData }: Props) {
  const telefono = "5493406518069";

  let mensaje = "";

  if (result && result.quotes.length > 0) {
    const quotes = result.quotes;
    mensaje = `
Hola, quiero consultar por estas cotizaciones:
CP: ${formData.cp}
Vehículo: ${formData.marca || "-"} ${formData.modelo || "-"} (${formData.anio || "-"})

${quotes.map((q, i) => `${i + 1}. ${q.providerName} - ${q.productName}: $${q.premium}`).join("\n")}
`;
  } else {
    mensaje = `
Hola, quiero hacer una consulta:

CP: ${formData.cp || "No informado"}
Vehículo: ${formData.marca || "-"} ${formData.modelo || "-"} (${formData.anio || "-"})
`;
  }

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="wbutton-container">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <button className="whatsapp-button">
          <Image src="/whatsapp.svg" alt="Whatsapp" width={32} height={32} />
        </button>
      </a>
    </div>
  );
}