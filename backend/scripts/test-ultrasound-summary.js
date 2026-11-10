const path = require('path');
const DocumentExtractionService = require('../services/documentExtractionService');
const MedicalSummaryService = require('../services/medicalSummaryService');

async function main() {
  const filePath = path.join(__dirname, '../uploads/medrec_1794270579155_205fc873864121b56dad729b78374c01.pdf');
  console.log('Testing extraction on:', filePath);

  const extraction = await DocumentExtractionService.extractDocument(filePath, 'application/pdf');
  console.log('--- EXTRACTION RESULT ---');
  console.log('Method:', extraction.extractionMethod);
  console.log('Is scanned:', extraction.isScanned);
  console.log('Character count:', extraction.charCount);
  console.log('Extracted text preview (first 300 chars):');
  console.log(extraction.text.slice(0, 300));

  console.log('\n--- GENERATING CLINICAL SUMMARY ---');
  const loggedInPatientMeta = { fullName: 'Sneha sree Achuta' };
  const summary = await MedicalSummaryService.summarizeRecord(extraction.text, loggedInPatientMeta, { filePath, mimeType: 'application/pdf' });

  console.log('\n================ STRUCTURED SUMMARY ================');
  console.log(JSON.stringify(summary.structuredJson, null, 2));

  console.log('\n================ TEXT SUMMARY ================');
  console.log(summary.summaryText);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
