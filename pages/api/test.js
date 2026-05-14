import { poolPromise } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Establecemos la conexión
    const pool = await poolPromise;
    
    
    const result = await pool.request().query('SELECT 1 AS validacion');

    // Si funciona, devolvemos un mensaje de éxito
    res.status(200).json({ 
      mensaje: '¡Conexión a SQL Server súper exitosa!', 
      resultado: result.recordset 
    });
    
  } catch (error) {
    // Si falla, mostramos el error exacto
    console.error('Error de BD:', error);
    res.status(500).json({ 
      error: 'Falló la conexión a la base de datos', 
      detalle: error.message 
    });
  }
}