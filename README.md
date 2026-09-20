# ⚽ Planificador Táctico de Fútbol

<div align="center">

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Vanilla_Design_System-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deployed_to-GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)
![Oxlint](https://img.shields.io/badge/Linted_with-Oxlint-orange?style=for-the-badge)

**Una aplicación web moderna, interactiva y responsiva diseñada para directores técnicos, cuerpos técnicos y analistas de fútbol.**  
Permite armar planteles, organizar fechas y partidos, diagramar pizarras tácticas interactivas (Ataque, Defensa, Tiros Libres y Córners), detallar roles de balón parado y generar hojas técnicas de partido imprimibles en formato A4 horizontal listas para PDF.

[🚀 Ver Demo en Vivo](https://federicoiseas.github.io/Planificador-tactica-futbol/) • [✨ Características](#-características-principales) • [🛠️ Tecnologías](#-tecnologías-y-arquitectura) • [📁 Estructura](#-estructura-del-proyecto) • [⚡ Inicio Rápido](#-instalación-y-uso-local)

</div>

---

## 📖 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Fases Tácticas y Funcionalidades](#-fases-tácticas-y-funcionalidades)
4. [Motor de Impresión y PDF (A4 Landscape)](#-motor-de-impresión-y-pdf-a4-landscape)
5. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [Instalación y Uso Local](#-instalación-y-uso-local)
8. [Despliegue](#-despliegue)
9. [Autor y Créditos](#-autor)

---

## 🎯 Descripción General

El **Planificador Táctico de Fútbol** nació con el objetivo de ofrecer una herramienta ágil, intuitiva y visualmente atractiva para la preparación semanal y el día de partido. 

A diferencia de las pizarras genéricas, esta aplicación combina:
- **Gestión integral de plantilla** y asignación dinámica en campo.
- **Multifecha/Partidos simultáneos** para llevar el seguimiento de un torneo completo.
- **Pizarra vectorial SVG interactiva** con soporte para ratón, gestos táctiles y modo *Tap-to-Place* para celulares.
- **Matriz técnica de pelota parada** (ejecutores, cabeceadores, marcas defensivas y balances).
- **Motor de exportación para impresión**: genera fichas técnicas de alta calidad adaptadas exactamente a 1 hoja A4 por fase con ahorro de tinta automático.

---

## ✨ Características Principales

### 📋 Gestión de Plantilla y Jugadores
- Creación rápida de jugadores indicando **Dorsal (Nº)** y **Nombre**.
- Detección automática de estado: identifica qué jugadores ya están posicionados en campo y cuáles siguen disponibles en el banco.
- Remoción de jugadores con actualización en cascada sobre todas las pizarras tácticas.

### 🏟️ Pizarra Táctica Vectorial Interactiva
- **Gráficos SVG de alta definición**: Cancha realista con franjas de césped, áreas, puntos de penal, círculos y semicírculos reglamentarios.
- **Doble Modalidad de Campo**:
  - *Campo Completo (200x280)* para planteos generales de Ataque y Defensa.
  - *Medio Campo Ofensivo (200x146)* para jugadas preparadas de Balón Parado.
- **Triple Sistema de Interacción**:
  1. **Drag & Drop de Escritorio (HTML5 Native DND)**: Arrastra jugadores desde la plantilla o el banco y suéltalos en cualquier sector.
  2. **Arrastre Táctil / Touch Gestures**: Mueve y reposiciona fichas de manera fluida en smartphones y tablets.
  3. **Tap-to-Place (Tocar para ubicar)**: Toca un jugador en la lista y luego toca la cancha para ubicarlo al instante.
- **Fichas Tácticas**: Pines circulares con el dorsal, etiqueta con el nombre del jugador y botón de remoción rápida.

### 📅 Administrador de Fechas y Partidos
- Creación y conmutación ágil entre múltiples partidos (`Fecha 1`, `Fecha 2`, `Amistoso`, etc.).
- Registro de metadatos del encuentro:
  - **Rival** (`VS.`)
  - **Fecha del partido** (Selector con formato localizado `DD/MM/YYYY`)
  - **Horario de Citación**
  - **Lugar / Cancha / Estadio**

### 💾 Respaldo y Persistencia de Datos
- **Autoguardado en tiempo real**: Todo cambio se persiste instantáneamente en `localStorage`.
- **Exportar Backup JSON**: Descarga un archivo `.json` con todas las fechas, jugadores y configuraciones tácticas.
- **Importar Backup JSON**: Carga de forma segura respaldos previos con validación de estructura.

---

## ⚡ Fases Tácticas y Funcionalidades

| Fase | Icono | Tipo de Cancha | Descripción |
| :--- | :---: | :---: | :--- |
| **Ataque** | ⚔️ | Campo Completo | Diagramación del sistema ofensivo, posicionamiento en posesión, amplitud y apoyos. |
| **Defensa** | 🛡️ | Campo Completo | Estructura del bloque defensivo, altura de líneas, coberturas y presión. |
| **Tiros Libres** | 🎯 | Medio Campo | Jugadas preparadas de falta directa/indirecta (con vistas diferenciadas izquierda/derecha al imprimir). |
| **Córners** | 🚩 | Medio Campo | Ocupación de áreas, zonas de remate en primer y segundo palo, rechazos y vigilancias. |

### 📊 Matriz de Balón Parado (Set Pieces)
Para las fases de Tiros Libres y Córners, se incluye una matriz técnica con 4 cuadrantes tácticos:
- **🎯 Ejecutan**: Jugadores asignados para el remate o centro según perfil (diestro/zurdo).
- **💥 Cabecean**: Jugadores con presencia aérea asignados a zonas de impacto.
- **🛡️ Defensa**: Asignaciones de marcas individuales o zonas en fase defensiva.
- **⚖️ Balance**: Jugadores encargados del equilibrio defensivo y prevención de contragolpes.

### 📝 Bloque de Observaciones
Cada fase táctica cuenta con su propio panel de notas para registrar consignas específicas, cambios previstos, alturas de bloque o recordatorios tácticos.

---

## 🖨️ Motor de Impresión y PDF (A4 Landscape)

La aplicación incluye un sistema de impresión profesional calibrado mediante `@media print` y reglas CSS milimétricas:

1. **Modal de Selección de Secciones**: Antes de imprimir, puedes seleccionar con checkboxes qué fases tácticas deseas incluir (Ataque, Defensa, Tiros Libres, Córners).
2. **Formato A4 Apaisado (Landscape)**: Cada sección táctica se formatea para ocupar **exactamente 1 página A4 horizontal** sin desbordes.
3. **Modo Ahorro de Tinta Automático**: Al imprimir o guardar como PDF, el fondo verde de la cancha se transforma en un esquema blanco con líneas oscuras y tipografías de alto contraste para una lectura óptima y mínimo gasto de tinta.
4. **Encabezado Repetitivo de Partido**: Cada hoja impresa incluye el encabezado institucional con los datos del encuentro, rival, fecha, horario y lugar.

---

## 🛠️ Tecnologías y Arquitectura

### 💻 Stack de Desarrollo

- **[React 19](https://react.dev/)**: Biblioteca principal para la construcción de interfaces declarativas basadas en componentes modulares y gestión de estado con hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **[Vite 8](https://vite.dev/)**: Entorno de desarrollo de última generación con Hot Module Replacement (HMR) instantáneo y empaquetado optimizado para producción.
- **[Vanilla CSS3](https://developer.mozilla.org/es/docs/Web/CSS)**:
  - Sistema de diseño con variables CSS (`:root` tokens).
  - Estética inspirada en el sistema oficial **FIFA World Cup 2026** (paleta Deep Navy `#020f2a`, FIFA Blue `#326295`, Negro `#000000` y acentos esmeralda).
  - Maquetación híbrida con **CSS Grid** y **Flexbox**.
  - Tipografías modernas integradas vía Google Fonts (*Poppins* e *Inter*).
  - Reglas `@media print` y `@page` avanzadas para PDF.
- **[SVGs Nativos](https://developer.mozilla.org/es/docs/Web/SVG)**: Gráficos vectoriales ligeros para la cancha y las camisetas de los jugadores, garantizando escalabilidad perfecta en cualquier resolución de pantalla o impresión.
- **[Oxlint](https://oxc.rs/)**: Linter de alto rendimiento en Rust para garantizar código limpio y libre de errores.
- **[GitHub Pages](https://pages.github.com/)**: Alojamiento y despliegue continuo estático mediante `gh-pages`.

---

## 📁 Estructura del Proyecto

```text
Planificador-tactica-futbol/
├── public/
│   ├── favicon.svg          # Favicon vectorial de la aplicación
│   └── icons.svg            # Conjunto de iconos SVG
├── src/
│   ├── assets/
│   │   ├── hero.png         # Gráfico ilustrativo de la aplicación
│   │   └── vite.svg         # Logo de Vite
│   ├── components/
│   │   ├── JerseyIcon.jsx   # Componente SVG vectorial de camiseta con dorsal
│   │   ├── Pitch.jsx        # Componente interactivo de la cancha (DND, Touch, Tap-to-place)
│   │   ├── PrintableBoard.jsx # Pizarra táctica, pestañas de fases, matriz de balón parado y layout A4
│   │   └── Sidebar.jsx      # Panel lateral de gestión de plantilla y banco de suplentes
│   ├── App.jsx              # Componente principal: orquestación de estado, partidos y modal de impresión
│   ├── index.css            # Sistema de diseño completo (tokens, layout, responsive y reglas @media print)
│   ├── main.jsx             # Punto de entrada de React 19
│   └── storage.js           # Capa de persistencia (LocalStorage, estructura de datos y migraciones)
├── .oxlintrc.json           # Configuración de reglas de Oxlint
├── index.html               # Plantilla HTML5 con fuentes y meta tags SEO
├── package.json             # Dependencias y scripts de ejecución
├── vite.config.js           # Configuración de Vite y base URL para GitHub Pages
└── README.md                # Documentación del repositorio
```

---

## ⚡ Instalación y Uso Local

Para ejecutar el proyecto en tu entorno local, sigue estos pasos:

### 1. Prerrequisitos
Asegúrate de tener instalado **Node.js** (versión 18 o superior) y **npm**.

### 2. Clonar el repositorio
```bash
git clone https://github.com/FedericoIseas/Planificador-tactica-futbol.git
cd Planificador-tactica-futbol
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador la URL que indique la consola (habitualmente `http://localhost:5173/Planificador-tactica-futbol/`).

### 5. Compilar para producción
```bash
npm run build
```

---

## 🚀 Despliegue

El proyecto está configurado para compilarse y publicarse automáticamente en **GitHub Pages**:

```bash
npm run deploy
```
Este comando ejecutará `predeploy` (`npm run build`) y subirá la carpeta `dist` a la rama `gh-pages`.

---

## 👨‍💻 Autor

Desarrollado por **[Federico Iseas](https://github.com/FedericoIseas)**.