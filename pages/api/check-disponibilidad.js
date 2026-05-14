import { conectorSQL } from '../../lib/db';
import sql from 'mssql';

export default async function handler(req, res) {
  const { fecha } = req.query;

  try {
    const pool = await conectorSQL();
    const result = await pool.request()
      .input('fecha', sql.Date, fecha)
      // Solo traemos las citas que NO han sido rechazadas
      .query("SELECT CAST(hora AS VARCHAR(5)) as hora FROM citas WHERE fecha = @fecha AND estado != 'rechazada'");

    const horasOcupadas = result.recordset.map(r => r.hora);
    res.status(200).json(horasOcupadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}