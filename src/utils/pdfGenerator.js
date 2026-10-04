import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates an A4 landscape PDF document with 100% visual parity with browser printing.
 * Uses html2canvas to capture the print-styled DOM pages at high resolution.
 */
export async function generateTacticalPdf(match) {
  const printPagesContainer = document.querySelector('.print-pages-container');
  if (!printPagesContainer) {
    return { success: false, error: 'No se encontró el contenedor de hojas impresas.' };
  }

  // Create loading overlay to completely cover UI during capture
  const overlay = document.createElement('div');
  overlay.id = 'pdf-export-loading-overlay';
  overlay.innerHTML = `
    <div class="pdf-loading-card">
      <div class="pdf-loading-spinner"></div>
      <div class="pdf-loading-title">Generando PDF Táctico</div>
      <div class="pdf-loading-subtitle">Procesando hojas A4 de alta definición…</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Activate print styles on document body for screen capture
  document.body.classList.add('pdf-export-mode');

  try {
    // Wait for DOM repaint with print styles applied
    await new Promise(resolve => setTimeout(resolve, 200));

    const pageElements = Array.from(printPagesContainer.querySelectorAll('.print-page'));
    if (!pageElements.length) {
      return { success: false, error: 'No hay secciones seleccionadas para exportar.' };
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 297;
    const pdfHeight = 210;
    const marginX = 4;
    const marginY = 6;
    const contentW = pdfWidth - (marginX * 2); // 289mm
    const contentH = pdfHeight - (marginY * 2); // 198mm

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1400,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        doc.addPage('a4', 'landscape');
      }

      doc.addImage(imgData, 'JPEG', marginX, marginY, contentW, contentH);
    }

    const matchLabel = (match.label || 'Partido').replace(/[^a-zA-Z0-9_-]/g, '_');
    const rivalLabel = (match.rival || 'Rival').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateLabel = match.date || new Date().toISOString().slice(0, 10);
    const fileName = `Planificador_${matchLabel}_vs_${rivalLabel}_${dateLabel}.pdf`;

    doc.save(fileName);
    return { success: true };
  } catch (err) {
    console.error('Error al generar PDF:', err);
    return { success: false, error: 'Ocurrió un error al generar el archivo PDF.' };
  } finally {
    document.body.classList.remove('pdf-export-mode');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}

