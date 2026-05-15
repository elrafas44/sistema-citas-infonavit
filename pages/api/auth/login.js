import { conectorSQL } from '../../../lib/db';
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
      }

      const pool = await conectorSQL();
      
      // Consultamos al usuario para ver si existe
      const result = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT * FROM usuarios WHERE correo = @correo');

      const user = result.recordset[0];

      // Si no existe el usuario
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Comparamos la contraseña enviada con la guardada en la base de datos
      const passwordValida = await bcrypt.compare(password, user.password);

      if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Creamos el Token JWT con los datos del usuario
      const token = jwt.sign(
        { id: user.id, rol: user.rol, nombre: user.nombre },
        process.env.JWT_SECRET || 'secreto_de_desarrollo',
        { expiresIn: '24h' } 
      );

      // Respondemos con el Token y la información
      return res.status(200).json({
        mensaje: `Bienvenido, ${user.nombre}`,
        token,
        usuario: {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
          puntos: user.puntos_infonavit
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}