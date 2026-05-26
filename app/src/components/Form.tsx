"use client";

import { useEffect, useRef, useState } from "react";
import { DomainLocalidad, DomainMarca, NormalizedQuoteResult, ProviderField } from "@/lib/types/domain";
import Image from "next/image";

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
  onResultChange: (result: { quotes: NormalizedQuoteResult[]; errors: any[] } | null) => void;
  onFormDataChange: (formData: FormData) => void;
};

const HANDLED_FIELDS = ["infoauto", "uso", "gnc", "localidadId", "localidad", "marca", "modelo", "version", "anio", "cp"];

export default function Form({ onResultChange, onFormDataChange }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ quotes: NormalizedQuoteResult[]; errors: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [providerFields, setProviderFields] = useState<ProviderField[]>([]);
  const [extraFields, setExtraFields] = useState<ProviderField[]>([]);
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});

  const [marcas, setMarcas] = useState<DomainMarca[]>([]);
  const [marcasError, setMarcasError] = useState<string | null>(null);
  const [modelos, setModelos] = useState<DomainMarca[]>([]);
  const [modelosError, setModelosError] = useState<string | null>(null);
  const [versiones, setVersiones] = useState<DomainMarca[]>([]);
  const [versionesError, setVersionesError] = useState<string | null>(null);
  const [localidadesOptions, setLocalidadesOptions] = useState<DomainLocalidad[]>([]);
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
    async function loadProviderFields() {
      const res = await fetch("/api/providers/fields");
      const data = await res.json();
      const fields: ProviderField[] = data.mergedFields || [];
      setProviderFields(fields);
      setExtraFields(fields.filter((f) => !HANDLED_FIELDS.includes(f.id)));
    }
    loadProviderFields();
  }, []);

  useEffect(() => {
    async function loadMarcas() {
      try {
        const res = await fetch("/api/vehiculos/marcas");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error HTTP ${res.status}`);
        }
        const data = await res.json();
        setMarcas(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("Error cargando marcas:", msg);
        setMarcasError(msg);
      }
    }
    loadMarcas();
  }, []);

  useEffect(() => {
    if (!formData.marca || !formData.anio) return;
    async function loadModelos() {
      try {
        const res = await fetch(`/api/vehiculos/modelos?marca=${formData.marca}&anio=${formData.anio}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log("[Form] modelos response:", JSON.stringify(data).slice(0, 3000));
        setModelos(data);
        setModelosError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("Error cargando modelos:", msg);
        setModelosError(msg);
      }
      setVersiones([]);
      setVersionesError(null);
      setFormData((prev) => ({ ...prev, modelo: "", version: "" }));
    }
    loadModelos();
  }, [formData.marca, formData.anio]);

  useEffect(() => {
    if (formData.cp.length < 4) {
      setLocalidadesOptions([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/vehiculos/localidades?cp=${formData.cp}`);
        const data: DomainLocalidad[] = await res.json();
        setLocalidadesOptions(data);
        setFormData((prev) => ({ ...prev, localidad: "" }));
      } catch (err) {
        console.error("Error cargando localidades:", err);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.cp]);

  useEffect(() => {
    if (!formData.marca || !formData.modelo || !formData.anio) return;
    async function loadVersiones() {
      try {
        const res = await fetch(`/api/vehiculos/versiones?marca=${formData.marca}&modelo=${formData.modelo}&anio=${formData.anio}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error HTTP ${res.status}`);
        }
        const data = await res.json();
        setVersiones(data);
        setVersionesError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("Error cargando versiones:", msg);
        setVersionesError(msg);
      }
      setFormData((prev) => ({ ...prev, version: "" }));
    }
    loadVersiones();
  }, [formData.marca, formData.modelo, formData.anio]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onFormDataChange(newData);
  }

  function handleExtraChange(fieldId: string, value: string) {
    setExtraValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, extraFields.length > 0 ? 4 : 3));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const localidadSeleccionada = localidadesOptions.find((loc) => loc.id.toString() === formData.localidad);
      if (!localidadSeleccionada) throw new Error("Debe seleccionar una localidad");

      const res = await fetch("/api/vehiculos/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          infoauto: parseInt(formData.version),
          anio: parseInt(formData.anio),
          uso: parseInt(formData.uso),
          gnc: formData.gnc === "true",
          localidad: {
            id: localidadSeleccionada.id,
            codigo_postal: localidadSeleccionada.zipCode,
          },
          providerSpecificFields: {
            ...extraValues,
            localidadId: localidadSeleccionada.id,
            codigoPostal: localidadSeleccionada.zipCode,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al cotizar");
      const data = await res.json();
      setResult(data);
      onResultChange(data);
      onFormDataChange(formData);
    } catch (err: any) {
      setError(err.message || "No se pudo obtener la cotización");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function renderExtraField(field: ProviderField) {
    return (
      <div key={field.id} className="form-field">
        <label>{field.label}</label>
        {field.type === "select" && field.options ? (
          <select
            value={extraValues[field.id] || ""}
            onChange={(e) => handleExtraChange(field.id, e.target.value)}
            className="select-field"
          >
            <option value="">Seleccionar...</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === "boolean" ? (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={extraValues[field.id] === "true"}
              onChange={(e) => handleExtraChange(field.id, e.target.checked ? "true" : "false")}
            />
            <span>{field.label}</span>
          </label>
        ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={extraValues[field.id] || ""}
            onChange={(e) => handleExtraChange(field.id, e.target.value)}
            className="input-field"
          />
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} className="form-wrapper" onSubmit={handleSubmit}>
      <div className="step-indicators">
        {[1, 2, 3, ...(extraFields.length > 0 ? [4] : [])].map((s) => (
          <span key={s} className={`step-indicator ${step >= s ? "active" : "inactive"}`}>{s}</span>
        ))}
      </div>

      <div className="form-content">
        {loading && <div className="loading"><div className="spinner"></div></div>}
        {error && <div className="error-message">{error}</div>}

        {result && !loading && (
          <div className="cotizacion-result">
            {result.errors?.length > 0 && (
              <div className="error-message">
                {result.errors.map((err, i) => (
                  <div key={i}>{err.provider}: {err.error}</div>
                ))}
              </div>
            )}
            <a
              href="https://wa.me/5493406518069?text=Quiero%20bonificar%20el%20seguro%20de%20mi%20auto%20contratando%20un%20seguro%20hogar"
              target="_blank"
              rel="noopener noreferrer"
              className="hogar-card"
            >
              <div className="hogar-image-wrapper">
                <Image src="/familia.webp" alt="Familia" fill className="hogar-image" />
              </div>
              <div className="hogar-text">
                <p>Hacé click acá y bonificá el seguro de tu auto contratando un seguro de Hogar</p>
              </div>
            </a>
            <div className="planes-container">
              <h4>Planes disponibles</h4>
              {result.quotes.map((q, i) => (
                <div key={i} className="plan-card">
                  <div className="plan-header">
                    <span className="plan-titulo">{q.productName}</span>
                    {/* <span className="plan-nombre">{q.providerName}</span> */}
                    {q.coverageDetails.texto && (
                      <span className="plan-nombre">{q.coverageDetails.texto}</span>
                    )}
                  </div>
                  <div className="plan-precio">
                    <div className="plan-costo">${q.premium.toLocaleString("es-AR")}</div>
                    {q.installments.map((inst, j) => (
                      <div key={j} className="plan-nombre">{inst.count} cuota{inst.count > 1 ? 's' : ''} de ${inst.amount.toLocaleString("es-AR")}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !result && step === 1 && (
          <>
            <h2>Ubicación</h2>
            <input name="cp" placeholder="Código Postal" value={formData.cp} onChange={handleChange} className="input-field" />
            <select name="localidad" value={formData.localidad} onChange={handleChange} className="select-field">
              <option value="">Seleccionar localidad</option>
              {localidadesOptions.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} - {loc.province}</option>
              ))}
            </select>
          </>
        )}

        {!loading && !result && step === 2 && (
          <>
            <h2>Datos del vehículo</h2>
            <input name="anio" placeholder="Año" value={formData.anio} onChange={handleChange} className="input-field" />
            <select name="marca" value={formData.marca} onChange={handleChange} className="select-field">
              <option key="placeholder-marca" value="">Seleccionar marca</option>
              {marcas.length === 0 && !marcasError && (
                <option key="loading-marca" value="" disabled>Cargando marcas...</option>
              )}
              {marcasError && (
                <option key="error-marca" value="" disabled>Error al cargar marcas</option>
              )}
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {marcasError && (
              <p className="error-message" style={{ color: "red", fontSize: "0.8rem" }}>{marcasError}</p>
            )}
            <select name="modelo" value={formData.modelo} onChange={handleChange} className="select-field">
              <option key="placeholder-modelo" value="">Seleccionar modelo</option>
              {!formData.marca && (
                <option key="hint-modelo" value="" disabled>Primero seleccioná una marca</option>
              )}
              {modelos.length === 0 && formData.marca && !modelosError && (
                <option key="loading-modelo" value="" disabled>Cargando modelos...</option>
              )}
              {modelosError && (
                <option key="error-modelo" value="" disabled>Error al cargar modelos</option>
              )}
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {modelosError && (
              <p className="error-message" style={{ color: "red", fontSize: "0.8rem" }}>{modelosError}</p>
            )}
            <select name="version" value={formData.version} onChange={handleChange} className="select-field">
              <option key="placeholder-version" value="">Seleccionar versión</option>
              {!formData.modelo && (
                <option key="hint-version" value="" disabled>Primero seleccioná un modelo</option>
              )}
              {versiones.length === 0 && formData.modelo && !versionesError && (
                <option key="loading-version" value="" disabled>Cargando versiones...</option>
              )}
              {versionesError && (
                <option key="error-version" value="" disabled>Error al cargar versiones</option>
              )}
              {versiones.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {versionesError && (
              <p className="error-message" style={{ color: "red", fontSize: "0.8rem" }}>{versionesError}</p>
            )}
          </>
        )}

        {!loading && !result && step === 3 && (
          <>
            <h2>Uso del vehículo</h2>
            <select name="uso" value={formData.uso} onChange={handleChange} className="select-field">
              <option value="1">Particular</option>
              <option value="2">Comercial</option>
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="gnc"
                checked={formData.gnc === "true"}
                onChange={(e) => setFormData((prev) => ({ ...prev, gnc: e.target.checked ? "true" : "false" }))}
              />
              <span>¿Tiene GNC?</span>
            </label>
          </>
        )}

        {!loading && !result && step === 4 && extraFields.length > 0 && (
          <>
            <h2>Datos adicionales para aseguradoras</h2>
            {extraFields.map(renderExtraField)}
          </>
        )}
      </div>

      <div className="form-actions">
        {result && (
          <button type="button" onClick={() => {
            setResult(null);
            setStep(1);
            setFormData({ cp: "", localidad: "", marca: "", modelo: "", version: "", anio: "", uso: "1", gnc: "false" });
            setLocalidadesOptions([]);
            setExtraValues({});
            onResultChange(null);
          }} className="btn">Nueva cotización</button>
        )}
        {!result && step > 1 && <button type="button" onClick={prevStep} className="btn" disabled={loading}>Volver</button>}
        {!result && step < (extraFields.length > 0 ? 4 : 3) && (
          <button type="button" onClick={nextStep} className="btn" disabled={loading}>Siguiente</button>
        )}
        {!result && step === (extraFields.length > 0 ? 4 : 3) && (
          <button type="button" onClick={() => setShowModal(true)} className="btn" disabled={loading}>{loading ? "Cotizando..." : "Cotizar"}</button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Image src="/chica.webp" alt="Mujer" width={100} height={100} className="chica"/>
            <h3 className="modal-title">Estás a un paso de tu cotización</h3>

            <p className="modal-message">
              Recordá que si necesitás aplicar más descuentos o buscás una cobertura que no aparece, podés escribirnos y lo revisamos personalmente.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowModal(false)} className="btn ">Cancelar</button>
              <button type="button" onClick={() => { setShowModal(false); formRef.current?.requestSubmit(); }} className="btn">Cotizar</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
