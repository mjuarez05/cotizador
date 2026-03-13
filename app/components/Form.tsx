"use client";

import { useEffect, useState } from "react";

type Marca = {
  codigo: string;
  desc: string;
};

type Modelo = string
;

type Version = {
  codigo: string;
  desc: string;
};

type FormData = {
  name: string;
  email: string;
  marca: string;
  modelo: string;
  version: string;
  anio: string;
  cobertura: string;
};

export default function Form() {
  const [step, setStep] = useState(1);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [versiones, setVersiones] = useState<Version[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    marca: "",
    modelo: "",
    version: "",
    anio: "",
    cobertura: "",
  });

  useEffect(() => {
    async function loadMarcas() {
      const res = await fetch("/api/vehiculos/marcas");
      const data: Marca[] = await res.json();
      setMarcas(data);
    }

    loadMarcas();
  }, []);

  useEffect(() => {
    if (!formData.marca || !formData.anio) return;

    async function loadModelos() {
      const res = await fetch(
        `/api/vehiculos/modelos?marca=${formData.marca}&anio=${formData.anio}`
      );
      const data: Modelo[] = await res.json();
      setModelos(data);
      setVersiones([]);
      setFormData((prev) => ({ ...prev, modelo: "", version: "" }));
    }

    loadModelos();
  }, [formData.marca, formData.anio]);

  useEffect(() => {
    if (!formData.marca || !formData.modelo || !formData.anio) return;

    async function loadVersiones() {
      const res = await fetch(
        `/api/vehiculos/versiones?marca=${formData.marca}&modelo=${formData.modelo}&anio=${formData.anio}`
      );
      const data: Version[] = await res.json();
      setVersiones(data);
      setFormData((prev) => ({ ...prev, version: "" }));
    }

    loadVersiones();
  }, [formData.marca, formData.modelo, formData.anio]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-linear-120 from-slate-100 to-slate-400 border-0 border-cyan-100 border-t-cyan-500 border-l-cyan-500
      backdrop-blur-sm rounded-2xl p-10 md:min-w-130 min-w-72
      m-10 shadow-[20px_20px_20px_rgba(0,0,0,0.5),-20px_-20px_100px_rgba(255,255,255,0.4)] text-sm
      flex flex-col h-120 relative
      before:content-[''] before:absolute before:w-[120%] before:h-[120%]
      before:border-2 before:border-dashed before:border-[black/80] before:pointer-events-none before:rounded-3xl
      before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2"
    >
      {/* indicadores */}
      <div className="flex justify-center items-center mb-6">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`w-10 h-10 m-2 flex justify-center items-center rounded-full
            ${step >= s ? "bg-cyan-600 text-white" : "bg-cyan-100"}`}
          >
            {s}
          </span>
        ))}
      </div>

      {/* contenido */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        {step === 1 && (
          <>
            <h2>Datos personales</h2>

            <input
              name="name"
              placeholder="Nombre"
              value={formData.name}
              onChange={handleChange}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0"
            />

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2>Datos del vehículo</h2>

            <input
              name="anio"
              placeholder="Año"
              value={formData.anio}
              onChange={handleChange}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0"
            />

            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0"
            >
              <option value="">Seleccionar marca</option>
              {marcas.map((marca, index) => (
                <option key={index} value={marca.codigo}>
                  {marca.desc}
                </option>
              ))}
            </select>

            <select
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              disabled={!modelos.length}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0 disabled:opacity-50 "
            >
              <option value="">Seleccionar modelo</option>
              {modelos.map((modelo,index) => (
                <option key={index} value={modelo} className="text-black">
                  {modelo}
                </option>
              ))}
            </select>

            <select
              name="version"
              value={formData.version}
              onChange={handleChange}
              disabled={!versiones.length}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0 disabled:opacity-50"
            >
              <option value="">Seleccionar versión</option>
              {versiones.map((version) => (
                <option key={version.codigo} value={version.codigo}>
                  {version.desc}
                </option>
              ))}
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Tipo de cobertura</h2>

            <select
              name="cobertura"
              value={formData.cobertura}
              onChange={handleChange}
              className="border-mauve-500 border rounded-xl p-2 bg-mauve-50 w-2xs outline-0"
            >
              <option value="">Seleccionar</option>
              <option value="basic">Responsabilidad civil</option>
              <option value="full">Todo riesgo</option>
            </select>
          </>
        )}
      </div>

      {/* botones */}
      <div className="flex justify-center gap-5 mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="rounded-xl h-10 bg-cyan-700 text-cyan-50 hover:bg-cyan-600 w-30"
          >
            Volver
          </button>
        )}

        {step < 3 && (
          <button
            type="button"
            onClick={nextStep}
            className="rounded-xl h-10 bg-cyan-700 text-cyan-50 hover:bg-cyan-600 w-30"
          >
            Siguiente
          </button>
        )}

        {step === 3 && (
          <button
            type="submit"
            className="rounded-xl h-10 bg-cyan-700 text-cyan-50 hover:bg-cyan-600 w-30"
          >
            Cotizar
          </button>
        )}
      </div>
    </form>
  );
}