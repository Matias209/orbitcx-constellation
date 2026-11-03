# ⭐ Constellation — Puntaje y evaluación de agentes

> Parte de **OrbitCX**, una suite de herramientas para Customer Experience.
> Constellation es el planeta de la *mejora*: cada agente es una estrella y su brillo sale de sus resultados del mes.

**[Ver demo en vivo →](https://matias209.github.io/orbitcx-constellation/)**

---

## El problema

Evaluar a un equipo de atención suele ser subjetivo o depender de un solo número, como la cantidad de llamadas. Los agentes no saben bien qué se mide ni cómo mejorar, y el supervisor arma el ranking a mano con datos de varios sistemas.

## La solución

Un puntaje sobre 100, con reglas a la vista de todos, que combina cinco componentes:

| Componente | Puntos | De dónde sale |
|---|---|---|
| **Tickets en SLA** | 30 | Comet: % de tickets resueltos dentro del SLA |
| **% de atención** | 25 | Mission Control: llamadas atendidas sobre recibidas |
| **Calidad (QA)** | 20 | Evaluaciones de calidad del supervisor (5 criterios) |
| **Ventas y retenciones** | 15 | Carga del supervisor, con bonus por gestionar toda la lista |
| **TMO** | 10 | Mission Control. Pesa poco a propósito: es higiene, no rendimiento |

| Página | Qué hace |
|---|---|
| **Ranking** | Podio, tabla con los cinco componentes en barras de bloques, nivel y semáforo. **Copiar mensaje para el equipo** lo deja listo para WhatsApp |
| **Ficha del agente** | Su constelación, de dónde sale cada punto, su evolución por semana y las alertas |
| **Reglas** | Todas las tablas de puntaje, armadas a partir de la configuración |
| **Cargar datos** | Evaluaciones de calidad, ventas y retenciones, más **Traer de Comet** y **Traer de Mission Control** |

### Gamificación con temática espacial

- **Niveles:** de *Polvo estelar* (menos de 65) a *Supernova* (90 o más) y *Big Bang* (100).
- **Constelación de cada agente:** cinco estrellas unidas, una por componente. Cuanto más puntaje tiene en un componente, más grande y brillante es su estrella. Se dibuja en SVG a partir del puntaje.
- **Un TMO muy bajo** (menos de 1:30) se marca con ⚠️, pero no resta puntos. Puede indicar que se está despachando rápido al cliente.

> Basado en un sistema de puntaje real que construí para un equipo de contact center. Esta versión usa una empresa ficticia, **Big Tower** (telecomunicaciones), y todos los datos son de ejemplo.

## Decisiones de diseño

- **Reglas en un solo lugar:** los tramos de cada componente están en `constellation-data.js`. La página de Reglas se arma sola con esos datos, así lo que se ve y lo que se calcula nunca se contradicen.
- **"Traer de Comet" no suma doble:** siempre parte de la base del mes y le suma lo de Comet, así apretar dos veces da el mismo resultado.
- **El mes anterior está cerrado:** se puede consultar, pero no editar.

## Integración con la suite

Constellation carga los scripts de **Comet** (tickets y reglas de SLA) y los datos de **Mission Control** (ranking del mes). En esta demo los módulos comparten el navegador. En una versión real, los tres leerían de la misma API y base de datos: está explicado en el README de [Mission Control](https://github.com/matias209/orbitcx-mission-control#cómo-sería-en-producción).

## Tecnologías

- **HTML, CSS y JavaScript**, sin frameworks ni dependencias
- **SVG** generado por código para las constelaciones
- **localStorage** para los datos del mes (con un botón para restaurar los ejemplos)
- **GitHub Pages** para publicarlo
- **[OrbitCX UI](https://github.com/matias209/orbitcx-ui)**, el sistema de diseño compartido de la suite

## Cómo está organizado el código

```
orbitcx-constellation/
├── index.html, agente.html, ...   una página por sección (casi vacías)
└── assets/
    ├── js/
    │   ├── constellation-data.js      reglas del puntaje (tramos, niveles) y datos de ejemplo
    │   ├── constellation-puntaje.js   el cálculo: de resultado a puntos, total, nivel, traer datos
    │   └── constellation.js           las pantallas: arma cada página y conecta los clics
    ├── css/constellation.css          estilos propios (prefijo cs-)
    └── img/favicon.svg
```

## Cómo correrlo en tu computadora

Constellation usa las carpetas hermanas `orbitcx-ui`, `orbitcx-comet` y `orbitcx-mission-control`:

```bash
git clone https://github.com/matias209/orbitcx-ui.git
git clone https://github.com/matias209/orbitcx-comet.git
git clone https://github.com/matias209/orbitcx-mission-control.git
git clone https://github.com/matias209/orbitcx-constellation.git
python -m http.server 8000
```

Y se abre `http://localhost:8000/orbitcx-constellation/`.

## La suite OrbitCX

| Planeta | Qué hace |
|---|---|
| 🟣 **Nebula** | Base de conocimiento |
| 🟠 **Comet** | Helpdesk de tickets con prioridad y SLA |
| 🔵 **Mission Control** | Panel de supervisión |
| 🟡 **Constellation** | Puntaje y evaluación de agentes (este repo) |

---

Hecho por **Matías Samuel Díaz** · [Portfolio](https://matias209.github.io/portfolio/) · [LinkedIn](https://linkedin.com/in/matias-díaz-sánchez)
