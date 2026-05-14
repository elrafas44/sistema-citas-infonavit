import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Reportes() {
  const [stats, setStats] = useState({ total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 });
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch('/api/get-todas-citas');
        if (res.ok) {
          const citas = await res.json();
          // Calculamos las estadísticas en tiempo real
          const data = {
            total: citas.length,
            pendientes: citas.filter(c => c.estado === 'pendiente' || !c.estado).length,
            aprobadas: citas.filter(c => c.estado === 'aprobada').length,
            rechazadas: citas.filter(c => c.estado === 'rechazada').length,
          };
          setStats(data);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas");
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  // Función para calcular el porcentaje de la barra
  const getPorcentaje = (cantidad) => {
    return stats.total > 0 ? (cantidad / stats.total) * 100 : 0;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="text-[#8A1538] font-bold mb-4 flex items-center hover:underline">
          ← Volver al inicio
        </button>
        
        <h1 className="text-3xl font-bold text-[#8A1538] mb-2">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mb-8">Análisis detallado de la demanda de citas ciudadanas.</p>

        {cargando ? (
          <p className="text-center py-10 animate-pulse">Generando reporte...</p>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* TARJETAS RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Citas" value={stats.total} color="blue" />
              <StatCard label="Pendientes" value={stats.pendientes} color="yellow" />
              <StatCard label="Aprobadas" value={stats.aprobadas} color="green" />
              <StatCard label="Rechazadas" value={stats.rechazadas} color="red" />
            </div>

            {/* GRÁFICA VISUAL (Hecha con CSS) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Distribución de Solicitudes</h3>
              
              <div className="space-y-6">
                <ProgressBar label="Citas Aprobadas" valor={stats.aprobadas} porcentaje={getPorcentaje(stats.aprobadas)} color="bg-green-500" />
                <ProgressBar label="Citas Pendientes" valor={stats.pendientes} porcentaje={getPorcentaje(stats.pendientes)} color="bg-yellow-500" />
                <ProgressBar label="Citas Rechazadas" valor={stats.rechazadas} porcentaje={getPorcentaje(stats.rechazadas)} color="bg-red-500" />
              </div>

              <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-800 text-sm italic">
                    <strong>Dato del sistema:</strong> El trámite con mayor demanda se actualiza según la base de datos en tiempo real.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Sub-componente para las tarjetas de arriba
function StatCard({ label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    yellow: "text-yellow-600 bg-yellow-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50"
  };
  return (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm ${colors[color]}`}>
      <p className="text-xs uppercase font-black opacity-70">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

// Sub-componente para las barras de progreso
function ProgressBar({ label, valor, porcentaje, color }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-500">{valor} ({porcentaje.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${porcentaje}%` }}></div>
      </div>
    </div>
  );
}