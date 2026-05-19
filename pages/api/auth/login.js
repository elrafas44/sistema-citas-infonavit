import { conectorSQL } from '../../../lib/db';
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
      }

      const pool = await conectorSQL();
      
      const result = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT * FROM usuarios WHERE correo = @correo');

      const user = result.recordset[0];

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const passwordValida = await bcrypt.compare(password, user.password);

      if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const token = jwt.sign(
        { id: user.id, rol: user.rol, nombre: user.nombre },
        process.env.JWT_SECRET || 'secreto_de_desarrollo',
        { expiresIn: '24h' } 
      );

      const cookieSerializada = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      res.setHeader('Set-Cookie', cookieSerializada);

      return res.status(200).json({
        mensaje: `Bienvenido, ${user.nombre}`,
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