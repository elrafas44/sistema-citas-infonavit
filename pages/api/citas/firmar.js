import { generarFirmaDigital } from '../../../lib/crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id, nombre, fecha, hora } = req.body;
  if (!id || !nombre || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos para firmar' });
  }

  const datosParaFirmar = `${id}-${nombre}-${fecha}-${hora}`;
  const sello = generarFirmaDigital(datosParaFirmar);

  return res.status(200).json({ sello });
}