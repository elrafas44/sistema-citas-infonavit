import { conectorSQL } from '../../../lib/db';
import sql from 'mssql';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { nombre, correo, password } = req.body;

      if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      }

      const pool = await conectorSQL();

      // 1. Verificamos que el correo no exista ya
      const checkUser = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT id FROM usuarios WHERE correo = @correo');

      if (checkUser.recordset.length > 0) {
        return res.status(400).json({ error: 'El correo ya está registrado.' });
      }

      // 2. Encriptamos la contraseña por seguridad
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 3. Insertamos al nuevo ciudadano con sus puntos iniciales
      await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('correo', sql.NVarChar, correo)
        .input('password', sql.NVarChar, hashedPassword)
        .input('rol', sql.NVarChar, 'ciudadano')
        .input('puntos', sql.Int, 1080)
        .query(`
          INSERT INTO usuarios (nombre, correo, password, rol, puntos_infonavit)
          VALUES (@nombre, @correo, @password, @rol, @puntos)
        `);

      return res.status(201).json({ mensaje: '¡Ciudadano creado con éxito!' });

    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({ error: 'Error al registrar usuario.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}