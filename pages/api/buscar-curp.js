import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { curp } = req.query;
  if (!curp || typeof curp !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro curp' });
  }

  const curpClean = curp.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (curpClean.length < 2) {
    return res.status(400).json({ error: 'Ingresa al menos 2 caracteres' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
      FROM personas p
      LEFT JOIN estados e ON p.estado_id = e.id
      WHERE p.curp LIKE ${curpClean + '%'}
      LIMIT 50
    `;
    res.status(200).json({ prefijo: curpClean, resultados: rows });
  } catch (err) {
    console.error('DB error buscar-curp:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos', detalle: err.message });
  }
}
