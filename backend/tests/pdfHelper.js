function createValidPdf(text = 'Medical Consultation Record: Blood pressure 120/80 mmHg. Fasting blood glucose 95 mg/dL. No known drug allergies. Patient prescribed Metformin 500mg PO BID.') {
  const streamContent = `BT /F1 12 Tf 72 712 Td (${text}) Tj ET`;
  const streamLength = Buffer.byteLength(streamContent, 'latin1');

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const header = '%PDF-1.4\n';
  const offset1 = Buffer.byteLength(header, 'latin1');
  const offset2 = offset1 + Buffer.byteLength(obj1, 'latin1');
  const offset3 = offset2 + Buffer.byteLength(obj2, 'latin1');
  const offset4 = offset3 + Buffer.byteLength(obj3, 'latin1');
  const offset5 = offset4 + Buffer.byteLength(obj4, 'latin1');
  const startXref = offset5 + Buffer.byteLength(obj5, 'latin1');

  const pad = (num) => String(num).padStart(10, '0') + ' 00000 n \r\n';

  const xref = 'xref\r\n' +
    '0 6\r\n' +
    '0000000000 65535 f \r\n' +
    pad(offset1) +
    pad(offset2) +
    pad(offset3) +
    pad(offset4) +
    pad(offset5);

  const trailer = `trailer\r\n<< /Size 6 /Root 1 0 R >>\r\nstartxref\r\n${startXref}\r\n%%EOF\r\n`;

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer, 'latin1');
}

module.exports = { createValidPdf };
