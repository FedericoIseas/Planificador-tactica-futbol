# AGENTS.md — Planificador Táctico de Fútbol

Guía para agentes de IA (y humanos) que trabajen en este repositorio.
Leer completo antes de modificar código.

---

## 🎯 Prioridades (en orden)

1. **No romper nada.** Cada cambio debe ser incremental y dejar la app funcionando.
2. **Claridad visual y táctica.** La pizarra y las hojas deben leerse de un vistazo por un DT en el vestuario o al costado de la cancha.
3. **Impresión: 1 sección = 1 hoja A4.** Cada fase (Ataque, Defensa, Tiros Libres, Córners) debe imprimirse completa en **una sola página A4 apaisada**, sin desbordes ni cortes.
4. **Exportación a PDF Directa (Paridad Visual 100%).** Implementada mediante captura DOM de la vista de impresión en alta definición con `html2canvas` + `jsPDF` (`src/utils/pdfGenerator.js`). Mantiene identidad total con la hoja impresa.
5. **README siempre actualizado.** Toda funcionalidad nueva o cambio de estructura **debe** reflejarse en [README.md](README.md) en el mismo cambio.

---

## 🧱 Stack

- **React 19** + **Vite 8** (JS, sin TypeScript).
- **jsPDF** para la generación vectorial de PDFs en A4 apaisado.
- **Vanilla CSS** con tokens en `:root` (`src/index.css`). **No** usar Tailwind ni librerías de UI.
- **SVG nativo** para cancha, íconos de UI y camisetas.
- **Oxlint** para lint.
- Persistencia en **localStorage** (`src/storage.js`) + backup JSON.
- Deploy en **GitHub Pages** (`base` configurada en `vite.config.js`).

---

## 📁 Mapa del código

| Archivo | Responsabilidad |
| :--- | :--- |
| `src/App.jsx` | Estado global, partidos/fechas, modal de exportación/impresión. |
| `src/components/PrintableBoard.jsx` | Pestañas de fases, pizarra, matriz de balón parado, layout A4. |
| `src/components/Pitch.jsx` | Cancha SVG interactiva (DnD, touch, tap-to-place). |
| `src/components/Sidebar.jsx` | Plantilla y banco de suplentes. |
| `src/components/JerseyIcon.jsx` | Camiseta SVG con dorsal. |
| `src/components/Icons.jsx` | Íconos SVG vectoriales para el encabezado y botones. |
| `src/utils/pdfGenerator.js` | Generador vectorial de PDF en formato A4 landscape (jsPDF). |
| `src/storage.js` | Estructura de datos, localStorage y migraciones. |
| `src/index.css` | Design system, responsive y reglas `@media print` / `@page`. |

---

## ✅ Reglas para no romper nada

- **Cambios pequeños y acotados.** Un objetivo por cambio. No refactorizar código no relacionado.
- **Datos persistidos = contrato.** Si cambia la forma de los datos en `storage.js`:
  - Agregar una **migración** que convierta datos viejos (localStorage y backups JSON importados).
  - Nunca borrar ni renombrar campos sin migrar.
  - Mantener la validación de importación de backups.
- **Las tres interacciones deben seguir funcionando**: drag & drop de escritorio, arrastre táctil y tap-to-place.
- **Preservar comentarios** existentes no relacionados con el cambio.
- **Antes de dar un cambio por terminado**:
  1. `npm run lint` sin errores nuevos.
  2. `npm run build` compila correctamente.
  3. Verificar en el navegador: vista de pantalla, vista móvil y **vista previa de impresión**.

---

## 🖨️ Reglas de impresión (A4)

- Formato: **A4 apaisado** (297 × 210 mm) definido con `@page`.
- Cada sección impresa = **exactamente 1 página**. Usar `page-break-after` / `break-after: page` entre secciones y `break-inside: avoid` dentro de ellas.
- Cada hoja incluye el **encabezado del partido** (rival, fecha, horario, lugar).
- **Ahorro de tinta**: en impresión la cancha va en blanco con líneas oscuras y texto de alto contraste.
- Ocultar en impresión todo lo que sea UI (botones, sidebar, pestañas, modales).
- Al agregar contenido a una sección (más notas, más filas en la matriz, etc.), **verificar que siga entrando en una sola hoja**. Si no entra, ajustar tamaños/tipografía o truncar con criterio, nunca dejar que pase a una segunda página.
- Usar unidades físicas (`mm`) o relativas controladas en estilos de impresión; evitar alturas que dependan del viewport.

### Preparación para descarga PDF (futura)

- Mantener cada sección imprimible como un **bloque DOM autocontenido** con tamaño A4 fijo, para poder capturarlo/renderizarlo individualmente.
- No depender de estilos que solo existan en `@media print` para la estructura del bloque; la maquetación A4 debe ser reutilizable.
- Evitar recursos externos no cargados (imágenes remotas, fuentes que fallen) dentro de las hojas.

---

## 🎨 Claridad visual y táctica

- Respetar la paleta y tokens existentes (estética FIFA World Cup 2026: Deep Navy `#020f2a`, FIFA Blue `#326295`, acentos esmeralda). No hardcodear colores nuevos: agregarlos como tokens.
- Tipografías: **Poppins** e **Inter**.
- Dorsales y nombres siempre legibles (en pantalla y en papel); no superponer fichas con texto ilegible.
- Proporciones de cancha: campo completo `200x280`, medio campo `200x146`. No alterarlas sin revisar posiciones guardadas.
- Priorizar información táctica útil sobre decoración.
- Toda UI debe ser usable en móvil (touch) y escritorio.

---

## 📝 Documentación

Actualizar [README.md](README.md) **en el mismo cambio** cuando:

- Se agrega, modifica o elimina una funcionalidad.
- Cambia la estructura de archivos/carpetas (actualizar el árbol de "Estructura del Proyecto").
- Cambia la estructura de datos o el formato de backup.
- Se agregan dependencias, scripts o cambia el proceso de build/deploy.

Idioma del proyecto (UI, comentarios y docs): **español**.

---

## ⚙️ Comandos

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo
npm run lint      # oxlint
npm run build     # build de producción
npm run preview   # previsualizar build
npm run deploy    # build + publicar en GitHub Pages
```
