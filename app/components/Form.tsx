"use client";

import { useEffect, useState } from "react";

type Marca = {
  codigo: string;
  desc: string;
};

type Modelo = string;

type Version = {
  codigo: string;
  desc: string;
};

type Localidad = {
  id: number;
  nombre: string;
  provincia: string;
  codigo_postal: number;
};

type VehiculoCotizacion = {
  id: number;
  nombre: string;
  anio: number;
  valor: number;
};

type LocalidadCotizacion = {
  id: number;
  nombre: string;
  provincia: string;
  codigo_postal: number;
};

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
  vehiculo: VehiculoCotizacion;
  localidad: LocalidadCotizacion;
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

type Props = {
  onResultChange: (result: CotizacionResponse | null) => void;
  onFormDataChange: (formData: FormData) => void;
};

export default function Form({ onResultChange, onFormDataChange }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CotizacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [localidadesOptions, setLocalidadessOptions] = useState<Localidad[]>([]);

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
    if (formData.cp.length < 4) {
      setLocalidadessOptions([]);
      return;
    }

    async function loadMunicipios() {
      try {
        const res = await fetch(`/api/vehiculos/localidades?cp=${formData.cp}`);
        const data: Localidad[] = await res.json();
        setLocalidadessOptions(data);
        // Limpiar selección anterior cuando cambia el CP
        setFormData((prev) => ({ ...prev, localidad: "" }));
      } catch (err) {
        console.error("Error cargando localidades:", err);
      }
    }

    const timeoutId = setTimeout(() => loadMunicipios(), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.cp]);

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

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      onFormDataChange(newData);
      return newData;
    });
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Buscar la localidad seleccionada para obtener id y cp
      const localidadSeleccionada = localidadesOptions.find(
        (loc) => loc.id.toString() === formData.localidad
      );

      if (!localidadSeleccionada) {
        throw new Error("Debe seleccionar una localidad");
      }

      const res = await fetch("/api/vehiculos/cotizacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          infoauto: parseInt(formData.version),
          anio: parseInt(formData.anio),
          uso: parseInt(formData.uso),
          gnc: formData.gnc === "true",
          localidad: {
            id: localidadSeleccionada.id,
            codigo_postal: localidadSeleccionada.codigo_postal,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Error al cotizar");
      }

      const data = await res.json();
      setResult(data);
      onResultChange(data);
      onFormDataChange(formData);
    } catch (err) {
      setError("No se pudo obtener la cotización. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-wrapper" onSubmit={handleSubmit}>
      <div className="step-indicators">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`step-indicator ${step >= s ? "active" : "inactive"}`}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="form-content">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {result && !loading && (
          <div className="cotizacion-result">
            <div className="cotizacion-header">
              <h3>Cotización #{result.id}</h3>
              <p className="vehiculo-info">
                {result.vehiculo.nombre} ({result.vehiculo.anio})
              </p>
              <p className="localidad-info">
                {result.localidad.nombre}, {result.localidad.provincia} - CP {result.localidad.codigo_postal}
              </p>
            </div>

            <div className="planes-container">
              <h4>Planes disponibles</h4>
              {result.resultado.map((plan) => (
                <div key={plan.numero} className="plan-card">
                  <div className="plan-header">
                    <span className="plan-titulo">{plan.titulo}</span>
                    <span className="plan-nombre">{plan.texto}</span>
                  </div>
                  <div className="plan-precio">
                    <span className="plan-costo">${plan.costo.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !result && step === 1 && (
          <>
            <h2>Ubicación</h2>

            <input
              name="cp"
              placeholder="Código Postal"
              value={formData.cp}
              onChange={handleChange}
              className="input-field"
            />

            
              <select
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">Seleccionar localidad</option>
                {localidadesOptions.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre} - {loc.provincia}
                  </option>
                ))}
              </select>
            
          </>
        )}

        {!loading && !result && step === 2 && (
          <>
            <h2>Datos del vehículo</h2>

            <input
              name="anio"
              placeholder="Año"
              value={formData.anio}
              onChange={handleChange}
              className="input-field"
            />

            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className="select-field"
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
              className="select-field"
            >
              <option value="">Seleccionar modelo</option>
              {modelos.map((modelo, index) => (
                <option key={index} value={modelo}>
                  {modelo}
                </option>
              ))}
            </select>

            <select
              name="version"
              value={formData.version}
              onChange={handleChange}
              disabled={!versiones.length}
              className="select-field"
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

        {!loading && !result && step === 3 && (
          <>
            <h2>Uso del vehículo</h2>

            <select
              name="uso"
              value={formData.uso}
              onChange={handleChange}
              className="select-field"
            >
              <option value="1">Particular</option>
              <option value="2">Comercial</option>
            </select>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="gnc"
                  checked={formData.gnc === "true"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gnc: e.target.checked ? "true" : "false",
                    }))
                  }
                />
                <span>¿Tiene GNC?</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="form-actions">
        {result && (
          <button
            type="button"
            onClick={() => {
              const resetData = {
                cp: "",
                localidad: "",
                marca: "",
                modelo: "",
                version: "",
                anio: "",
                uso: "1",
                gnc: "false",
              };
              setResult(null);
              setStep(1);
              setFormData(resetData);
              setLocalidadessOptions([]);
              onResultChange(null);
              onFormDataChange(resetData);
            }}
            className="btn"
          >
            Nueva cotización
          </button>
        )}

        {!result && step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="btn"
            disabled={loading}
          >
            Volver
          </button>
        )}

        {!result && step < 3 && (
          <button
            type="button"
            onClick={nextStep}
            className="btn"
            disabled={loading}
          >
            Siguiente
          </button>
        )}

        {!result && step === 3 && (
          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? "Cotizando..." : "Cotizar"}
          </button>
        )}
      </div>
    </form>
  );
}