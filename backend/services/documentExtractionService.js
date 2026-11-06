const fs = require('fs');
const pdfParse = require('pdf-parse');
const AppError = require('../utils/AppError');

class DocumentExtractionService {
  /**
   * Extract text from a stored PDF document
   * @param {string} filePath 
   * @returns {Promise<{ text: string, numPages: number, charCount: number, isScanned: boolean }>}
   */
  static async extractPdfText(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new AppError('Medical record file not found on server.', 404);
    }

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);

      const rawText = parsed.text || '';
      // Clean and normalize whitespace
      const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

      const numPages = parsed.numpages || 1;
      const charCount = cleanedText.length;

      // Check whether sufficient readable text is extracted (e.g. at least 30 non-whitespace characters)
      const isInsufficient = charCount < 30;

      return {
        text: cleanedText,
        numPages,
        charCount,
        isScanned: isInsufficient,
        warning: isInsufficient ? 'Extracted text is very brief or the document may be a scanned image/handwritten note.' : null
      };
    } catch (err) {
      console.error('[DocumentExtraction] PDF parsing failed:', err.message);
      throw new AppError(`Failed to parse PDF document: ${err.message}. Please verify the file is not corrupted or password-protected.`, 422);
    }
  }
}

module.exports = DocumentExtractionService;
