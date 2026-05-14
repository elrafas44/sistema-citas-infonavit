import { conectorSQL } from '../../lib/db';
import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Falta el ID del usuario' });

  try {
    const pool = await conectorSQL();
    
    // Solo traemos la columna de puntos de ese usuario específico
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT puntos_infonavit FROM usuarios WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ puntos: result.recordset[0].puntos_infonavit });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar puntos' });
  }
}