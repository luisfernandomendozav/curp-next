import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { nombre = '', paterno = '', materno = '' } = req.query;
  const n = nombre.toUpperCase().trim();
  const p = paterno.toUpperCase().trim();
  const m = materno.toUpperCase().trim();

  if (n.length < 2 && p.length < 2) {
    return res.status(400).json({ error: 'Ingresa al menos nombre o apellido paterno (mínimo 2 caracteres)' });
  }

  const base = `
    SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
    FROM personas p
    LEFT JOIN estados e ON p.estado_id = e.id
  `;

  try {
    const sql = neon(process.env.DATABASE_URL);
    let rows;

    if (n && p && m) {
      rows = await sql`
        SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
        FROM personas p LEFT JOIN estados e ON p.estado_id = e.id
        WHERE p.nombre LIKE ${n + '%'} AND p.paterno LIKE ${p + '%'} AND p.materno LIKE ${m + '%'}
        ORDER BY p.curp LIMIT 50
      `;
    } else if (n && p) {
      rows = await sql`
        SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
        FROM personas p LEFT JOIN estados e ON p.estado_id = e.id
        WHERE p.nombre LIKE ${n + '%'} AND p.paterno LIKE ${p + '%'}
        ORDER BY p.curp LIMIT 50
      `;
    } else if (n && m) {
      rows = await sql`
        SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
        FROM personas p LEFT JOIN estados e ON p.estado_id = e.id
        WHERE p.nombre LIKE ${n + '%'} AND p.materno LIKE ${m + '%'}
        ORDER BY p.curp LIMIT 50
      `;
    } else if (n) {
      rows = await sql`
        SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
        FROM personas p LEFT JOIN estados e ON p.estado_id = e.id
        WHERE p.nombre LIKE ${n + '%'}
        ORDER BY p.curp LIMIT 50
      `;
    } else {
      rows = await sql`
        SELECT DISTINCT ON (p.curp) p.curp, p.nombre, p.paterno, p.materno, p.fecnac, p.sexo, e.nombre AS estado
        FROM personas p LEFT JOIN estados e ON p.estado_id = e.id
        WHERE p.paterno LIKE ${p + '%'}
        ORDER BY p.curp LIMIT 50
      `;
    }

    res.status(200).json({ resultados: rows });
  } catch (err) {
    console.error('DB error buscar-nombre:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos', detalle: err.message });
  }
}
