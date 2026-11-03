/* =========================================================
   CONSTELLATION — Cálculo del puntaje
   ---------------------------------------------------------
   Este archivo no dibuja nada. Solo sabe:
     1. Leer y guardar los datos del mes (en el navegador).
     2. Convertir cada resultado en puntos, usando los tramos
        de constellation-data.js.
     3. Sumar el total y darle un nivel y un color.
     4. Traer datos de Comet (tickets) y de Mission Control
        (atención y TMO).

   Las páginas (constellation.js) usan estas funciones.
   ========================================================= */


/* =========================================================
   1. AGENTES Y FORMATOS
   ========================================================= */

const agentePorId = id => CONSTELLATION.agentes.find(a => a.id === id);
const nombreDeAgente = id => (agentePorId(id) || { nombre: id }).nombre;

function formatoNumero(numero, decimales = 1) {
  return numero.toFixed(decimales).replace('.', ',');
}

/* 154 -> "2:34" */
function formatoTmo(segundos) {
  const total = Math.round(segundos);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function promedioDe(numeros) {
  return numeros.length ? numeros.reduce((a, b) => a + b, 0) / numeros.length : 0;
}


/* =========================================================
   2. DATOS DEL MES
   El mes actual se guarda en localStorage porque se puede
   editar (cargar evaluaciones, traer de Comet...). El mes
   anterior está cerrado y se lee directo de los ejemplos.
   ========================================================= */

const CLAVE_MES = 'constellation-mes-actual';

function armarMesDeEjemplo() {
  const agentes = {};
  Object.entries(CONSTELLATION.mesActual).forEach(([id, datos]) => {
    agentes[id] = {
      tickets: { ...datos.ticketsBase },
      atencion: datos.atencion,
      tmoSeg: datos.tmoSeg,
      calidad: [...datos.calidad],
      ventas: datos.ventas,
      retenciones: datos.retenciones,
      listaCompleta: datos.listaCompleta
    };
  });
  return { agentes, traidoDeComet: null, traidoDeMission: null };
}

function leerMesActual() {
  try {
    const guardado = localStorage.getItem(CLAVE_MES);
    if (guardado) return JSON.parse(guardado);
  } catch (error) { /* sin localStorage: usamos el ejemplo */ }
  return armarMesDeEjemplo();
}

function guardarMesActual(mes) {
  try { localStorage.setItem(CLAVE_MES, JSON.stringify(mes)); } catch (error) { /* no se pudo guardar */ }
}

function restaurarDatosDeEjemplo() {
  try { localStorage.removeItem(CLAVE_MES); } catch (error) { /* nada que borrar */ }
}

/* Datos de todos los agentes para 'actual' o 'anterior'. */
function datosDelMes(cualMes) {
  return cualMes === 'anterior' ? CONSTELLATION.mesAnterior : leerMesActual().agentes;
}

/* Cambia los datos de un agente del mes actual y guarda. */
function actualizarAgente(idAgente, cambio) {
  const mes = leerMesActual();
  cambio(mes.agentes[idAgente]);
  guardarMesActual(mes);
}


/* =========================================================
   3. DE RESULTADO A PUNTOS
   ========================================================= */

const buscarComponente = id => CONSTELLATION.componentes.find(c => c.id === id);

/* Busca el primer tramo que cumple el valor y devuelve sus puntos. */
function puntosSegunTramos(valor, componente) {
  const tramo = componente.tramos.find(t =>
    componente.mayorEsMejor ? valor >= t.desde : valor <= t.hasta
  );
  return tramo ? tramo.puntos : 0;
}

/* Para cada componente: qué valor tiene el agente, cuántos
   puntos le corresponden y un texto que explica de dónde salen. */
function calcularComponente(componente, datos) {
  switch (componente.id) {

    case 'tickets': {
      const { resueltos, enSla } = datos.tickets;
      if (!resueltos) return { valor: null, puntos: 0, detalle: 'Sin tickets resueltos' };
      const porcentaje = (enSla / resueltos) * 100;
      return { valor: porcentaje, puntos: puntosSegunTramos(porcentaje, componente),
        detalle: `${enSla} de ${resueltos} tickets en SLA (${formatoNumero(porcentaje)}%)` };
    }

    case 'atencion':
      return { valor: datos.atencion, puntos: puntosSegunTramos(datos.atencion, componente),
        detalle: `${formatoNumero(datos.atencion)}% de llamadas atendidas` };

    case 'calidad': {
      if (!datos.calidad.length) return { valor: null, puntos: 0, detalle: 'Sin evaluaciones este mes' };
      const promedio = promedioDe(datos.calidad);
      return { valor: promedio, puntos: puntosSegunTramos(promedio, componente),
        detalle: `Promedio ${formatoNumero(promedio)} en ${datos.calidad.length} evaluaciones` };
    }

    case 'ventas': {
      const cerradas = datos.ventas + datos.retenciones;
      const bonus = datos.listaCompleta ? componente.bonusListaCompleta : 0;
      const puntos = Math.min(componente.max, puntosSegunTramos(cerradas, componente) + bonus);
      return { valor: cerradas, puntos,
        detalle: `${datos.ventas} ventas + ${datos.retenciones} retenciones${bonus ? ` · lista completa (+${bonus})` : ''}` };
    }

    case 'tmo':
      return { valor: datos.tmoSeg, puntos: puntosSegunTramos(datos.tmoSeg, componente),
        detalle: `TMO ${formatoTmo(datos.tmoSeg)}` };

    default:
      return { valor: null, puntos: 0, detalle: '' };
  }
}


/* =========================================================
   4. TOTAL, NIVEL Y SEMÁFORO
   ========================================================= */

function nivelSegunTotal(total) {
  return CONSTELLATION.niveles.find(nivel => total >= nivel.desde);
}

function colorSegunTotal(total) {
  if (total >= CONSTELLATION.semaforo.verde) return 'var(--ox-ok)';
  if (total >= CONSTELLATION.semaforo.amarillo) return 'var(--ox-warn)';
  return 'var(--ox-danger)';
}

/* Puntaje completo de un agente. */
function calcularPuntaje(datos) {
  const componentes = CONSTELLATION.componentes.map(componente => ({
    componente,
    ...calcularComponente(componente, datos)
  }));
  const total = componentes.reduce((suma, c) => suma + c.puntos, 0);

  const alertas = [];
  const tmo = buscarComponente('tmo');
  if (datos.tmoSeg < tmo.alertaMenorA) {
    alertas.push(`TMO menor a ${formatoTmo(tmo.alertaMenorA)}: revisar que no se esté despachando rápido al cliente. No resta puntos.`);
  }

  return { componentes, total, nivel: nivelSegunTotal(total), color: colorSegunTotal(total), alertas };
}

/* Todos los agentes ordenados del mayor puntaje al menor. */
function armarRanking(cualMes) {
  const datos = datosDelMes(cualMes);
  return CONSTELLATION.agentes
    .map(agente => ({ agente, puntaje: calcularPuntaje(datos[agente.id]) }))
    .sort((a, b) => b.puntaje.total - a.puntaje.total);
}


/* =========================================================
   5. TRAER DATOS DE OTROS MÓDULOS
   Las páginas cargan los scripts de Comet y de Mission Control.
   Si alguno no está, la función avisa y no cambia nada.
   ========================================================= */

const hayComet = () => typeof leerTickets === 'function';
const hayMissionControl = () => typeof MISSION !== 'undefined';

/* Cuenta, para cada agente, los tickets que Comet resolvió en
   los últimos 30 días y cuántos de esos cumplieron el SLA. */
function ticketsDeComet() {
  const hace30Dias = new Date(Date.now() - 30 * 86400000).toISOString();
  const resueltos = leerTickets().filter(t => !esActivo(t) && t.resuelto >= hace30Dias);

  const porAgente = {};
  CONSTELLATION.agentes.forEach(agente => {
    const suyos = resueltos.filter(t => t.agente === agente.id);
    porAgente[agente.id] = {
      resueltos: suyos.length,
      enSla: suyos.filter(t => calcularSla(t).estado === 'cumplido').length
    };
  });
  return { porAgente, total: resueltos.length };
}

function traerDeComet() {
  if (!hayComet()) return false;
  const deComet = ticketsDeComet().porAgente;
  const mes = leerMesActual();

  // Base del mes (de los ejemplos) + lo que resolvió Comet.
  // Siempre se parte de la base, así apretar dos veces no suma doble.
  Object.entries(CONSTELLATION.mesActual).forEach(([id, ejemplo]) => {
    mes.agentes[id].tickets = {
      resueltos: ejemplo.ticketsBase.resueltos + deComet[id].resueltos,
      enSla: ejemplo.ticketsBase.enSla + deComet[id].enSla
    };
  });
  mes.traidoDeComet = new Date().toISOString();
  guardarMesActual(mes);
  return true;
}

function traerDeMissionControl() {
  if (!hayMissionControl()) return false;
  const mes = leerMesActual();

  MISSION.rankingMes.forEach(fila => {
    if (!mes.agentes[fila.agente]) return;
    mes.agentes[fila.agente].atencion = fila.atencion;
    mes.agentes[fila.agente].tmoSeg = fila.tmoSeg;
  });
  mes.traidoDeMission = new Date().toISOString();
  guardarMesActual(mes);
  return true;
}
