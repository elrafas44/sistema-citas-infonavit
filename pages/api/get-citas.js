import { conectorSQL } from '../../lib/db';
import sql from 'mssql';

export default async function handler(req, res) {
  const { usuario_id } = req.query;

  try {
    const pool = await conectorSQL();
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .query(`
        SELECT 
          id, 
          fecha, -- La mandamos normal
          CAST(hora AS VARCHAR(5)) as hora, 
          motivo, 
          estado 
        FROM citas 
        WHERE usuario_id = @usuario_id 
        ORDER BY fecha ASC
      `);

    // Antes de enviar, nos aseguramos que la fecha sea solo YYYY-MM-DD
    const citasFormateadas = result.recordset.map(cita => ({
      ...cita,
      fecha: new Date(cita.fecha).toISOString().split('T')[0]
    }));

    res.status(200).json(citasFormateadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}