"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type CotizacionItem = {
  id: number;
  rama: number;
  bien: string;
  ubicacion: string;
  fecha: string;
  subrama: number;
};

type CotizacionesResponse = {
  usuario: string;
  offset: number;
  limit: number;
  total: number;
  datos: CotizacionItem[];
  numitems: number;
};

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
  const [data, setData] = useState<CotizacionesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchVehiculo, setSearchVehiculo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchCotizaciones() {
      try {
        const res = await fetch("/api/cotizaciones");
        if (!res.ok) throw new Error("Error al cargar cotizaciones");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("No se pudieron cargar las cotizaciones");
      } finally {
        setLoading(false);
      }
    }

    fetchCotizaciones();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch (e) {
      // ignora errores
    }
    window.location.href = "/login";
  };

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchId, searchVehiculo]);

  // Filtrar cotizaciones
  const cotizacionesFiltradas = useMemo(() => {
    const items = data?.datos || [];
    
    if (!searchId && !searchVehiculo) {
      return items;
    }

    return items.filter((cot) => {
      const matchId = searchId 
        ? String(cot.id).includes(searchId.trim())
        : true;
      
      const matchVehiculo = searchVehiculo
        ? cot.bien.toLowerCase().includes(searchVehiculo.toLowerCase().trim())
        : true;

      return matchId && matchVehiculo;
    });
  }, [data, searchId, searchVehiculo]);

  // Paginación
  const totalPages = Math.ceil(cotizacionesFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const cotizacionesPaginadas = cotizacionesFiltradas.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <main className="admin-container">
        <div className="admin-loading">Cargando cotizaciones...</div>
      </main>
    );
  }

  return (
    <main className="admin-container">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="logout-button">
          Cerrar sesión
        </button>
      </header>

      {error && <p className="admin-error">{error}</p>}

      {/* Buscador */}
      <div className="search-box">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Buscar por ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="search-field"
          />
          <input
            type="text"
            placeholder="Buscar por vehículo..."
            value={searchVehiculo}
            onChange={(e) => setSearchVehiculo(e.target.value)}
            className="search-field"
          />
        </div>
      </div>

      <section className="cotizaciones-list">
        <h2>
          Cotizaciones 
          {!searchId && !searchVehiculo && <span className="list-count"> — {data?.total} total</span>}
        </h2>
        
        {cotizacionesFiltradas.length === 0 ? (
          <p className="no-data">No hay cotizaciones que coincidan con la búsqueda</p>
        ) : (
          <>
            <table className="cotizaciones-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Vehículo</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesPaginadas.map((cot) => (
                  <tr key={cot.id}>
                    <td>{cot.id}</td>
                    <td>{new Date(cot.fecha).toLocaleDateString("es-AR")}</td>
                    <td>{cot.bien}</td>
                    <td>{cot.ubicacion}</td>
                    <td>
                      <Link href={`/admin/${cot.id}`} className="btn-view">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}