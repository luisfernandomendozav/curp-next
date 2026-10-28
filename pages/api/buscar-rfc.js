import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { rfc } = req.query;
  if (!rfc || typeof rfc !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro rfc' });
  }

  const rfcClean = rfc.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Los primeros 10 caracteres del RFC coinciden con los primeros 10 de la CURP:
  // 4 letras clave del nombre + 6 dígitos de fecha de nacimiento
  if (rfcClean.length < 10) {
    return res.status(400).json({ error: 'El RFC debe tener al menos 10 caracteres' });
  }

  const base10 = rfcClean.slice(0, 10);

  // Validar formato: 4 letras seguidas de 6 dígitos
  if (!/^[A-Z]{4}[0-9]{6}/.test(base10)) {
    return res.status(400).json({ error: 'Formato inválido. El RFC debe iniciar con 4 letras y 6 dígitos (ej: GUMJ800613)' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
      FROM personas p
      LEFT JOIN estados e ON p.estado_id = e.id
      WHERE p.curp LIKE ${base10 + '%'}
      LIMIT 20
    `;
    res.status(200).json({ base10, resultados: rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}
