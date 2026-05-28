import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const [rol, setRol] = useState('');
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  // Advertencia Anti Self-XSS para la consola
  useEffect(() => {
    console.log(
      "%c¡DETENTE!", 
      "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 black;"
    );
    console.log(
      "%cEsta función del navegador está pensada para desarrolladores. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función o 'hackear' tus puntos, se trata de un fraude (ataque Self-XSS) que le dará acceso a tu cuenta del Infonavit.", 
      "font-size: 16px; font-weight: bold;"
    );
  }, []);

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      router.push('/');
      return;
    }

    setRol(localStorage.getItem('usuarioRol') || 'ciudadano');
    setNombre(localStorage.getItem('usuarioNombre') || '');
  }, [router]);

  const cerrarSesion = () => {
    localStorage.clear();
    router.push('/');
  };

  const isActivo = (ruta) => router.pathname === ruta;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {}
      <aside className="w-64 bg-[#8A1538] text-white flex flex-col justify-between shadow-xl z-10 sticky top-0 h-screen">
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-2 text-center">Infonavit</h2>
          <div className="h-1 w-12 bg-[#B38E5D] mx-auto mb-8"></div>

          <nav className="space-y-2">
            <Link href="/inicio">
              <span className={`block py-2 px-4 rounded-r transition-colors cursor-pointer ${
                isActivo('/inicio') ? 'bg-[#6b0f2a] border-l-4 border-[#B38E5D]' : 'border-l-4 border-transparent hover:bg-[#6b0f2a] hover:border-[#B38E5D]'
              }`}>
                🏠 Inicio
              </span>
            </Link>
            
            {rol === 'ciudadano' && (
              <Link href="/mis-citas">
                <span className={`block py-2 px-4 rounded-r transition-colors cursor-pointer ${
                  isActivo('/mis-citas') || isActivo('/agendar') ? 'bg-[#6b0f2a] border-l-4 border-[#B38E5D]' : 'border-l-4 border-transparent hover:bg-[#6b0f2a] hover:border-[#B38E5D]'
                }`}>
                  📅 Mis Citas
                </span>
              </Link>
            )}

            {rol === 'admin' && (
              <Link href="/panel-admin">
                <span className={`block py-2 px-4 rounded-r transition-colors cursor-pointer ${
                  isActivo('/panel-admin') ? 'bg-[#6b0f2a] border-l-4 border-[#B38E5D]' : 'border-l-4 border-transparent hover:bg-[#6b0f2a] hover:border-[#B38E5D]'
                }`}>
                  🗂️ Gestión de Citas
                </span>
              </Link>
            )}

            <Link href="/perfil" legacyBehavior>
              <a className="block py-2 px-4 border-l-4 border-transparent hover:bg-[#6b0f2a] hover:border-[#B38E5D] rounded-r transition-all flex items-center gap-2">
                <span>⚙️</span>
                <span>Ajustes</span>
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-[#6b0f2a]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              {rol === 'admin' ? '🛡️' : '👤'}
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[120px]">{nombre}</p>
              <p className="text-xs text-[#B38E5D] font-medium capitalize">{rol}</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="w-full text-left text-sm text-red-200 hover:text-white transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      
      <main className="flex-1 p-8 text-black overflow-y-auto h-screen">
        {children}
      </main>

      {}
      {rol === 'ciudadano' && <Chatbot />}
    </div>
  );
}