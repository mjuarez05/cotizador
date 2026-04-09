"use client";

import Image from "next/image";

type Props = {
  result: any | null;
  formData: {
    cp: string;
    localidad: string;
    marca: string;
    modelo: string;
    anio: string;
  };
};

export default function WhatsappButton({ result, formData }: Props) {
  const telefono = "5493406461881";

  let mensaje = "";

  if (result) {
    mensaje = `
Hola, quiero consultar por esta cotización:
N° Cotización: ${result.id}
CP: ${formData.cp}
Localidad: ${formData.localidad || result.localidad.nombre}
Vehículo: ${result.vehiculo.nombre} (${result.vehiculo.anio})
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