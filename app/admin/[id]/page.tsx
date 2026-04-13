"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type CotizacionResultado = {
  numero: number | null;
  puntaje: number;
  producto: string;
  texto: string;
  titulo: string;
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
  codigo_producto: number;
};

type CotizacionDetail = {
  id: number;
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
  };
  suma_asegurada: number;
  comision: number;
  bonificacion: number;
  resultado: CotizacionResultado[];
  fecha_cotizacion: string;
};

export default function CotizacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<CotizacionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCotizacion() {
      try {
        const res = await fetch(`/api/cotizaciones/${id}`);
        if (!res.ok) throw new Error("Error al cargar cotización");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("No se pudo cargar la cotización");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCotizacion();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="admin-container">
        <div className="admin-loading">Cargando cotización...</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="admin-container">
        <p className="admin-error">{error || "Cotización no encontrada"}</p>
        <Link href="/admin" className="btn-back">
          Volver al listado
        </Link>
      </main>
    );
  }

  // Ordenar resultados: A, B, B0, B1, B3, M BASICA, M PLUS
  const ordenProducto: Record<string, number> = {
    "A": 1,
    "B": 2,
    "B0": 3,
    "B1": 4,
    "B3": 5,
    "M BASICA": 6,
    "M PLUS": 7,
  };

  const resultadosOrdenados = [...data.resultado].sort((a, b) => {
    const ordenA = ordenProducto[a.titulo] || 999;
    const ordenB = ordenProducto[b.titulo] || 999;
    return ordenA - ordenB;
  });

  // Calcular el total de todos los productos
  const totalGeneral = resultadosOrdenados.reduce((sum, r) => sum + r.costo, 0);

  return (
    <main className="admin-container">
      <header className="admin-header">
        <h1>Cotización #{data.id}</h1>
        <Link href="/admin" className="btn-back">
          Volver
        </Link>
      </header>

      {/* Info del vehículo y localidad */}
      <section className="detail-section">
        <div className="detail-card">
          <h2>Vehículo</h2>
          <p className="detail-item">
            <strong>Nombre:</strong> {data.vehiculo.nombre}
          </p>
          <p className="detail-item">
            <strong>Año:</strong> {data.vehiculo.anio}
          </p>
          <p className="detail-item">
            <strong>Valor:</strong> ${data.vehiculo.valor.toLocaleString("es-AR")}
          </p>
          <p className="detail-item">
            <strong>Uso:</strong> {data.vehiculo.uso === 1 ? "Particular" : data.vehiculo.uso}
          </p>
          {data.vehiculo.gnc && (
            <p className="detail-item">
              <strong>GNL/GNC:</strong> Sí
            </p>
          )}
        </div>

        <div className="detail-card">
          <h2>Ubicación</h2>
          <p className="detail-item">
            <strong>Localidad:</strong> {data.localidad.nombre}
          </p>
          <p className="detail-item">
            <strong>Provincia:</strong> {data.localidad.provincia}
          </p>
          <p className="detail-item">
            <strong>CP:</strong> {data.localidad.codigo_postal}
          </p>
        </div>

        <div className="detail-card">
          <h2>Seguro</h2>
          <p className="detail-item">
            <strong>Suma Asegurada:</strong> ${data.suma_asegurada.toLocaleString("es-AR")}
          </p>
          <p className="detail-item">
            <strong>Comisión:</strong> {data.comision}%
          </p>
          <p className="detail-item">
            <strong>Bonificación:</strong> {data.bonificacion}%
          </p>
          <p className="detail-item">
            <strong>Fecha:</strong>{" "}
            {new Date(data.fecha_cotizacion).toLocaleString("es-AR")}
          </p>
        </div>
      </section>

      {/* Resultados */}
      <section className="resultados-section">
        <h2>
          Opciones de Seguro ({data.resultado.length}) — Total:{" "}
          <span className="total-price">
            ${totalGeneral.toLocaleString("es-AR")}
          </span>
        </h2>

        <div className="resultados-grid">
          {resultadosOrdenados.map((r, idx) => (
            <div key={idx} className="resultado-card">
              <div className="resultado-header">
                <h3>{r.titulo}</h3>
                <span className="resultado-codigo">#{r.codigo_producto}</span>
              </div>
              <p className="resultado-desc">{r.texto}</p>
              <div className="resultado-precio">
                <span className="label">Premio:</span>
                <span className="value">${r.costo.toLocaleString("es-AR")}</span>
              </div>
              <div className="resultado-cuota">
                <span className="label">Cuota única:</span>
                <span className="value">
                  ${r.desglose.total.premio.toLocaleString("es-AR")}
                </span>
              </div>
              {r.error && <p className="resultado-error">{r.error}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}