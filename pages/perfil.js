import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Perfil() {
  const [usuario, setUsuario] = useState({ nombre: '', rol: '', id: '' });
  const router = useRouter();

  useEffect(() => {
    setUsuario({
      nombre: localStorage.getItem('usuarioNombre') || 'Usuario',
      rol: localStorage.getItem('usuarioRol') || 'ciudadano',
      id: localStorage.getItem('usuarioId') || '0000'
    });
  }, []);

  const cerrarSesion = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#8A1538] mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#8A1538] p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-inner">
               👤
            </div>
            <h2 className="text-white text-2xl font-bold mt-4">{usuario.nombre}</h2>
            <p className="text-red-100 uppercase text-xs font-black tracking-widest">{usuario.rol}</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">ID de Usuario:</span>
              <span className="text-gray-800 font-bold">#{usuario.id}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Institución:</span>
              <span className="text-gray-800 font-bold">Infonavit Nacional</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500 font-medium">Estado de cuenta:</span>
              <span className="text-green-600 font-bold">Activo</span>
            </div>

            <button 
              onClick={cerrarSesion}
              className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
            >
              Cerrar Sesión Segura
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          Versión del Portal: 1.0.4 - Desarrollo Rafael Rolón
        </p>
      </div>
    </Layout>
  );
}