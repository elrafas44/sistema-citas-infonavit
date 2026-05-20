import crypto from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'claveSuperSeguraDe32Caracteres!!';
const IV_LENGTH = 16;

export function encriptarDato(texto) {
  if (!texto) return null;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  
  let encrypted = cipher.update(texto);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}


export function generarHashIntegridad(texto) {
  if (!texto) return null;
  return crypto.createHash('sha256').update(texto).digest('hex');
}
export function generarFirmaDigital(datosCita) {
  if (!datosCita) return null;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(datosCita);
  
  return hmac.digest('hex').substring(0, 32).toUpperCase();
}