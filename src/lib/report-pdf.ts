import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/** Capture the same fixed A4 pages shown by HomePackPdfTemplate. */
export async function createReportPdf(template: HTMLElement, onPage?: (page: number, total: number) => void) {
  const wrapper = template.parentElement;
  const originalStyle = wrapper?.style.cssText || '';
  try {
    // Keep the export outside the responsive site layout and the visible viewport.
    if (wrapper) Object.assign(wrapper.style, { position: 'absolute', left: '-10000px', top: '0', visibility: 'visible', height: 'auto', overflow: 'visible', width: '794px' });
    await document.fonts.ready;
    await Promise.all(Array.from(template.querySelectorAll('img')).map(image => image.decode().catch(() => undefined)));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const pages = Array.from(template.querySelectorAll<HTMLElement>('[data-pdf-page]'));
    if (!pages.length) throw new Error('No pages found in report template');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    for (const [index, page] of pages.entries()) {
      onPage?.(index + 1, pages.length);
      // Never silently crop an overlong page or paint its body over the footer.
      const body = page.firstElementChild?.getBoundingClientRect();
      const footer = page.lastElementChild?.getBoundingClientRect();
      if (page.scrollHeight > page.clientHeight + 2 || (body && footer && body.bottom + 12 > footer.top)) {
        throw new Error(`Report page ${index + 1} needs more space. Please contact support; no cropped PDF was downloaded.`);
      }
      const canvas = await html2canvas(page, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
        windowWidth: 1280,
      });
      if (index) pdf.addPage('a4', 'portrait');
      // Preserve the source aspect ratio rather than stretching the captured page.
      const height = 210 * canvas.height / canvas.width;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, (297 - height) / 2, 210, height, undefined, 'FAST');
    }
    return pdf;
  } finally {
    if (wrapper) wrapper.style.cssText = originalStyle;
  }
}
