/* =========================================================
   CONSTELLATION — Reglas del puntaje y datos de ejemplo
   ---------------------------------------------------------
   Acá están las reglas que deciden cuántos puntos saca cada
   agente. Para cambiar un tramo o un peso se cambia solo este
   archivo: la página de Reglas se arma sola con estos datos.

   Big Tower es una empresa ficticia de telecomunicaciones.
   Agentes y resultados son de ejemplo.

   Cómo se leen los tramos:
     mayorEsMejor: true  -> "desde": desde qué valor se ganan esos puntos
     mayorEsMejor: false -> "hasta": hasta qué valor se ganan esos puntos
   Se usa el primer tramo que se cumple, de arriba hacia abajo.
   ========================================================= */

const CONSTELLATION = {

  empresa: 'Big Tower',
  version: '1.0.0',

  /* ---------- Los cinco componentes (suman 100) ---------- */
  componentes: [
    {
      id: 'tickets', nombre: 'Tickets en SLA', max: 30, color: 'var(--ox-comet)', fuente: 'Comet',
      explicacion: 'Porcentaje de los tickets resueltos dentro del SLA.',
      mayorEsMejor: true,
      tramos: [
        { desde: 95, puntos: 30, texto: '95% o más' },
        { desde: 90, puntos: 26, texto: '90 – 94,9%' },
        { desde: 85, puntos: 22, texto: '85 – 89,9%' },
        { desde: 80, puntos: 18, texto: '80 – 84,9%' },
        { desde: 70, puntos: 12, texto: '70 – 79,9%' },
        { desde: 60, puntos: 6,  texto: '60 – 69,9%' },
        { desde: 0,  puntos: 0,  texto: 'Menos de 60%' }
      ]
    },
    {
      id: 'atencion', nombre: '% de atención', max: 25, color: 'var(--ox-mission)', fuente: 'Mission Control',
      explicacion: 'Llamadas atendidas sobre llamadas recibidas. Objetivo: 90%.',
      mayorEsMejor: true,
      tramos: [
        { desde: 90, puntos: 25, texto: '90% o más' },
        { desde: 85, puntos: 21, texto: '85 – 89,9%' },
        { desde: 80, puntos: 17, texto: '80 – 84,9%' },
        { desde: 75, puntos: 13, texto: '75 – 79,9%' },
        { desde: 70, puntos: 9,  texto: '70 – 74,9%' },
        { desde: 60, puntos: 5,  texto: '60 – 69,9%' },
        { desde: 0,  puntos: 0,  texto: 'Menos de 60%' }
      ]
    },
    {
      id: 'calidad', nombre: 'Calidad (QA)', max: 20, color: 'var(--ox-nebula)', fuente: 'Evaluaciones del supervisor',
      explicacion: 'Promedio de las evaluaciones de calidad del mes (0 a 100).',
      mayorEsMejor: true,
      tramos: [
        { desde: 95, puntos: 20, texto: '95 o más' },
        { desde: 90, puntos: 18, texto: '90 – 94' },
        { desde: 85, puntos: 15, texto: '85 – 89' },
        { desde: 80, puntos: 12, texto: '80 – 84' },
        { desde: 70, puntos: 8,  texto: '70 – 79' },
        { desde: 0,  puntos: 4,  texto: 'Menos de 70' }
      ]
    },
    {
      id: 'ventas', nombre: 'Ventas y retenciones', max: 15, color: 'var(--ox-brand-2)', fuente: 'Carga del supervisor',
      explicacion: 'Ventas cerradas más bajas retenidas. Quien gestionó toda su lista suma 5 puntos más (tope 15).',
      mayorEsMejor: true,
      bonusListaCompleta: 5,
      tramos: [
        { desde: 10, puntos: 15, texto: '10 o más' },
        { desde: 7,  puntos: 12, texto: '7 – 9' },
        { desde: 5,  puntos: 9,  texto: '5 – 6' },
        { desde: 3,  puntos: 6,  texto: '3 – 4' },
        { desde: 1,  puntos: 3,  texto: '1 – 2' },
        { desde: 0,  puntos: 0,  texto: '0' }
      ]
    },
    {
      id: 'tmo', nombre: 'TMO', max: 10, color: 'var(--ox-constellation)', fuente: 'Mission Control',
      explicacion: 'Tiempo medio de operación. Objetivo: 2:45. Pesa poco a propósito: es higiene, no rendimiento.',
      mayorEsMejor: false,
      alertaMenorA: 90, // un TMO menor a 1:30 se marca con ⚠️, pero no resta
      tramos: [
        { hasta: 165, puntos: 10, texto: '2:45 o menos' },
        { hasta: 180, puntos: 8,  texto: '2:46 – 3:00' },
        { hasta: 195, puntos: 6,  texto: '3:01 – 3:15' },
        { hasta: 210, puntos: 4,  texto: '3:16 – 3:30' },
        { hasta: Infinity, puntos: 2, texto: 'Más de 3:30' }
      ]
    }
  ],

  /* ---------- Niveles según el puntaje total ---------- */
  niveles: [
    { desde: 100, nombre: 'Big Bang',      icon: '💥' },
    { desde: 90,  nombre: 'Supernova',     icon: '🌟' },
    { desde: 85,  nombre: 'Supergigante',  icon: '☀️' },
    { desde: 80,  nombre: 'Gigante azul',  icon: '🔵' },
    { desde: 75,  nombre: 'Estrella',      icon: '⭐' },
    { desde: 65,  nombre: 'Estrella fugaz', icon: '💫' },
    { desde: 0,   nombre: 'Polvo estelar', icon: '✨' }
  ],

  /* ---------- Semáforo del total ---------- */
  semaforo: { verde: 80, amarillo: 66 },

  /* ---------- Evaluación de calidad ----------
     Cada criterio suma 20 si se cumple, 10 si se cumple en parte. */
  criteriosCalidad: [
    'Saludo y presentación',
    'Escucha y diagnóstico',
    'Solución correcta',
    'Registro en el sistema',
    'Cierre y empatía'
  ],

  /* ---------- Agentes ----------
     El mismo equipo de Comet y Mission Control (mismos id). */
  agentes: [
    { id: 'ag-01', nombre: 'Sofía Martínez' },
    { id: 'ag-02', nombre: 'Lucas Benítez' },
    { id: 'ag-03', nombre: 'Valentina Rojas' },
    { id: 'ag-04', nombre: 'Tomás Ferreira' },
    { id: 'ag-05', nombre: 'Camila Ortiz' },
    { id: 'ag-06', nombre: 'Bruno Castillo' }
  ],

  /* ---------- Mes actual: datos de arranque ----------
     ticketsBase: tickets resueltos antes de los que hay en Comet.
     "Traer de Comet" les suma los que Comet resolvió en los últimos
     30 días; "Traer de Mission Control" actualiza atención y TMO. */
  mesActual: {
    'ag-01': { ticketsBase: { resueltos: 34, enSla: 33 }, atencion: 94.6, tmoSeg: 154, calidad: [96, 92, 94], ventas: 6, retenciones: 3, listaCompleta: true },
    'ag-02': { ticketsBase: { resueltos: 29, enSla: 26 }, atencion: 91.2, tmoSeg: 147, calidad: [88, 90], ventas: 4, retenciones: 1, listaCompleta: true },
    'ag-03': { ticketsBase: { resueltos: 25, enSla: 20 }, atencion: 87.3, tmoSeg: 186, calidad: [84, 80, 86], ventas: 2, retenciones: 2, listaCompleta: false },
    'ag-04': { ticketsBase: { resueltos: 31, enSla: 28 }, atencion: 93.0, tmoSeg: 163, calidad: [90, 94], ventas: 8, retenciones: 4, listaCompleta: false },
    'ag-05': { ticketsBase: { resueltos: 27, enSla: 24 }, atencion: 88.1, tmoSeg: 159, calidad: [92, 86, 90], ventas: 3, retenciones: 1, listaCompleta: true },
    'ag-06': { ticketsBase: { resueltos: 22, enSla: 21 }, atencion: 90.4, tmoSeg: 84,  calidad: [78, 82], ventas: 5, retenciones: 2, listaCompleta: false }
  },

  /* ---------- Mes anterior: cerrado (no se edita) ---------- */
  mesAnterior: {
    'ag-01': { tickets: { resueltos: 52, enSla: 49 }, atencion: 92.8, tmoSeg: 158, calidad: [94, 90, 96, 92], ventas: 9, retenciones: 3, listaCompleta: true },
    'ag-02': { tickets: { resueltos: 47, enSla: 45 }, atencion: 93.5, tmoSeg: 149, calidad: [92, 95, 90], ventas: 7, retenciones: 2, listaCompleta: true },
    'ag-03': { tickets: { resueltos: 44, enSla: 36 }, atencion: 84.9, tmoSeg: 192, calidad: [82, 85, 80], ventas: 3, retenciones: 1, listaCompleta: false },
    'ag-04': { tickets: { resueltos: 50, enSla: 46 }, atencion: 90.1, tmoSeg: 168, calidad: [88, 92, 90], ventas: 6, retenciones: 5, listaCompleta: true },
    'ag-05': { tickets: { resueltos: 41, enSla: 38 }, atencion: 89.4, tmoSeg: 162, calidad: [90, 88], ventas: 4, retenciones: 2, listaCompleta: false },
    'ag-06': { tickets: { resueltos: 39, enSla: 33 }, atencion: 86.0, tmoSeg: 176, calidad: [80, 84, 78], ventas: 4, retenciones: 1, listaCompleta: false }
  },

  /* ---------- Evolución: puntaje total de las últimas 4 semanas ---------- */
  evolucion: {
    'ag-01': [86, 89, 91, 93],
    'ag-02': [90, 88, 87, 86],
    'ag-03': [62, 66, 68, 71],
    'ag-04': [80, 82, 85, 84],
    'ag-05': [78, 76, 79, 80],
    'ag-06': [70, 74, 73, 77]
  }
};
