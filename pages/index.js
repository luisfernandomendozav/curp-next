import { useState, useCallback } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const STATES = [
  { code: 'AS', name: 'Aguascalientes' },
  { code: 'BC', name: 'Baja California' },
  { code: 'BS', name: 'Baja California Sur' },
  { code: 'CC', name: 'Campeche' },
  { code: 'CS', name: 'Chiapas' },
  { code: 'CH', name: 'Chihuahua' },
  { code: 'DF', name: 'Ciudad de México' },
  { code: 'CL', name: 'Coahuila' },
  { code: 'CM', name: 'Colima' },
  { code: 'DG', name: 'Durango' },
  { code: 'GT', name: 'Guanajuato' },
  { code: 'GR', name: 'Guerrero' },
  { code: 'HG', name: 'Hidalgo' },
  { code: 'JC', name: 'Jalisco' },
  { code: 'MC', name: 'Estado de México' },
  { code: 'MN', name: 'Michoacán' },
  { code: 'MS', name: 'Morelos' },
  { code: 'NT', name: 'Nayarit' },
  { code: 'NL', name: 'Nuevo León' },
  { code: 'OC', name: 'Oaxaca' },
  { code: 'PL', name: 'Puebla' },
  { code: 'QT', name: 'Querétaro' },
  { code: 'QR', name: 'Quintana Roo' },
  { code: 'SP', name: 'San Luis Potosí' },
  { code: 'SL', name: 'Sinaloa' },
  { code: 'SR', name: 'Sonora' },
  { code: 'TC', name: 'Tabasco' },
  { code: 'TS', name: 'Tamaulipas' },
  { code: 'TL', name: 'Tlaxcala' },
  { code: 'VZ', name: 'Veracruz' },
  { code: 'YN', name: 'Yucatán' },
  { code: 'ZS', name: 'Zacatecas' },
  { code: 'NE', name: 'Nacido en el extranjero' },
];

const BAD_WORDS = ['BACA','BAKA','BUEI','BUEY','CACA','CACO','CAGA','CAGO','CAKA','CAKO','COGE','COGI','COJA','COJE','COJI','COJO','COLA','CULO','FALO','FETO','GETA','GUEI','GUEY','JETA','JOTO','KACA','KACO','KAGA','KAGO','KAKA','KAKO','KOGE','KOGI','KOJA','KOJE','KOJI','KOJO','KOLA','KULO','LELO','LOCA','LOCO','LOKA','LOKO','MAME','MAMO','MEAR','MEAS','MEON','MIAR','MION','MOCO','MOKO','MULA','MULO','NACA','NACO','PEDA','PEDO','PENE','PIPI','PITO','POPO','PUTA','PUTO','QULO','RATA','ROBA','ROBE','ROBO','RUIN','SENO','TETA','VACA','VAGA','VAGO','VAKA','VUEI','VUEY','WUEI','WUEY'];

function normalize(str) {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z\s]/g, '');
}

function removeParticles(word) {
  return word.replace(/^(DE LA|DEL|DE LOS|DE LAS|DE|LA|LAS|LOS|Y|EL|MC|MAC|VON|VAN)\s+/i, '').trim();
}

function firstInnerVowel(word) {
  const vowels = 'AEIOU';
  for (let i = 1; i < word.length; i++) {
    if (vowels.includes(word[i])) return word[i];
  }
  return 'X';
}

function firstInnerConsonant(word) {
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  for (let i = 1; i < word.length; i++) {
    if (consonants.includes(word[i]) && word[i] !== 'H') return word[i];
  }
  return 'X';
}

