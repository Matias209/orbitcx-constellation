/* =========================================================
   CONSTELLATION — Páginas
   ---------------------------------------------------------
   Cómo funciona (igual que el resto de la suite):

   1. Cada página HTML tiene <body data-page="...">.
   2. Este archivo lee ese atributo y llama a la función que
      dibuja esa página.
   3. Las cuentas del puntaje están en constellation-puntaje.js;
      acá solo se arma la pantalla y se conectan los clics.

   Orden del archivo:
     1. Utilidades de pantalla (bloques, constelación)
     2. Lista de páginas (arma el menú)
     3. Ranking
     4. Ficha del agente
     5. Reglas
     6. Cargar datos
     7. Arranque
   ========================================================= */


/* =========================================================
   1. UTILIDADES DE PANTALLA
   ========================================================= */

const esc = OrbitCX.esc;
const contenido = () => document.getElementById('contenido');
const parametrosUrl = () => new URLSearchParams(location.search);

/* 'actual' o 'anterior', según la URL (?mes=anterior). */
function mesElegido() {
  return parametrosUrl().get('mes') === 'anterior' ? 'anterior' : 'actual';
}

/* Nombre del mes: "Noviembre" o el del mes anterior. */
function nombreDelMes(cualMes) {
  const fecha = new Date();
  if (cualMes === 'anterior') fecha.setMonth(fecha.getMonth() - 1);
  const nombre = fecha.toLocaleString('es-UY', { month: 'long' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/* Barra de 10 bloques, como en un videojuego. */
function bloques(puntos, maximo, color) {
  const encendidos = Math.round((puntos / maximo) * 10);
  let html = '<span class="cs-bloques" aria-hidden="true">';
  for (let i = 0; i < 10; i++) html += `<i style="${i < encendidos ? `background:${color}` : ''}"></i>`;
  return `${html}</span>`;
}

/* Posición de cada estrella dentro del dibujo (viewBox 200 x 130). */
const POSICIONES = {
  tickets:  { x: 28,  y: 88 },
  atencion: { x: 68,  y: 36 },
  calidad:  { x: 112, y: 70 },
  ventas:   { x: 150, y: 26 },
  tmo:      { x: 176, y: 96 }
};
/* Qué estrellas se unen con una línea. */
const LINEAS = [['tickets', 'atencion'], ['atencion', 'calidad'], ['calidad', 'ventas'], ['calidad', 'tmo']];

/* Dibuja la constelación de un agente: cada estrella es un
   componente del puntaje y brilla más cuanto más puntos tiene. */
function constelacion(puntaje, { etiquetas = false, clase = '' } = {}) {
  const lineas = LINEAS.map(([a, b]) =>
    `<line x1="${POSICIONES[a].x}" y1="${POSICIONES[a].y}" x2="${POSICIONES[b].x}" y2="${POSICIONES[b].y}"/>`).join('');

  const estrellas = puntaje.componentes.map(({ componente, puntos }) => {
    const brillo = puntos / componente.max; // de 0 a 1
    const { x, y } = POSICIONES[componente.id];
    const radio = 2.5 + brillo * 6;
    return `
      <g style="color:${componente.color}">
        <title>${esc(componente.nombre)}: ${puntos} de ${componente.max}</title>
        <circle cx="${x}" cy="${y}" r="${radio * 2.4}" fill="currentColor" opacity="${0.08 + brillo * 0.25}"/>
        <circle cx="${x}" cy="${y}" r="${radio}" fill="currentColor" opacity="${0.35 + brillo * 0.65}"/>
        ${etiquetas ? `<text x="${x}" y="${y + radio + 12}" text-anchor="middle">${esc(componente.nombre)}</text>` : ''}
      </g>`;
  }).join('');

  return `<svg class="cs-constelacion ${clase}" viewBox="0 0 200 ${etiquetas ? 140 : 125}" role="img" aria-label="Constelación del puntaje">
    <g class="cs-lineas">${lineas}</g>${estrellas}</svg>`;
}

function badgeNivel(nivel) {
  return `<span class="cs-nivel">${nivel.icon} ${esc(nivel.nombre)}</span>`;
}

function linkFicha(idAgente, cualMes) {
  return `agente.html?id=${encodeURIComponent(idAgente)}${cualMes === 'anterior' ? '&mes=anterior' : ''}`;
}

async function copiar(texto, boton) {
  const original = boton.textContent;
  try {
    await navigator.clipboard.writeText(texto);
    boton.textContent = '✓ Copiado';
  } catch (error) {
    boton.textContent = 'No se pudo copiar';
  }
  setTimeout(() => { boton.textContent = original; }, 1600);
}


/* =========================================================
   2. LISTA DE PÁGINAS
   ========================================================= */

const PAGINAS = [
  { id: 'ranking', archivo: 'index.html',  icon: '🏆', titulo: 'Ranking',       enMenu: true },
  { id: 'carga',   archivo: 'carga.html',  icon: '📥', titulo: 'Cargar datos',  enMenu: true },
  { id: 'reglas',  archivo: 'reglas.html', icon: '📏', titulo: 'Reglas',        enMenu: true },
  { id: 'agente',  archivo: 'agente.html', icon: '⭐', titulo: 'Ficha',         enMenu: false }
];

function armarMenu() {
  OrbitCX.shell({
    module: 'constellation',
    title: 'Constellation',
    org: `${CONSTELLATION.empresa} · Rendimiento del equipo`,
    nav: PAGINAS.filter(p => p.enMenu).map(p => ({ icon: p.icon, label: p.titulo, href: p.archivo }))
  });
}

function armarEncabezado(titulo, bajada, acciones = '') {
  document.getElementById('encabezado').innerHTML = `
    <div class="ox-page-head">
      <div>
        <button class="ox-btn ox-btn-secondary ox-menu-btn" type="button" data-ox-menu>☰ Menú</button>
        <div class="ox-eyebrow">Constellation · Rendimiento</div>
        <h1>${esc(titulo)}</h1>
        <p>${esc(bajada)}</p>
      </div>
      <div class="ox-row">${acciones}</div>
    </div>`;
}

function pestaniasDeMes(cualMes, pagina) {
  return `
    <div class="ox-tabs">
      <a class="ox-tab ${cualMes === 'actual' ? 'is-active' : ''}" href="${pagina}">${esc(nombreDelMes('actual'))} (en curso)</a>
      <a class="ox-tab ${cualMes === 'anterior' ? 'is-active' : ''}" href="${pagina}${pagina.includes('?') ? '&' : '?'}mes=anterior">${esc(nombreDelMes('anterior'))}</a>
    </div>`;
}


/* =========================================================
   3. RANKING
   ========================================================= */

const MEDALLAS = ['🥇', '🥈', '🥉'];

function paginaRanking() {
  const cualMes = mesElegido();
  const ranking = armarRanking(cualMes);
  armarEncabezado('Ranking', `Cada agente es una estrella: su brillo sale de sus resultados de ${nombreDelMes(cualMes).toLowerCase()}.`,
    '<button class="ox-btn ox-btn-secondary" type="button" id="copiarMensaje">💬 Copiar mensaje para el equipo</button>');

  return `
    ${pestaniasDeMes(cualMes, 'index.html')}

    <div class="cs-podio">
      ${ranking.slice(0, 3).map(({ agente, puntaje }, i) => `
        <a class="ox-card cs-podio-lugar cs-lugar-${i + 1}" href="${linkFicha(agente.id, cualMes)}">
          <span class="cs-medalla">${MEDALLAS[i]}</span>
          ${constelacion(puntaje)}
          <b>${esc(agente.nombre)}</b>
          <span class="cs-total" style="color:${puntaje.color}">${puntaje.total}<small> pts</small></span>
          ${badgeNivel(puntaje.nivel)}
        </a>`).join('')}
    </div>

    <div class="ox-table-wrap">
      <table class="ox-table cs-tabla">
        <thead><tr><th>#</th><th>Agente</th>
          ${CONSTELLATION.componentes.map(c => `<th>${esc(c.nombre)} <span class="ox-muted">/${c.max}</span></th>`).join('')}
          <th>Total</th><th>Nivel</th></tr></thead>
        <tbody>
          ${ranking.map(({ agente, puntaje }, i) => `
            <tr>
              <td class="ox-mono">${i + 1}</td>
              <td><a class="cs-agente" href="${linkFicha(agente.id, cualMes)}">${constelacion(puntaje, { clase: 'is-mini' })}<b>${esc(agente.nombre)}</b></a></td>
              ${puntaje.componentes.map(({ componente, puntos }) => `
                <td>${bloques(puntos, componente.max, componente.color)}<small class="ox-mono">${puntos}${componente.id === 'tmo' && puntaje.alertas.length ? ' ⚠️' : ''}</small></td>`).join('')}
              <td><b class="cs-total-tabla" style="color:${puntaje.color}">${puntaje.total}</b></td>
              <td>${badgeNivel(puntaje.nivel)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="ox-muted cs-nota">Tocá un agente para ver su ficha. ⚠️ = TMO menor a 1:30 (solo alerta, no resta puntos).
      Semáforo del total: verde desde ${CONSTELLATION.semaforo.verde}, amarillo desde ${CONSTELLATION.semaforo.amarillo}.</p>`;
}

/* Texto del ranking listo para pegar en WhatsApp. */
function mensajeParaElEquipo(cualMes) {
  const filas = armarRanking(cualMes).map(({ agente, puntaje }, i) =>
    `${MEDALLAS[i] || `${i + 1}.`} ${agente.nombre} — ${puntaje.total} pts · ${puntaje.nivel.nombre} ${puntaje.nivel.icon}`);
  return `🌌 *Constellation · Ranking de ${nombreDelMes(cualMes)}*\n\n${filas.join('\n')}\n\n¡Gracias equipo, a seguir brillando! 🚀`;
}

function activarRanking() {
  document.getElementById('copiarMensaje').addEventListener('click', evento =>
    copiar(mensajeParaElEquipo(mesElegido()), evento.target));
}


/* =========================================================
   4. FICHA DEL AGENTE
   ========================================================= */

function paginaAgente() {
  const cualMes = mesElegido();
  const idAgente = parametrosUrl().get('id');
  const agente = agentePorId(idAgente);

  if (!agente) {
    armarEncabezado('Agente no encontrado', 'Revisá el link o volvé al ranking.');
    return '<a class="ox-btn ox-btn-secondary" href="index.html">← Volver al ranking</a>';
  }

  const ranking = armarRanking(cualMes);
  const puesto = ranking.findIndex(fila => fila.agente.id === idAgente) + 1;
  const { puntaje } = ranking[puesto - 1];
  armarEncabezado(agente.nombre, `Puesto ${puesto} de ${ranking.length} · ${nombreDelMes(cualMes)}${cualMes === 'actual' ? ' (en curso)' : ''}`,
    `<a class="ox-btn ox-btn-secondary" href="index.html${cualMes === 'anterior' ? '?mes=anterior' : ''}">← Ranking</a>`);

  // Evolución: las 4 semanas de ejemplo + el puntaje de ahora
  const semanas = CONSTELLATION.evolucion[idAgente] || [];
  const evolucion = cualMes === 'actual' ? [...semanas.map((total, i) => ({ etiqueta: `Sem ${i + 1}`, total })), { etiqueta: 'Ahora', total: puntaje.total }] : [];

  return `
    ${pestaniasDeMes(cualMes, `agente.html?id=${encodeURIComponent(idAgente)}`)}

    <div class="cs-ficha">
      <section class="ox-card cs-ficha-estrella">
        ${constelacion(puntaje, { etiquetas: true, clase: 'is-grande' })}
        <div class="cs-total" style="color:${puntaje.color}">${puntaje.total}<small> / 100</small></div>
        ${badgeNivel(puntaje.nivel)}
        ${puntaje.alertas.map(alerta => `<div class="cs-alerta">⚠️ ${esc(alerta)}</div>`).join('')}
      </section>

      <section class="ox-card">
        <div class="ox-card-head"><h3>De dónde sale cada punto</h3><a href="reglas.html">Ver reglas</a></div>
        <div class="cs-desglose">
          ${puntaje.componentes.map(({ componente, puntos, detalle }) => `
            <div class="cs-componente">
              <div class="cs-componente-cabeza"><b>${esc(componente.nombre)}</b><span class="ox-chip">${esc(componente.fuente)}</span>
                <span class="ox-mono cs-componente-puntos">${puntos} / ${componente.max}</span></div>
              ${bloques(puntos, componente.max, componente.color)}
              <small class="ox-muted">${esc(detalle)}</small>
            </div>`).join('')}
        </div>
      </section>
    </div>

    ${evolucion.length ? `
      <section class="ox-card">
        <div class="ox-card-head"><h3>Evolución del mes</h3><small class="ox-muted">Puntaje total por semana</small></div>
        <div class="cs-evolucion">
          ${evolucion.map(punto => `
            <div class="cs-evolucion-columna">
              <b class="ox-mono">${punto.total}</b>
              <i style="height:${punto.total}%;background:${colorSegunTotal(punto.total)}"></i>
              <small>${esc(punto.etiqueta)}</small>
            </div>`).join('')}
        </div>
      </section>` : ''}`;
}


/* =========================================================
   5. REGLAS
   Se arma sola a partir de constellation-data.js: si cambia
   un tramo allá, cambia acá.
   ========================================================= */

function paginaReglas() {
  armarEncabezado('Reglas', 'Cómo se calcula el puntaje. Total sobre 100 puntos.');

  return `
    <div class="cs-resumen-pesos">
      ${CONSTELLATION.componentes.map(c => `<span style="--c:${c.color}"><b>${c.max}</b> ${esc(c.nombre)}</span>`).join('')}
    </div>

    <div class="ox-grid" style="--min:280px">
      ${CONSTELLATION.componentes.map(componente => `
        <section class="ox-card" style="border-top:3px solid ${componente.color}">
          <div class="ox-card-head"><h3>${esc(componente.nombre)} (${componente.max})</h3><span class="ox-chip">${esc(componente.fuente)}</span></div>
          <p class="ox-muted cs-nota">${esc(componente.explicacion)}</p>
          <table class="ox-table">
            <tbody>${componente.tramos.map(t => `<tr><td>${esc(t.texto)}</td><td class="ox-mono" style="text-align:right"><b>${t.puntos}</b></td></tr>`).join('')}</tbody>
          </table>
        </section>`).join('')}

      <section class="ox-card">
        <div class="ox-card-head"><h3>Niveles</h3></div>
        <table class="ox-table">
          <tbody>${CONSTELLATION.niveles.map((nivel, i) => {
            const hasta = i === 0 ? '' : ` – ${CONSTELLATION.niveles[i - 1].desde - 1}`;
            return `<tr><td class="ox-mono">${nivel.desde}${hasta}</td><td>${badgeNivel(nivel)}</td></tr>`;
          }).join('')}</tbody>
        </table>
        <p class="ox-muted cs-nota">Semáforo del total: <b style="color:var(--ox-ok)">verde desde ${CONSTELLATION.semaforo.verde}</b>,
          <b style="color:var(--ox-warn)">amarillo desde ${CONSTELLATION.semaforo.amarillo}</b>, rojo por debajo.</p>
      </section>
    </div>`;
}


/* =========================================================
   6. CARGAR DATOS
   ========================================================= */

const OPCIONES_CRITERIO = [
  { valor: 20, texto: 'Cumple' },
  { valor: 10, texto: 'En parte' },
  { valor: 0,  texto: 'No cumple' }
];

function cuandoSeTrajo(fechaISO) {
  if (!fechaISO) return 'Todavía no se trajo';
  const fecha = new Date(fechaISO);
  return `Última vez: ${fecha.toLocaleDateString('es-UY')} ${fecha.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`;
}

function paginaCarga() {
  armarEncabezado('Cargar datos', `Datos de ${nombreDelMes('actual').toLowerCase()}. El mes anterior está cerrado y no se edita.`);
  const mes = leerMesActual();
  const opcionesAgente = CONSTELLATION.agentes.map(a => `<option value="${esc(a.id)}">${esc(a.nombre)}</option>`).join('');

  return `
    <div id="avisoCarga"></div>

    <div class="ox-grid" style="--min:300px">
      <section class="ox-card cs-fuente" style="--c:var(--ox-comet)">
        <div class="ox-card-head"><h3><svg class="ox-planet"><use href="#p-comet"/></svg> Comet</h3></div>
        <p class="ox-muted cs-nota">${hayComet()
          ? `${ticketsDeComet().total} tickets resueltos en los últimos 30 días. Se suman a los del resto del mes.`
          : 'No se encontró Comet: la carpeta orbitcx-comet tiene que estar al lado de esta.'}</p>
        <small class="ox-muted">${cuandoSeTrajo(mes.traidoDeComet)}</small>
        <button class="ox-btn ox-btn-secondary" type="button" id="traerComet" ${hayComet() ? '' : 'disabled'}>Traer de Comet</button>
      </section>

      <section class="ox-card cs-fuente" style="--c:var(--ox-mission)">
        <div class="ox-card-head"><h3><svg class="ox-planet"><use href="#p-mission"/></svg> Mission Control</h3></div>
        <p class="ox-muted cs-nota">${hayMissionControl()
          ? '% de atención y TMO del mes, del ranking de Llamadas.'
          : 'No se encontró Mission Control: la carpeta orbitcx-mission-control tiene que estar al lado de esta.'}</p>
        <small class="ox-muted">${cuandoSeTrajo(mes.traidoDeMission)}</small>
        <button class="ox-btn ox-btn-secondary" type="button" id="traerMission" ${hayMissionControl() ? '' : 'disabled'}>Traer de Mission Control</button>
      </section>
    </div>

    <div class="ox-grid" style="--min:340px">
      <form class="ox-card" id="formCalidad">
        <div class="ox-card-head"><h3>Nueva evaluación de calidad</h3><span class="cs-total-chico" id="totalCalidad">100</span></div>
        <div class="ox-field"><label for="calAgente">Agente</label><select id="calAgente">${opcionesAgente}</select></div>
        <div class="cs-criterios">
          ${CONSTELLATION.criteriosCalidad.map((criterio, i) => `
            <div class="ox-field"><label for="crit${i}">${esc(criterio)}</label>
              <select id="crit${i}" data-criterio>${OPCIONES_CRITERIO.map(o => `<option value="${o.valor}">${esc(o.texto)} (${o.valor})</option>`).join('')}</select></div>`).join('')}
        </div>
        <button class="ox-btn ox-btn-primary" type="submit">Guardar evaluación</button>
      </form>

      <section class="ox-card">
        <div class="ox-card-head"><h3>Evaluaciones del mes</h3></div>
        <div class="ox-table-wrap"><table class="ox-table">
          <thead><tr><th>Agente</th><th>Evaluaciones</th><th>Promedio</th></tr></thead>
          <tbody>${CONSTELLATION.agentes.map(a => {
            const notas = mes.agentes[a.id].calidad;
            return `<tr><td><b>${esc(a.nombre)}</b></td>
              <td>${notas.map(n => `<span class="ox-chip">${n}</span>`).join(' ') || '—'}</td>
              <td class="ox-mono">${notas.length ? formatoNumero(promedioDe(notas)) : '—'}</td></tr>`;
          }).join('')}</tbody>
        </table></div>
      </section>
    </div>

    <form class="ox-card" id="formVentas">
      <div class="ox-card-head"><h3>Ventas y retenciones</h3><button class="ox-btn ox-btn-primary" type="submit">Guardar</button></div>
      <div class="ox-table-wrap"><table class="ox-table">
        <thead><tr><th>Agente</th><th>Ventas cerradas</th><th>Bajas retenidas</th><th>Gestionó toda su lista</th></tr></thead>
        <tbody>${CONSTELLATION.agentes.map(a => {
          const datos = mes.agentes[a.id];
          return `<tr data-agente="${esc(a.id)}"><td><b>${esc(a.nombre)}</b></td>
            <td><input class="ox-input cs-numero" type="number" min="0" data-campo="ventas" value="${datos.ventas}"></td>
            <td><input class="ox-input cs-numero" type="number" min="0" data-campo="retenciones" value="${datos.retenciones}"></td>
            <td><input type="checkbox" data-campo="listaCompleta" ${datos.listaCompleta ? 'checked' : ''}></td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </form>

    <div class="ox-row" style="justify-content:flex-end">
      <button class="ox-btn ox-btn-ghost" type="button" id="restaurar">Restaurar datos de ejemplo</button>
    </div>`;
}

function avisoCarga(mensaje) {
  document.getElementById('avisoCarga').innerHTML = `<div class="cs-aviso">✓ ${esc(mensaje)} <a href="index.html">Ver el ranking →</a></div>`;
}

function activarCarga() {
  // Recarga la página y muestra un aviso arriba
  const listo = mensaje => { iniciar(); avisoCarga(mensaje); };

  document.getElementById('traerComet').addEventListener('click', () => {
    if (traerDeComet()) listo('Tickets actualizados desde Comet.');
  });
  document.getElementById('traerMission').addEventListener('click', () => {
    if (traerDeMissionControl()) listo('Atención y TMO actualizados desde Mission Control.');
  });

  // El total de la evaluación se actualiza a medida que se eligen los criterios
  const criterios = () => [...document.querySelectorAll('[data-criterio]')];
  const totalCalidad = () => criterios().reduce((suma, campo) => suma + Number(campo.value), 0);
  criterios().forEach(campo => campo.addEventListener('change', () => {
    document.getElementById('totalCalidad').textContent = totalCalidad();
  }));

  document.getElementById('formCalidad').addEventListener('submit', evento => {
    evento.preventDefault();
    const idAgente = document.getElementById('calAgente').value;
    const puntaje = totalCalidad();
    actualizarAgente(idAgente, datos => datos.calidad.push(puntaje));
    listo(`Evaluación de ${puntaje} guardada para ${nombreDeAgente(idAgente)}.`);
  });

  document.getElementById('formVentas').addEventListener('submit', evento => {
    evento.preventDefault();
    document.querySelectorAll('#formVentas tr[data-agente]').forEach(fila => {
      const campo = nombre => fila.querySelector(`[data-campo="${nombre}"]`);
      actualizarAgente(fila.dataset.agente, datos => {
        datos.ventas = Number(campo('ventas').value) || 0;
        datos.retenciones = Number(campo('retenciones').value) || 0;
        datos.listaCompleta = campo('listaCompleta').checked;
      });
    });
    listo('Ventas y retenciones guardadas.');
  });

  document.getElementById('restaurar').addEventListener('click', () => {
    restaurarDatosDeEjemplo();
    listo('Se restauraron los datos de ejemplo.');
  });
}


/* =========================================================
   7. ARRANQUE
   ========================================================= */

const RENDER = {
  ranking: { dibujar: paginaRanking, activar: activarRanking },
  agente:  { dibujar: paginaAgente },
  reglas:  { dibujar: paginaReglas },
  carga:   { dibujar: paginaCarga, activar: activarCarga }
};

function iniciar() {
  const render = RENDER[document.body.dataset.page];

  // Cada "dibujar" arma su encabezado, por eso va antes del menú
  contenido().innerHTML = render.dibujar();
  armarMenu();
  if (render.activar) render.activar();

  document.getElementById('pie').textContent =
    `Constellation v${CONSTELLATION.version} · ${CONSTELLATION.empresa} es una empresa ficticia: todos los datos son de ejemplo y se guardan solo en este navegador.`;
}

iniciar();
