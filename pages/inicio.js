import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Inicio() {
  const [rol, setRol] = useState('');
  const [nombre, setNombre] = useState('');
  const [puntos, setPuntos] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const usuarioRol = localStorage.getItem('usuarioRol');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioId = localStorage.getItem('usuarioId');

    setRol(usuarioRol);
    setNombre(usuarioNombre);

    if (usuarioRol === 'ciudadano' && usuarioId) {
      const cargarPuntos = async () => {
        try {
          const res = await fetch(`/api/get-puntos?id=${usuarioId}`);
          const data = await res.json();
          if (res.ok) setPuntos(data.puntos);
        } catch (error) {
          console.error("Error al cargar puntos");
        }
      };
      cargarPuntos();
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8A1538]">Hola, {nombre}</h1>
          <p className="text-[#545454] mt-2">Bienvenido a tu portal {rol === 'admin' ? 'de administración' : 'ciudadano'}</p>
          <div className="h-1 w-20 bg-[#B38E5D] mt-2"></div>
        </div>

        {rol === 'ciudadano' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Tus Puntos Infonavit</h2>
                <p className="text-gray-500 text-sm">Puntos necesarios para precalificar: 1080</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#8A1538]">{puntos}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase mt-2 inline-block ${puntos >= 1080 ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                  {puntos >= 1080 ? 'Precalificado' : 'Aún te falta'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => router.push('/agendar')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#8A1538] transition-all flex flex-col items-center justify-center space-y-4 group">
                <span className="text-5xl group-hover:scale-110 transition-transform">📝</span>
                <span className="font-bold text-[#8A1538] text-lg">Agendar Nueva Cita</span>
              </button>
              <button onClick={() => router.push('/mis-citas')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#8A1538] transition-all flex flex-col items-center justify-center space-y-4 group">
                <span className="text-5xl group-hover:scale-110 transition-transform">📅</span>
                <span className="font-bold text-[#8A1538] text-lg">Consultar Mis Citas</span>
              </button>
            </div>
          </div>
        )}

        {rol === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => router.push('/reportes')} 
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-blue-400 transition-all group"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="font-bold text-lg text-gray-800">Reportes Generales</h3>
                <p className="text-sm text-gray-500 mt-2">Estadísticas de atención</p>
              </button>
            <button onClick={() => router.push('/panel-admin')} className="bg-[#8A1538] rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center text-white hover:bg-[#6b0f2a] transition-colors md:col-span-2 group">
               <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">🗂️</span>
               <h3 className="font-bold text-2xl">Ir al Panel de Citas</h3>
               <p className="text-sm text-red-200 mt-2 font-medium">Gestionar solicitudes pendientes de ciudadanos</p>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}