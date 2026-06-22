import { generateDemoPdf } from '../src/services/pdfDeliveryService';

const result = generateDemoPdf({
  clientName: 'Cliente Demo',
  productTitle: 'Desvende seu Mapa',
  birthDate: '1990-05-12',
});

if (!result.success || !result.pdfDataUrl) throw new Error(result.error || 'PDF demo ausente.');

const encoded = result.pdfDataUrl.split(',')[1];
const bytes = Buffer.from(encoded, 'base64');
if (bytes.length < 1000 || bytes.subarray(0, 5).toString() !== '%PDF-') {
  throw new Error('O arquivo demo não contém um PDF válido.');
}

console.log(`PDF demo válido: ${result.fileName} (${bytes.length} bytes)`);
