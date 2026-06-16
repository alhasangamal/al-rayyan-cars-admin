'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadPdfButtonProps {
  targetId: string;
  fileName: string;
}

export default function DownloadPdfButton({ targetId, fileName }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  async function downloadPdf() {
    const target = document.getElementById(targetId);
    if (!target) return;

    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const pdfTarget = createPdfSafeClone(target);
      document.body.appendChild(pdfTarget);

      const canvas = await html2canvas(pdfTarget, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      pdfTarget.remove();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const width = canvas.width * ratio;
      const height = canvas.height * ratio;
      const x = (pageWidth - width) / 2;
      pdf.addImage(imgData, 'PNG', x, 0, width, height);

      pdf.save(fileName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={loading}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-cyan-300/25 px-5 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      تحميل PDF
    </button>
  );
}

function createPdfSafeClone(target: HTMLElement) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = `${Math.max(target.offsetWidth, 760)}px`;
  wrapper.style.background = target.dataset.pdfSafe === 'true' ? '#121622' : '#ffffff';
  wrapper.style.padding = '24px';
  wrapper.style.direction = 'rtl';
  wrapper.style.zIndex = '-1';

  const clone = target.cloneNode(true) as HTMLElement;
  wrapper.appendChild(clone);
  if (target.dataset.pdfSafe !== 'true') {
    sanitizeNode(clone);
  }
  return wrapper;
}

function sanitizeNode(node: HTMLElement) {
  node.removeAttribute('class');
  node.style.boxSizing = 'border-box';
  node.style.fontFamily = 'Arial, Tahoma, sans-serif';
  node.style.color = '#111827';
  node.style.backgroundColor = node.tagName.toLowerCase() === 'article' ? '#ffffff' : 'transparent';
  node.style.boxShadow = 'none';

  if (['article', 'section', 'header', 'footer', 'div'].includes(node.tagName.toLowerCase())) {
    node.style.borderColor = '#e5e7eb';
  }

  if (node.tagName.toLowerCase() === 'article') {
    node.style.width = '100%';
    node.style.maxWidth = '820px';
    node.style.margin = '0 auto';
    node.style.padding = '28px';
    node.style.border = '1px solid #e5e7eb';
    node.style.borderRadius = '18px';
  }

  if (node.tagName.toLowerCase() === 'h2') {
    node.style.fontSize = '28px';
    node.style.fontWeight = '900';
  }

  if (node.tagName.toLowerCase() === 'img') {
    node.style.objectFit = 'contain';
  }

  Array.from(node.children).forEach((child) => {
    sanitizeNode(child as HTMLElement);
  });
}
