import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  
  // Historial de mensajes (inicia con el saludo del bot)
  const [mensajes, setMensajes] = useState([
    { emisor: 'bot', texto: '¡Hola! Soy el Asistente Virtual del Infonavit. ¿En qué puedo ayudarte hoy?' }
  ]);

  // Para que el chat siempre haga scroll hacia abajo automáticamente
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes, escribiendo]);

  // Preguntas predefinidas
  const opciones = [
    { id: 1, pregunta: '¿Cuántos puntos necesito?', respuesta: 'Para solicitar un crédito tradicional necesitas tener un mínimo de 1080 puntos.' },
    { id: 2, pregunta: '¿Qué llevo a mi cita?', respuesta: 'Recuerda llevar tu Identificación Oficial (INE) vigente, tu Número de Seguridad Social (NSS) y el Comprobante de Cita en PDF con tu Código QR.' },
    { id: 3, pregunta: '¿Cómo cancelo una cita?', respuesta: 'Por el momento, si necesitas cancelar o reagendar, por favor comunícate a Infonatel al 800 008 3900.' }
  ];

  const enviarPregunta = (opcion) => {
    // 1. Agregamos la pregunta del usuario al chat
    setMensajes((prev) => [...prev, { emisor: 'usuario', texto: opcion.pregunta }]);
    
    // 2. Simulamos que el bot está escribiendo
    setEscribiendo(true);
    
    // 3. Después de 1.5 segundos, el bot responde
    setTimeout(() => {
      setMensajes((prev) => [...prev, { emisor: 'bot', texto: opcion.respuesta }]);
      setEscribiendo(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Ventana del Chat */}
      {abierto && (
        <div className="bg-white w-80 md:w-96 rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 transition-all animate-fade-in-up">
          
          {/* Encabezado del Chat */}
          <div className="bg-[#8A1538] text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <h3 className="font-bold">Asistente Infonavit</h3>
            </div>
            <button onClick={() => setAbierto(false)} className="text-white hover:text-gray-200 font-bold text-xl">
              &times;
            </button>
          </div>

          {/* Área de Mensajes */}
          <div ref={chatRef} className="p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
            {mensajes.map((msg, index) => (
              <div key={index} className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.emisor === 'usuario' 
                  ? 'bg-[#B38E5D] text-white self-end rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'
              }`}>
                {msg.texto}
              </div>
            ))}
            
            
            {escribiendo && (
              <div className="bg-white border border-gray-200 text-gray-500 self-start p-3 rounded-lg rounded-bl-none shadow-sm text-sm flex space-x-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            )}
          </div>

          {/* Área de Botones (Opciones del usuario) */}
          <div className="p-3 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Elige una opción:</p>
            <div className="flex flex-wrap gap-2">
              {opciones.map((opcion) => (
                <button 
                  key={opcion.id}
                  onClick={() => enviarPregunta(opcion)}
                  disabled={escribiendo}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded-full transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {opcion.pregunta}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante para abrir/cerrar */}
      <button 
        onClick={() => setAbierto(!abierto)}
        className="bg-[#B38E5D] hover:bg-[#96754b] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 absolute right-0 bottom-0"
      >
        {abierto ? '🔽' : '💬'}
      </button>
      
    </div>
  );
}