import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { rfc } = req.query;
  if (!rfc || typeof rfc !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro rfc' });
  }

  const rfcClean = rfc.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (rfcClean.length < 2) {
    return res.status(400).json({ error: 'Ingresa al menos 2 caracteres' });
  }

  // Con >=10 chars validar formato RFC y usar los primeros 10 como prefijo de CURP.
  // Con <10 chars usar como prefijo directo.
  let prefix;
  let base10 = null;

  if (rfcClean.length >= 10) {
    base10 = rfcClean.slice(0, 10);
    if (!/^[A-Z]{4}[0-9]{6}/.test(base10)) {
      return res.status(400).json({ error: 'Formato inválido. El RFC debe iniciar con 4 letras y 6 dígitos (ej: GUMJ800613)' });
    }
    prefix = base10;
  } else {
    prefix = rfcClean;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
      FROM personas p
      LEFT JOIN estados e ON p.estado_id = e.id
      WHERE p.curp LIKE ${prefix + '%'}
      ORDER BY p.curp
      LIMIT 50
    `;
    res.status(200).json({ base10: base10 || prefix, prefijo: prefix, resultados: rows });
  } catch (err) {
    console.error('DB error buscar-rfc:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos', detalle: err.message });
  }
}
