"use client";

import { useState } from "react";
import Form from "./src/components/Form";
import WhatsappButton from "./src/components/WhatsappButton";
import InfiniteCarousel from "./src/components/InfiniteCarousel";

import { NormalizedQuoteResult } from "./src/lib/types/domain";
import Image from "next/image";
import logo from "../public/logobiotti.webp"

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

type HomeResult = {
  quotes: NormalizedQuoteResult[];
  errors: { provider: string; error: string }[];
} | null;

export default function Home() {
  const [result, setResult] = useState<HomeResult>(null);
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
      <div className="background-image"></div>
      <div className="deco1">
        <Image src={logo} width={250} height={200} alt="Biotti" className="biotti"/>
        {/* <p className="biotti">Biotti Michellini</p>
        <small className="seguros">SEGUROS</small> */}
      </div>
      <div className="deco2"></div>
      <h1 className="title">Cotizador Online</h1>
      <p className="subtitle">Cotizá en tres pasos y sin datos personales</p>
      <Form onResultChange={setResult} onFormDataChange={setFormData} />
      {/* <div className="descuento">
        <Image src={}/>
      </div> */}
      <InfiniteCarousel
        logos={[
          "/logos/mercantil.webp",
           "/logos/sancristobal.webp",
          "/logos/color-ss1.svg",
          "/logos/Allianz.webp",
          "/logos/Nacion.webp",
          "/logos/atm-2.webp",
          
         
        ]}
      />
      <WhatsappButton result={result} formData={formData} />
    </main>
  );
}