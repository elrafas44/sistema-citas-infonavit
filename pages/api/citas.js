import { conectorSQL } from '../../lib/db';
import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const origin = req.headers.origin || req.headers.referer;
  const host = req.headers.host;

  if (!origin) {
    return res.status(403).json({ error: 'Acceso denegado: No se detectó el origen de la petición.' });
  }

  const dominioOrigen = origin.replace(/^https?:\/\//, '').split('/')[0];

  if (dominioOrigen !== host) {
    return res.status(403).json({ error: 'Ataque CSRF Detectado: Origen no autorizado.' });
  }

  const { motivo, fecha, hora, usuario_id } = req.body;

  try {
    const pool = await conectorSQL();

    const checkCita = await pool.request()
      .input('u_id', sql.Int, usuario_id)
      .query(`
        SELECT id FROM citas 
        WHERE usuario_id = @u_id 
        AND (estado = 'pendiente' OR estado = 'aprobada')
        AND fecha >= CAST(GETDATE() AS DATE)
      `);

    if (checkCita.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'Ya tienes una cita activa. Debes asistir a ella o esperar a que pase para agendar otra.' 
      });
    }

    await pool.request()
      .input('motivo', sql.VarChar, motivo)
      .input('fecha', sql.Date, fecha)
      .input('hora', sql.VarChar, hora)
      .input('u_id', sql.Int, usuario_id)
      .query("INSERT INTO citas (motivo, fecha, hora, usuario_id, estado) VALUES (@motivo, @fecha, @hora, @u_id, 'pendiente')");

    res.status(200).json({ message: 'Cita agendada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}