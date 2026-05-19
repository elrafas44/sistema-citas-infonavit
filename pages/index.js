import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        
        localStorage.setItem('usuarioNombre', data.usuario.nombre);
        localStorage.setItem('usuarioId', data.usuario.id); 
        localStorage.setItem('usuarioRol', data.usuario.rol); 
        localStorage.setItem('usuarioPuntos', data.usuario.puntos); 
        
        router.push('/inicio');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      
      {/* Tarjeta principal con borde superior rojo institucional */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border-t-8 border-[#8A1538]">
        
        {/* Título de la App */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8A1538] mb-2">Infonavit</h1>
          {/* Línea dorada decorativa */}
          <div className="h-1 w-16 bg-[#B38E5D] mx-auto mb-4"></div>
          <p className="text-[#545454] font-medium text-lg">Portal de Gestión de Citas</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-[#8A1538] text-[#8A1538] p-4 mb-6 text-sm font-medium">
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#545454] mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent text-black transition-all"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="rafael@infonavit.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#545454] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent text-black transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white font-bold rounded-full bg-[#8A1538] hover:bg-[#6b0f2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A1538] transition-colors duration-200 shadow-md"
          >
            Mi Cuenta Infonavit
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-[#8A1538] hover:underline font-medium">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

      </div>
    </div>
  );
}