function calcCURP({ nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, estado }) {
  if (!nombre || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento || !sexo || !estado) {
    return null;
  }

  const pat = normalize(removeParticles(apellidoPaterno));
  const mat = normalize(removeParticles(apellidoMaterno));

  // Handle compound names (José, María → use second word)
  const palabras = normalize(nombre).split(/\s+/).filter(Boolean);
  const compuestos = ['JOSE','MARIA','MA','J'];
  const nombreUso = compuestos.includes(palabras[0]) && palabras.length > 1 ? palabras[1] : palabras[0];

  const l1 = pat[0] || 'X';
  const l2 = firstInnerVowel(pat);
  const l3 = mat[0] || 'X';
  const l4 = nombreUso[0] || 'X';
  let aaaa = l1 + l2 + l3 + l4;
  if (BAD_WORDS.includes(aaaa)) aaaa = aaaa[0] + 'X' + aaaa[2] + aaaa[3];

  const fecha = new Date(fechaNacimiento + 'T12:00:00');
  const yy = String(fecha.getFullYear()).slice(-2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = yy + mm + dd;

  const c1 = firstInnerConsonant(pat);
  const c2 = firstInnerConsonant(mat);
  const c3 = firstInnerConsonant(nombreUso);

  const base10 = aaaa + fechaStr;
  const curpBase = aaaa + fechaStr + (sexo === 'H' ? 'H' : 'M') + estado + c1 + c2 + c3;

  return {
    curpBase,
    base10,
    aaaa,
    l1: { v: l1, d: `1ª letra del ap. paterno — ${pat}` },
    l2: { v: l2, d: `1ª vocal interior del ap. paterno — ${pat}` },
    l3: { v: l3, d: `1ª letra del ap. materno — ${mat}` },
    l4: { v: l4, d: `1ª letra del nombre — ${nombreUso}` },
    fecha: fechaStr,
    genero: sexo === 'H' ? 'H' : 'M',
    estado,
    consonantes: c1 + c2 + c3,
    c1: { v: c1, d: `1ª consonante interior del ap. paterno — ${pat}` },
    c2: { v: c2, d: `1ª consonante interior del ap. materno — ${mat}` },
    c3: { v: c3, d: `1ª consonante interior del nombre — ${nombreUso}` },
  };
}

export default function Home() {
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', sexo: '', estado: '' });
  const [showAudio, setShowAudio] = useState(false);
  const [searchMode, setSearchMode] = useState('curp');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const r = calcCURP(form);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const buscar = useCallback(async () => {
    if (searchQuery.length < 2) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const endpoint = searchMode === 'curp' ? 'buscar-curp' : 'buscar-rfc';
      const param = searchMode === 'curp' ? 'curp' : 'rfc';
      const res = await fetch(`/api/${endpoint}?${param}=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error || 'Error en la búsqueda'); return; }
      setSearchResult(data);
    } catch {
      setSearchError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, searchMode]);

  function switchMode(mode) {
    setSearchMode(mode);
    setSearchQuery('');
    setSearchResult(null);
    setSearchError('');
  }

  return (
    <>
      <Head>
        <title>Calculadora de CURP</title>
        <meta name="description" content="Genera y comprende tu CURP mexicano" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h1>Calculadora de CURP</h1>
            <p>Genera tu clave y entiende cómo se construye</p>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Form */}
            <section className={styles.card}>
              <h2>Datos personales</h2>
              <div className={styles.form}>
                <label className={styles.field}>
                  <span>Nombre(s)</span>
                  <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Omar" autoComplete="off" />
                </label>
                <label className={styles.field}>
                  <span>Primer apellido (paterno)</span>
                  <input name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} placeholder="Ej: González" autoComplete="off" />
                </label>
                <label className={styles.field}>
                  <span>Segundo apellido (materno)</span>
                  <input name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} placeholder="Ej: Beltrán" autoComplete="off" />
                </label>
                <label className={styles.field}>
                  <span>Fecha de nacimiento</span>
                  <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Sexo</span>
                  <select name="sexo" value={form.sexo} onChange={handleChange}>
                    <option value="">Seleccionar…</option>
                    <option value="H">Hombre</option>
                    <option value="M">Mujer</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Estado de nacimiento</span>
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="">Seleccionar…</option>
                    {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </label>
              </div>
            </section>

            {/* Result */}
            <section className={styles.card}>
              <h2>Resultado</h2>
              {r ? (
                <div className={styles.result}>
                  <div className={styles.curpDisplay}>
                    <div className={styles.curpRow}>
                      <span className={styles.seg1} title="Letras clave del nombre">{r.aaaa}</span>
                      <span className={styles.seg2} title="Fecha de nacimiento">{r.fecha}</span>
                      <span className={styles.seg3} title="Sexo">{r.genero}</span>
                      <span className={styles.seg4} title="Estado">{r.estado}</span>
                      <span className={styles.seg5} title="Consonantes">{r.consonantes}</span>
                      <span className={styles.seg6} title="Dígito verificador">?</span>
                    </div>
                    <div className={styles.segLabels}>
                      <span>Nombre</span>
                      <span>Fecha</span>
                      <span>Sexo</span>
                      <span>Edo.</span>
                      <span>Cons.</span>
                      <span>Ver.</span>
                    </div>
                  </div>

                  <div className={styles.base10Box}>
                    <div className={styles.base10Label}>Primeros 10 caracteres compartidos con RFC:</div>
                    <div className={styles.base10Value}>{r.base10}</div>
                    <div className={styles.base10Hint}>Úsalos para cruzar registros en el IMSS (IDSE/SIPARE)</div>
                  </div>

                  <div className={styles.breakdown}>
                    <h3>Desglose caracter por caracter</h3>
                    <table>
                      <tbody>
                        {[r.l1, r.l2, r.l3, r.l4].map((x, i) => (
                          <tr key={i}>
                            <td className={styles.charCell}>{x.v}</td>
                            <td>{x.d}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className={styles.charCell}>{r.fecha}</td>
                          <td>Fecha de nacimiento (AAMMDD)</td>
                        </tr>
                        <tr>
                          <td className={styles.charCell}>{r.genero}</td>
                          <td>Sexo registrado al nacer</td>
                        </tr>
                        <tr>
                          <td className={styles.charCell}>{r.estado}</td>
                          <td>Estado de nacimiento</td>
                        </tr>
                        {[r.c1, r.c2, r.c3].map((x, i) => (
                          <tr key={i}>
                            <td className={styles.charCell}>{x.v}</td>
                            <td>{x.d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>📋</div>
                  <p>Ingresa tus datos para ver tu CURP generado al instante</p>
                </div>
              )}
            </section>
          </div>

          {/* Búsqueda en el Padrón */}
          <section className={styles.rfcSection}>
            <h2>Buscar en el Padrón Electoral</h2>

            <div className={styles.searchTabs}>
              <button
                className={searchMode === 'curp' ? styles.searchTabActive : styles.searchTab}
                onClick={() => switchMode('curp')}
              >
                Buscar por CURP
              </button>
              <button
                className={searchMode === 'rfc' ? styles.searchTabActive : styles.searchTab}
                onClick={() => switchMode('rfc')}
              >
                Buscar por RFC
              </button>
            </div>

            {searchMode === 'curp' ? (
              <p className={styles.rfcDesc}>
                Ingresa los primeros caracteres de la CURP para buscar en el padrón.
                Con 2 caracteres ya obtienes resultados; entre más completa, más precisa la búsqueda.
              </p>
            ) : (
              <p className={styles.rfcDesc}>
                Los primeros 10 caracteres del RFC son idénticos a los primeros 10 de la CURP
                (4 letras del nombre + 6 dígitos de fecha). Con 2 caracteres ya obtienes resultados;
                con 10 o más el filtro es muy preciso.
              </p>
            )}

            <div className={styles.rfcCoverage}>
              Cobertura actual: <strong>18 de 32 estados</strong> cargados · ~68M registros
            </div>

            <div className={styles.rfcInputRow}>
              <input
                className={styles.rfcInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder={searchMode === 'curp' ? 'Ej: GO o GOBO800613HGTXXX8' : 'Ej: GO o GUMJ800613SI5'}
                maxLength={18}
                autoComplete="off"
              />
              <button
                className={styles.rfcBtn}
                onClick={buscar}
                disabled={searchLoading || searchQuery.length < 2}
              >
                {searchLoading ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            {searchQuery.length === 1 && (
              <div className={styles.rfcHint}>Ingresa al menos 2 caracteres (1 restante)</div>
            )}

            {searchError && (
              <div className={styles.rfcError}>{searchError}</div>
            )}

            {searchResult && (
              <div className={styles.rfcBase10}>
                Buscando CURPs que inician con: <code>{searchResult.base10 || searchResult.prefijo}</code>
              </div>
            )}

            {searchResult && searchResult.resultados.length === 0 && (
              <div className={styles.rfcEmpty}>
                No se encontraron registros con el prefijo <strong>{searchResult.base10 || searchResult.prefijo}</strong> en los estados actualmente cargados.
                <br />Puede que la persona sea de un estado aún no disponible (GRO, OAX, PUE, QRO, QROO, SIN, SLP, SON, TAB, TAM, TLX, VER, YUC, ZAC).
              </div>
            )}

            {searchResult && searchResult.resultados.length > 0 && (
              <div className={styles.rfcResults}>
                <div className={styles.rfcCount}>
                  {searchResult.resultados.length} resultado{searchResult.resultados.length !== 1 ? 's' : ''} encontrado{searchResult.resultados.length !== 1 ? 's' : ''}
                  {searchResult.resultados.length === 50 ? ' (mostrando primeros 50 — ingresa más caracteres para afinar)' : ''}
                </div>
                <div className={styles.rfcTable}>
                  <div className={styles.rfcTableHead}>
                    <span>CURP</span>
                    <span>Nombre completo</span>
                    <span>F. Nac.</span>
                    <span>Sexo</span>
                    <span>Estado</span>
                  </div>
                  {searchResult.resultados.map((p, i) => (
                    <div key={i} className={styles.rfcTableRow}>
                      <span className={styles.curpCell}>{p.curp}</span>
                      <span>{[p.nombre, p.paterno, p.materno].filter(Boolean).join(' ')}</span>
                      <span>{p.fecnac ? p.fecnac.split(' ')[0] : '—'}</span>
                      <span>{p.sexo === 'H' ? 'Hombre' : p.sexo === 'M' ? 'Mujer' : p.sexo || '—'}</span>
                      <span>{p.estado || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Info Section */}
          <section className={styles.infoSection}>
            <h2>¿Cómo funciona la búsqueda con los primeros 10 caracteres?</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <strong>4 letras clave del nombre</strong>
                  <p>Se construyen con tu primer apellido (1ª letra + 1ª vocal interior), segundo apellido (1ª letra) y nombre (1ª letra). Ejemplo: González Beltrán Omar → <code>GOBO</code></p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <strong>6 dígitos de fecha</strong>
                  <p>Año, mes y día de nacimiento en formato AAMMDD. Ejemplo: 13 de junio de 1971 → <code>710613</code></p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <strong>La clave base <code>GOBO710613</code></strong>
                  <p>Es idéntica en CURP y RFC. Con ella puedes filtrar en bases como IMSS para encontrar o verificar un CURP sin necesidad de la clave completa.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>4</div>
                <div>
                  <strong>Afinar por estado</strong>
                  <p>Si dos personas comparten nombre y fecha de nacimiento, el estado de nacimiento diferencia sus CURPs. Es estadísticamente muy poco probable coincidir en todo.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Audio transcription */}
          <section className={styles.audioSection}>
            <button className={styles.toggleBtn} onClick={() => setShowAudio(!showAudio)}>
              {showAudio ? '▲ Ocultar' : '▼ Ver'} transcripción del audio original
            </button>
            {showAudio && (
              <blockquote className={styles.transcription}>
                <p>
                  &ldquo;Si tú quieres sacar tu CURP y ves tu RFC, los primeros 8 caracteres son iguales —
                  son las 2 letras de tu primer apellido y lo del nombre. González Beltrán Omar es <strong>GOBO</strong>,
                  por ejemplo: Go de González, B de Beltrán, O de Omar. Y si buscas el RFC, el CURP empieza igual:
                  <strong> GOBO710613</strong>. Entonces, si filtro con el RFC tomando únicamente los primeros 8 caracteres,
                  puedo buscar en la base del IMSS y sacar qué CURP se llama igual que Omar González.
                  Si alguien se llama igual y nació el mismo día, por lógica va a ser tú. Con el IMSS y con el RFC,
                  de ahí tienes el CURP. La otra forma es cruzar los 8 dígitos con la base del CURP que aparece en el IMSS,
                  hacerlo con la terminación de hombre o mujer, y corriéndolo por estado.
                  Hay un González Beltrán o Marantonio que nació el 13 de junio del 71 —
                  no creo que haya otro en Sonora.&rdquo;
                </p>
              </blockquote>
            )}
          </section>
        </main>

        <footer className={styles.footer}>
          <p>Los datos no se almacenan ni se envían a ningún servidor · Solo uso educativo</p>
        </footer>
      </div>
    </>
  );
}
