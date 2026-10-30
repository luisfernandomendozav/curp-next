import { useState, useEffect, useRef } from 'react';
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

  // CURP/RFC autocomplete search
  const [searchMode, setSearchMode] = useState('curp');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [slowSearch, setSlowSearch] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const searchReqId = useRef(0);
  const slowTimerRef = useRef(null);

  // Nombre search
  const [nombreQ, setNombreQ] = useState('');
  const [paternoQ, setPaternoQ] = useState('');
  const [maternoQ, setMaternoQ] = useState('');
  const [nombreResults, setNombreResults] = useState(null);
  const [nombreLoading, setNombreLoading] = useState(false);
  const [nombreSlow, setNombreSlow] = useState(false);
  const nombreDebounceRef = useRef(null);
  const nombreReqId = useRef(0);
  const nombreSlowTimerRef = useRef(null);

  const r = calcCURP(form);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function formatFecnac(fecnac) {
    if (!fecnac) return '—';
    const [date] = fecnac.split(' ');
    const [mm, dd, yy] = date.split('/');
    const year = parseInt(yy, 10) <= 26 ? '20' + yy : '19' + yy;
    return `${dd}/${mm}/${year}`;
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setSearchLoading(false);
      setSlowSearch(false);
      return;
    }

    setSearchLoading(true);
    setSlowSearch(false);
    slowTimerRef.current = setTimeout(() => setSlowSearch(true), 3000);

    debounceRef.current = setTimeout(async () => {
      const myId = ++searchReqId.current;
      try {
        const endpoint = searchMode === 'curp' ? 'buscar-curp' : 'buscar-rfc';
        const param = searchMode === 'curp' ? 'curp' : 'rfc';
        const res = await fetch(`/api/${endpoint}?${param}=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (myId !== searchReqId.current) return;
        if (res.ok) {
          setSuggestions(data.resultados || []);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        if (myId !== searchReqId.current) return;
        setSuggestions([]);
      } finally {
        if (myId === searchReqId.current) {
          setSearchLoading(false);
          setSlowSearch(false);
          clearTimeout(slowTimerRef.current);
        }
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [searchQuery, searchMode]);

  useEffect(() => {
    function onMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    if (nombreDebounceRef.current) clearTimeout(nombreDebounceRef.current);
    if (nombreSlowTimerRef.current) clearTimeout(nombreSlowTimerRef.current);

    const hasNombre = nombreQ.length >= 2;
    const hasPaterno = paternoQ.length >= 2;
    if (!hasNombre && !hasPaterno) {
      setNombreResults(null);
      setNombreLoading(false);
      setNombreSlow(false);
      return;
    }

    setNombreLoading(true);
    setNombreSlow(false);
    nombreSlowTimerRef.current = setTimeout(() => setNombreSlow(true), 3000);

    nombreDebounceRef.current = setTimeout(async () => {
      const myId = ++nombreReqId.current;
      try {
        const params = new URLSearchParams();
        if (nombreQ) params.set('nombre', nombreQ);
        if (paternoQ) params.set('paterno', paternoQ);
        if (maternoQ) params.set('materno', maternoQ);
        const res = await fetch(`/api/buscar-nombre?${params}`);
        const data = await res.json();
        if (myId !== nombreReqId.current) return;
        setNombreResults(res.ok ? (data.resultados || []) : []);
      } catch {
        if (myId !== nombreReqId.current) return;
        setNombreResults([]);
      } finally {
        if (myId === nombreReqId.current) {
          setNombreLoading(false);
          setNombreSlow(false);
          clearTimeout(nombreSlowTimerRef.current);
        }
      }
    }, 500);

    return () => {
      if (nombreDebounceRef.current) clearTimeout(nombreDebounceRef.current);
      if (nombreSlowTimerRef.current) clearTimeout(nombreSlowTimerRef.current);
    };
  }, [nombreQ, paternoQ, maternoQ]);

  function selectItem(item) {
    setSelectedItem(item);
    setShowDropdown(false);
  }

  function switchMode(mode) {
    setSearchMode(mode);
    setSearchQuery('');
    setSuggestions([]);
    setSelectedItem(null);
    setShowDropdown(false);
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
            <h1>Padrón Electoral · Búsqueda CURP</h1>
            <p>Busca por CURP, RFC o nombre en el padrón electoral</p>
          </div>
        </header>

        <main className={styles.main}>
          {/* 1. Buscar por CURP / RFC */}
          <section className={styles.rfcSection}>
            <h2>Buscar por CURP o RFC</h2>

            <div className={styles.searchTabs}>
              <button
                className={searchMode === 'curp' ? styles.searchTabActive : styles.searchTab}
                onClick={() => switchMode('curp')}
              >
                Por CURP
              </button>
              <button
                className={searchMode === 'rfc' ? styles.searchTabActive : styles.searchTab}
                onClick={() => switchMode('rfc')}
              >
                Por RFC
              </button>
            </div>

            <div className={styles.rfcCoverage}>
              Cobertura: <strong>18 de 32 estados</strong> · ~68M registros
            </div>

            <div className={styles.rfcInputRow}>
              <div className={styles.searchWrapper} ref={wrapperRef}>
                <input
                  className={styles.rfcInput}
                  value={searchQuery}
                  onChange={e => {
                    setSelectedItem(null);
                    setSearchQuery(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  }}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder={searchMode === 'curp' ? 'Ej: GO, GOBO, GOBO800613…' : 'Ej: GO, GUMJ, GUMJ800613…'}
                  maxLength={18}
                  autoComplete="off"
                />

                {searchLoading && searchQuery.length >= 2 && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownLoading}>
                      {slowSearch
                        ? 'La base de datos está despertando, espera unos segundos…'
                        : 'Buscando…'}
                    </div>
                  </div>
                )}

                {!searchLoading && showDropdown && suggestions.length > 0 && (
                  <div className={styles.dropdown}>
                    {suggestions.length === 50 && (
                      <div className={styles.dropdownCount}>
                        Mostrando 50 — escribe más para afinar
                      </div>
                    )}
                    {suggestions.map((item, i) => (
                      <div key={i} className={styles.dropdownItem} onClick={() => selectItem(item)}>
                        <div className={styles.dropdownCurp}>{item.curp}</div>
                        <div className={styles.dropdownName}>
                          {[item.nombre, item.paterno, item.materno].filter(Boolean).join(' ')}
                        </div>
                        <div className={styles.dropdownMeta}>
                          {formatFecnac(item.fecnac)} · {item.sexo === 'H' ? 'Hombre' : item.sexo === 'M' ? 'Mujer' : item.sexo || '—'} · {item.estado || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!searchLoading && showDropdown && searchQuery.length >= 2 && suggestions.length === 0 && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownLoading}>
                      Sin resultados para <strong>{searchQuery}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {searchQuery.length === 1 && (
              <div className={styles.rfcHint}>Ingresa al menos 2 caracteres</div>
            )}

            {selectedItem && (
              <div className={styles.selectedCard}>
                <div className={styles.selectedCurp}>{selectedItem.curp}</div>
                <div className={styles.selectedName}>
                  {[selectedItem.nombre, selectedItem.paterno, selectedItem.materno].filter(Boolean).join(' ')}
                </div>
                <div className={styles.selectedMeta}>
                  <span>Nacimiento: {formatFecnac(selectedItem.fecnac)}</span>
                  <span>{selectedItem.sexo === 'H' ? 'Hombre' : selectedItem.sexo === 'M' ? 'Mujer' : selectedItem.sexo || '—'}</span>
                  <span>{selectedItem.estado || '—'}</span>
                </div>
              </div>
            )}
          </section>

          {/* 2. Buscar por nombre completo */}
          <section className={styles.rfcSection}>
            <h2>Buscar por nombre completo</h2>
            <p className={styles.rfcDesc}>
              Busca por nombre, apellido paterno y/o materno. Mínimo 2 caracteres en cualquier campo para iniciar.
            </p>

            <div className={styles.nombreGrid}>
              <div className={styles.nombreField}>
                <label>Nombre(s)</label>
                <input
                  value={nombreQ}
                  onChange={e => setNombreQ(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                  placeholder="LUIS MIGUEL"
                  autoComplete="off"
                />
              </div>
              <div className={styles.nombreField}>
                <label>Apellido paterno</label>
                <input
                  value={paternoQ}
                  onChange={e => setPaternoQ(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                  placeholder="GONZALEZ"
                  autoComplete="off"
                />
              </div>
              <div className={styles.nombreField}>
                <label>Apellido materno</label>
                <input
                  value={maternoQ}
                  onChange={e => setMaternoQ(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                  placeholder="LOPEZ"
                  autoComplete="off"
                />
              </div>
            </div>

            {nombreLoading && (
              <div className={styles.dropdownLoading} style={{ padding: '12px 0' }}>
                {nombreSlow
                  ? 'La base de datos está despertando, espera unos segundos…'
                  : 'Buscando…'}
              </div>
            )}

            {!nombreLoading && nombreResults !== null && nombreResults.length === 0 && (
              <div className={styles.rfcEmpty}>Sin resultados en los estados cargados.</div>
            )}

            {!nombreLoading && nombreResults && nombreResults.length > 0 && (
              <div className={styles.rfcResults}>
                <div className={styles.rfcCount}>
                  {nombreResults.length} resultado{nombreResults.length !== 1 ? 's' : ''}
                  {nombreResults.length === 50 ? ' (mostrando 50 — agrega más datos para afinar)' : ''}
                </div>
                <div className={styles.rfcTable}>
                  <div className={styles.rfcTableHead}>
                    <span>CURP</span>
                    <span>Nombre completo</span>
                    <span>F. Nac.</span>
                    <span>Sexo</span>
                    <span>Estado</span>
                  </div>
                  {nombreResults.map((p, i) => (
                    <div key={i} className={styles.rfcTableRow}>
                      <span className={styles.curpCell}>{p.curp}</span>
                      <span>{[p.nombre, p.paterno, p.materno].filter(Boolean).join(' ')}</span>
                      <span>{formatFecnac(p.fecnac)}</span>
                      <span>{p.sexo === 'H' ? 'Hombre' : p.sexo === 'M' ? 'Mujer' : p.sexo || '—'}</span>
                      <span>{p.estado || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 3. Calculadora CURP */}
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


        </main>

        <footer className={styles.footer}>
          <p>Los datos no se almacenan ni se envían a ningún servidor · Solo uso educativo</p>
        </footer>
      </div>
    </>
  );
}
