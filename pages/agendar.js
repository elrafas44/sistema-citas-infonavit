import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function AgendarCita() {
  const router = useRouter();
  const [tramite, setTramite] = useState('');
  const [otroTramite, setOtroTramite] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [horasBloqueadas, setHorasBloqueadas] = useState([]);
  const [tieneCitaActiva, setTieneCitaActiva] = useState(false);
  const [cargandoValidacion, setCargandoValidacion] = useState(true);

  const horariosDisponibles = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  useEffect(() => {
    const uId = localStorage.getItem('usuarioId');
    if (uId) {
      setUsuarioId(uId);
      verificarCitaExistente(uId);
    }
  }, []);

  // Función para evitar que el usuario agende doble
  const verificarCitaExistente = async (id) => {
    try {
      const res = await fetch(`/api/get-citas?usuario_id=${id}`);
      if (res.ok) {
        const citas = await res.json();
        
        // Obtenemos la fecha de hoy en hora LOCAL a prueba de fallos
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        const hoyString = `${year}-${month}-${day}`;

        const activa = citas.some(c => {
          // Comparamos estados activos
          const esEstadoActivo = c.estado === 'pendiente' || c.estado === 'aprobada';
          // Comparamos si la fecha es hoy o futura
          const esFutura = c.fecha >= hoyString;
          
          return esEstadoActivo && esFutura;
        });

        setTieneCitaActiva(activa);
      }
    } catch (error) {
      console.error("Error validando cita activa");
    } finally {
      setCargandoValidacion(false);
    }
  };

  // Validación de fines de semana y carga de horas ocupadas
  useEffect(() => {
    if (fecha) {
      const selectedDate = new Date(fecha);
      const diaSemana = selectedDate.getUTCDay();

      if (diaSemana === 0 || diaSemana === 6) {
        alert("El Infonavit no labora fines de semana. Por favor elige un día de lunes a viernes.");
        setFecha('');
        setHorasBloqueadas([]);
        return;
      }

      const fetchDisponibilidad = async () => {
        try {
          const res = await fetch(`/api/check-disponibilidad?fecha=${fecha}`);
          if (res.ok) {
            const data = await res.json();
            setHorasBloqueadas(data);
          }
        } catch (error) {
          console.error("Error al consultar disponibilidad");
        }
      };
      fetchDisponibilidad();
    }
  }, [fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const motivoFinal = tramite === 'Otros' ? otroTramite : tramite;

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          motivo: motivoFinal, 
          fecha, 
          hora, 
          usuario_id: usuarioId 
        }),
      });

      if (res.ok) {
        alert('¡Cita agendada con éxito!');
        router.push('/mis-citas');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al agendar');
      }
    } catch (error) {
      alert('Error de conexión.');
    }
  };

  if (cargandoValidacion) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500 animate-pulse">Validando estado de cuenta...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex justify-center items-start pt-4">
        {tieneCitaActiva ? (
          // VISTA CUANDO YA TIENE CITA
          <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 border-t-8 border-yellow-500 text-center">
            <div className="text-5xl mb-4">🗓️</div>
            <h2 className="text-2xl font-bold text-gray-800">Ya tienes una cita activa</h2>
            <p className="text-gray-600 mt-4">
              Por políticas del Infonavit, solo puedes tener una cita pendiente o aprobada a la vez. 
              Por favor, asiste a tu cita actual o espera a que concluya para agendar una nueva.
            </p>
            <button 
              onClick={() => router.push('/mis-citas')}
              className="mt-8 bg-[#8A1538] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6b0f2a] transition-all shadow-lg"
            >
              Ver mis citas actuales
            </button>
          </div>
        ) : (
          // FORMULARIO NORMAL
          <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 border-t-8 border-[#8A1538]">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#8A1538] mb-2">Agendar Cita</h1>
              <p className="text-[#545454]">Selecciona el trámite y horario de tu preferencia.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#545454] mb-1">Motivo de Trámite</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#8A1538] bg-white text-black"
                  value={tramite}
                  onChange={(e) => {
                    setTramite(e.target.value);
                    if (e.target.value !== 'Otros') setOtroTramite('');
                  }}
                >
                  <option value="" disabled>Selecciona un trámite...</option>
                  <option value="Solicitud de Crédito">Solicitud de Crédito</option>
                  <option value="Precalificación y Puntos">Precalificación y Puntos</option>
                  <option value="Devolución de Subcuenta">Devolución de Subcuenta</option>
                  <option value="Corrección de RFC / CURP">Corrección de RFC / CURP</option>
                  <option value="Aclaración de Pagos">Aclaración de Pagos</option>
                  <option value="Borrón y Cuenta Nueva">Borrón y Cuenta Nueva</option>
                  <option value="Otros">Otros (Especificar)</option>
                </select>
              </div>

              {tramite === 'Otros' && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-bold text-[#545454] mb-1">Especifica tu trámite</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-black"
                    value={otroTramite}
                    onChange={(e) => setOtroTramite(e.target.value)}
                    placeholder="Ej. Inscripción de taller Saber para decidir..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#545454] mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  // Usamos 'en-CA' para forzar el formato YYYY-MM-DD en hora local
                  min={new Date().toLocaleDateString('en-CA')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#8A1538] text-black"
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHora('');
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#545454] mb-3">Horarios Disponibles</label>
                {!fecha ? (
                  <p className="text-sm text-gray-400 italic">Por favor, selecciona una fecha primero.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {horariosDisponibles.map((h) => {
                      const estaOcupado = horasBloqueadas.includes(h);
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={estaOcupado}
                          onClick={() => setHora(h)}
                          className={`py-2 text-xs font-bold rounded border transition-all ${
                            estaOcupado 
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                              : hora === h
                                ? 'bg-[#8A1538] text-white border-[#8A1538] shadow-md'
                                : 'bg-green-50 text-green-700 border-green-200 hover:border-green-500'
                          }`}
                        >
                          {h}
                          <div className="text-[9px] uppercase">{estaOcupado ? 'Ocupado' : 'Libre'}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!hora || (tramite === 'Otros' && !otroTramite)}
                className="w-full py-3 px-4 text-white font-bold rounded-full bg-[#8A1538] hover:bg-[#6b0f2a] transition-colors shadow-md disabled:opacity-50"
              >
                Confirmar Cita {hora && `para las ${hora}`}
              </button>
            </form>
          </div>
        )}
      </main>
    </Layout>
  );
}