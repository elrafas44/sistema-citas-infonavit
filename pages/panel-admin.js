import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function PanelAdmin() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para búsqueda, filtro y la NUEVA VISTA de Pestañas
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [vista, setVista] = useState('proximas'); // 'proximas' o 'historial'

  useEffect(() => {
    const cargarTodasLasCitas = async () => {
      try {
        const res = await fetch('/api/get-todas-citas'); 
        if (res.ok) {
          const data = await res.json();
          setCitas(data || []);
        }
      } catch (error) {
        console.error('Error al cargar citas');
      } finally {
        setCargando(false);
      }
    };

    cargarTodasLasCitas();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch('/api/actualizar-cita', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });

      if (res.ok) {
        setCitas(citas.map(cita => 
          cita.id === id ? { ...cita, estado: nuevoEstado } : cita
        ));
      } else {
        alert('Hubo un error al actualizar la cita.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const fechaCorta = typeof fechaStr === 'string' ? fechaStr.split('T')[0] : new Date(fechaStr).toISOString().split('T')[0];
    const [year, month, day] = fechaCorta.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    if (typeof horaStr === 'string' && horaStr.includes('T')) {
      return horaStr.split('T')[1].substring(0, 5);
    }
    return String(horaStr).substring(0, 5);
  };

  
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const hoyString = `${year}-${month}-${day}`;

  
  const citasFiltradas = citas.filter((cita) => {
    const coincideBusqueda = 
      cita.id.toString().includes(busqueda) || 
      (cita.motivo && cita.motivo.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideEstado = filtroEstado === 'todos' || cita.estado === filtroEstado;
    
    
    let coincideVista = true; 
    if (cita.fecha) {
      const fechaCita = typeof cita.fecha === 'string' ? cita.fecha.split('T')[0] : new Date(cita.fecha).toISOString().split('T')[0];
      
      if (vista === 'proximas') {
        // Solo mostramos si la cita es HOY o en el FUTURO
        coincideVista = fechaCita >= hoyString;
      }
      // Si la vista es 'historial', coincideVista se queda en true para mostrar TODAS
    }

    return coincideBusqueda && coincideEstado && coincideVista;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8A1538]">Panel de Administración</h1>
            <p className="text-gray-600 mt-1">Gestiona las solicitudes de citas de los ciudadanos</p>
          </div>
          
          {/* --- PESTAÑAS PARA CAMBIAR ENTRE PRÓXIMAS E HISTORIAL --- */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setVista('proximas')}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                vista === 'proximas' 
                  ? 'bg-white text-[#8A1538] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Citas Próximas
            </button>
            <button
              onClick={() => setVista('historial')}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                vista === 'historial' 
                  ? 'bg-white text-[#8A1538] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🗄️ Historial Completo
            </button>
          </div>
        </div>

        {/* --- Buscador y Filtros --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por Folio o Trámite..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A1538] focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A1538] focus:border-transparent outline-none bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="aprobada">Solo Aprobadas</option>
              <option value="rechazada">Solo Rechazadas</option>
            </select>
          </div>
        </div>

        {/* --- TABLA DE RESULTADOS --- */}
        {cargando ? (
          <div className="flex justify-center py-12">
             <p className="text-gray-500 animate-pulse font-medium">Cargando base de datos...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider border-b border-gray-200">
                  <th className="p-4 font-bold">Folio</th>
                  <th className="p-4 font-bold">Trámite</th>
                  <th className="p-4 font-bold">Fecha y Hora</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.length > 0 ? (
                  citasFiltradas.map((cita) => (
                    <tr key={cita.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">#{cita.id}</td>
                      <td className="p-4 text-gray-700">{cita.motivo}</td>
                      <td className="p-4 text-gray-700 font-medium">
                        {formatearFecha(cita.fecha)} a las {formatearHora(cita.hora)} hrs
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          cita.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                          cita.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {cita.estado || 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2 flex justify-center">
                        {cita.estado !== 'aprobada' && (
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'aprobada')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                          >
                            Aprobar
                          </button>
                        )}
                        {cita.estado !== 'rechazada' && (
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'rechazada')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                          >
                            Rechazar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="text-4xl mb-2">🍃</div>
                      <p className="text-gray-500 font-medium text-lg">
                        {vista === 'proximas' 
                          ? 'No hay citas próximas pendientes. Todo está al día.' 
                          : 'No se encontraron citas en el historial con esos filtros.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}