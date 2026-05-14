import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  const cargarCitas = async () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;

    try {
      const res = await fetch(`/api/get-citas?usuario_id=${usuarioId}`);
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

  useEffect(() => {
    cargarCitas();
  }, []);

  const cancelarCita = async (id) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    try {
      const res = await fetch('/api/actualizar-cita', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: parseInt(id), 
          estado: 'rechazada' 
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cita cancelada con éxito");
        await cargarCitas();
      } else {
        alert(`Error: ${data.mensaje || 'No se pudo cancelar'}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };

  const generarPDF = async (cita) => {
    const doc = new jsPDF();
    const nombreUsuario = localStorage.getItem('usuarioNombre') || 'Ciudadano';

    doc.setFontSize(22);
    doc.setTextColor(138, 21, 56);
    doc.text('Comprobante de Cita - Infonavit', 105, 20, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(179, 142, 93);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Titular: ${nombreUsuario}`, 20, 40);
    doc.text(`Folio de Cita: #${cita.id}`, 20, 50);
    doc.text(`Trámite: ${cita.motivo || 'General'}`, 20, 60);
    doc.text(`Fecha: ${new Date(cita.fecha).toLocaleDateString()}`, 20, 70);
    doc.text(`Hora: ${cita.hora}`, 20, 80);
    doc.text(`Estado: APROBADA`, 20, 90);

    try {
      const qrData = `Folio: ${cita.id} | Motivo: ${cita.motivo} | Fecha: ${cita.fecha}`;
      const qrImage = await QRCode.toDataURL(qrData);
      doc.addImage(qrImage, 'PNG', 80, 110, 50, 50);
    } catch (err) {
      console.error('Error generando QR', err);
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Presenta este código QR el día de tu cita.', 105, 170, { align: 'center' });

    doc.save(`Cita_${cita.id}.pdf`);
  };

  const obtenerEstado = (estado) => (estado || 'pendiente').toLowerCase();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#8A1538] mb-6">Mis Citas Agendadas</h1>
        
        {cargando ? (
          <p className="text-gray-500 animate-pulse">Consultando base de datos...</p>
        ) : (
          /* Solo mostramos las que NO están rechazadas ni canceladas */
          citas.filter(c => obtenerEstado(c.estado) !== 'rechazada' && obtenerEstado(c.estado) !== 'cancelada').length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-bold text-gray-700">No tienes citas activas</h2>
              <p className="text-gray-500 mt-2 mb-8">Tus citas canceladas o finalizadas no se muestran aquí.</p>
              <button 
                onClick={() => router.push('/agendar')}
                className="bg-[#8A1538] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6b0f2a] transition-all"
              >
                Agendar Nueva Cita
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {citas
                .filter(c => obtenerEstado(c.estado) !== 'rechazada' && obtenerEstado(c.estado) !== 'cancelada')
                .map((cita) => {
                  const estado = obtenerEstado(cita.estado);
                  return (
                    <div key={cita.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{cita.motivo || 'Sin motivo'}</h3>
                        <p className="text-gray-600">📅 {new Date(cita.fecha).toLocaleDateString()} a las 🕒 {cita.hora}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          estado === 'aprobada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {estado}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {estado === 'aprobada' && (
                          <button 
                            onClick={() => generarPDF(cita)}
                            className="bg-[#8A1538] hover:bg-[#6b0f2a] text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center space-x-2 shadow-sm"
                          >
                            <span>📄</span>
                            <span>PDF</span>
                          </button>
                        )}

                        {estado === 'pendiente' && (
                          <button 
                            onClick={() => cancelarCita(cita.id)}
                            className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}
      </div>
    </Layout>
  );
}