import { conectorSQL } from '../../lib/db';
import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensaje: 'Método no permitido' });
  }

  const origin = req.headers.origin || req.headers.referer;
  const host = req.headers.host;

  if (!origin) {
    return res.status(403).json({ mensaje: 'Acceso denegado: No se detectó el origen de la petición.' });
  }

  const dominioOrigen = origin.replace(/^https?:\/\//, '').split('/')[0];

  if (dominioOrigen !== host) {
    return res.status(403).json({ mensaje: 'Ataque CSRF Detectado: Origen no autorizado.' });
  }

  try {
    const { id, estado } = req.body;

    if (!id || !estado) {
      return res.status(400).json({ mensaje: 'Faltan datos (id o estado)' });
    }

    const pool = await conectorSQL();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('estado', sql.NVarChar(50), estado) 
      .query('UPDATE citas SET estado = @estado WHERE id = @id');

    if (result.rowsAffected[0] > 0) {
      return res.status(200).json({ mensaje: 'Cita actualizada con éxito' });
    } else {
      return res.status(404).json({ mensaje: 'No se encontró la cita con ID ' + id });
    }

  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      mensaje: 'Error en SQL: ' + error.message 
    });
  }
}