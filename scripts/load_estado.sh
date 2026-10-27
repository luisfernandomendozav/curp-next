#!/usr/bin/env bash
# Extrae un CSV del RAR, lo carga a Neon, lo elimina.
# Uso: ./scripts/load_estado.sh "GRO/Gro.csv"
# Requiere: unrar, psql, .env.local con DATABASE_URL

set -euo pipefail

RAR="/home/cukaspodolski/Documents/curp-next/data.rar"
TMPDIR="/tmp/curp_import"
LOGFILE="/home/cukaspodolski/Documents/curp-next/API_CHANGE.log"

if [ -z "${1:-}" ]; then
  echo "Uso: $0 <CARPETA/ARCHIVO.csv>"
  echo "Ejemplo: $0 GRO/Gro.csv"
  exit 1
fi

CSV_PATH="$1"
CSV_NAME=$(basename "$CSV_PATH")
mkdir -p "$TMPDIR"

# Cargar DATABASE_URL desde .env.local
if [ -f "$(dirname "$0")/../.env.local" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env.local" | grep DATABASE_URL)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL no definida. Ponla en .env.local o expórtala."
  exit 1
fi

echo "→ Extrayendo $CSV_PATH..."
unrar e "$RAR" "$CSV_PATH" "$TMPDIR/" -y

LOCAL_CSV="$TMPDIR/$CSV_NAME"

if [ ! -f "$LOCAL_CSV" ]; then
  echo "ERROR: No se encontró $LOCAL_CSV tras extracción."
  exit 1
fi

# Ver primera línea para detectar separador y encabezado
HEAD=$(head -1 "$LOCAL_CSV")
echo "→ Primera línea: $HEAD"

echo "→ Cargando $CSV_NAME a Neon..."
BEFORE=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM personas;")

psql "$DATABASE_URL" -c "\COPY personas (cve,edad,nombre,paterno,materno,fecnac,sexo,calle,num_int,num_ext,colonia,cp,estado_id,distrito,municipio_id,seccion,localidad,manzana,consec,cred,folio,nac,curp) FROM '$LOCAL_CSV' WITH (FORMAT csv, HEADER true, DELIMITER '|', ENCODING 'UTF8', NULL '');"

AFTER=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM personas;")
INSERTED=$((AFTER - BEFORE))

echo "→ Insertados: $INSERTED registros (total: $AFTER)"

# Actualizar log
DATE=$(date '+%Y-%m-%d')
sed -i "s|⏳ pendiente.*$CSV_NAME.*|✅ completado|" "$LOGFILE" 2>/dev/null || true

echo "" >> "$LOGFILE"
echo "## [$DATE] Carga: $CSV_PATH" >> "$LOGFILE"
echo "- Registros insertados: $INSERTED" >> "$LOGFILE"
echo "- Total personas en DB: $AFTER" >> "$LOGFILE"

echo "→ Eliminando archivo temporal..."
rm -f "$LOCAL_CSV"

echo "✓ Listo: $CSV_NAME cargado y eliminado."
