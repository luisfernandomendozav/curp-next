# curp-next — Contexto del Proyecto

## ¿Qué es esto?
App Next.js para consulta del padrón electoral INE (CURP/nombre).  
Base de datos: **NeonDB** proyecto `curp-ine-padron` (ID: `small-base-73852243`, org: `org-round-bird-78656106`).

## Estado actual de la migración de datos
Ver **[API_CHANGE.log](./API_CHANGE.log)** para el historial completo de la transferencia de datos y cambios al proyecto.

## Estructura de la DB en Neon
- `estados` — 32 estados (ya cargados)
- `municipios` — 2,457 municipios (ya cargados)
- `personas` — padrón electoral completo (carga en progreso)
  - Columnas: `cve, edad, nombre, paterno, materno, fecnac, sexo, calle, num_int, num_ext, colonia, cp, estado_id, distrito, municipio_id, seccion, localidad, manzana, consec, cred, folio, nac, curp`
  - Índices: `idx_personas_curp`, `idx_personas_nombre`, `idx_personas_estado`

## Fuente de datos
Archivo `data.rar` (9.3 GB comprimido) en la raíz del proyecto.  
Contiene 51 CSVs de padrón organizados por estado + `Estados.csv` y `Municipios.csv` por carpeta.

## Estados pendientes de cargar (al inicio de la sesión — verificar API_CHANGE.log)
GUERRERO, OAXACA (x2), PUEBLA (x2), QUERETARO, QUINTANA ROO, SINALOA,
SAN LUIS POTOSI, SONORA, TABASCO, TAMAULIPAS, TLAXCALA, VERACRUZ (x3),
YUCATAN, ZACATECAS  
**Nota:** Estado de México (EDM1–EDM6) posiblemente incompleto — solo ~4.5M registros cargados, revisar.

## Conexión Neon
Las credenciales están en `.env.local` (nunca commitear).

## ⚠️ Disco casi lleno
Solo ~9 GB libres en `/dev/sda4`. Extraer CSVs de uno en uno y eliminar antes del siguiente.

## Scripts útiles
- Carga incremental: `scripts/load_estado.sh <CARPETA> <ARCHIVO.csv>`
