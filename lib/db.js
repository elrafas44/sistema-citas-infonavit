import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE
  },
};

export async function conectorSQL() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Error de conexión a SQL Server:', err);
  }
}