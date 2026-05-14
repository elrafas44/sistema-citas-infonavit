import { conectorSQL } from '../../lib/db';

export default async function handler(req, res) {
  
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const pool = await conectorSQL();
    
    
    const result = await pool.request().query(`
      SELECT 
        c.id, 
        u.nombre AS ciudadano, 
        c.fecha, 
        c.hora, 
        c.motivo, 
        c.estado 
      FROM citas c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.fecha ASC, c.hora ASC
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}