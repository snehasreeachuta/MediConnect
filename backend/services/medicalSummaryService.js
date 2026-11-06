const config = require('../config/environment');
const AppError = require('../utils/AppError');

class MedicalSummaryService {
  /**
   * Summarize medical record text into structured format
   * @param {string} extractedText 
   * @param {object} patientMeta 
   * @returns {Promise<{ summaryText: string, structuredJson: object, modelUsed: string, isMock: boolean }>}
   */
  static async summarizeRecord(extractedText, patientMeta = {}) {
    if (!extractedText || extractedText.trim().length === 0) {
      throw new AppError('Cannot summarize empty document text.', 400);
    }

    const { apiKey, model, enableMockSummarization } = config.llm;

    // If API key is present and mock mode is not forced, attempt real LLM API call
    if (apiKey && !enableMockSummarization) {
      try {
        return await this.callGeminiApi(extractedText, patientMeta, apiKey, model);
      } catch (err) {
        console.error('[MedicalSummaryService] Real LLM API call failed:', err.message);
        throw new AppError(`AI Summarization service failed: ${err.message}`, 502);
      }
    }

    // Explicitly labeled Mock Summarization Mode for development
    console.log('[MedicalSummaryService] Using clearly labeled Mock Summarization Mode (ENABLE_MOCK_SUMMARIZATION is active or LLM_API_KEY is not set).');
    return this.generateMockSummary(extractedText, patientMeta);
  }

  /**
   * Call Google Gemini API using native fetch
   */
  static async callGeminiApi(extractedText, patientMeta, apiKey, modelName) {
    const prompt = `
You are an expert medical document summarization AI assistant for the MediConnect platform.
Summarize the following medical document into the exact 9-part structured clinical format below.

CRITICAL CLINICAL SAFETY RULES:
1. Do not invent or assume information not present in the document.
2. If a section has no supporting information, write: "Not mentioned in the uploaded records".
3. Preserve all exact lab units, reference ranges, dates, and dosages.
4. Distinguish historical conditions from recent findings.
5. If there are conflicting records or ambiguous readings, explicitly flag them under "Information Requiring Doctor Review".
6. End with the mandatory clinical disclaimer.

DOCUMENT TEXT:
${extractedText.slice(0, 15000)}

Return a valid JSON object with the following keys:
{
  "patient_information": "Summary of patient name, age, biological sex, MRN if stated",
  "document_dates_and_types": "Document date(s) and type (e.g. CBC lab panel, discharge summary, prescription)",
  "previously_documented_conditions": "Documented chronic or acute diagnoses",
  "previous_treatments_and_medications": "Prescriptions, dosages, surgical interventions",
  "allergies_documented": "Documented drug, environmental, or food allergies",
  "important_laboratory_results": "Key lab values with units and normal reference ranges",
  "other_relevant_medical_findings": "Imaging summaries, physical exam highlights",
  "information_requiring_doctor_review": "Flags, abnormal values, conflicting notes, or missing follow-ups",
  "missing_or_unclear_information": "Illegible dates, clipped text, or missing panels",
  "formatted_text_summary": "Complete readable text summary with headers"
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Gemini API returned an empty response.');
    }

    const structured = JSON.parse(candidate);
    const summaryText = structured.formatted_text_summary || this.formatStructuredText(structured);

    return {
      summaryText,
      structuredJson: structured,
      modelUsed: `google-${modelName || 'gemini-1.5-flash'}`,
      isMock: false
    };
  }

  /**
   * Deterministic, clinically structured mock generator for testing and development
   */
  static generateMockSummary(extractedText, patientMeta) {
    const textLower = extractedText.toLowerCase();

    // Heuristics for mock extraction
    const hasBP = textLower.includes('blood pressure') || textLower.includes('bp') || /\d{2,3}\/\d{2,3}/.test(extractedText);
    const hasAllergy = textLower.includes('allergy') || textLower.includes('allergic') || textLower.includes('nkda');
    const hasMeds = textLower.includes('mg') || textLower.includes('tablet') || textLower.includes('capsule') || textLower.includes('rx');
    const hasLab = textLower.includes('glucose') || textLower.includes('cholesterol') || textLower.includes('hba1c') || textLower.includes('hemoglobin');

    const structured = {
      patient_information: patientMeta.fullName ? `${patientMeta.fullName} (MediConnect Patient)` : 'Patient identified in records',
      document_dates_and_types: 'Medical Consultation Record / Laboratory Panel (PDF format)',
      previously_documented_conditions: textLower.includes('hypertension') ? 'Hypertension documented' : (textLower.includes('diabetes') ? 'Type 2 Diabetes documented' : 'Not mentioned in the uploaded records'),
      previous_treatments_and_medications: hasMeds ? 'Oral pharmacotherapy noted in document text. Review original record for complete dosing.' : 'Not mentioned in the uploaded records',
      allergies_documented: hasAllergy ? 'Review records: Document mentions allergy notes (e.g. Penicillin / Seasonal).' : 'No known drug allergies (NKDA) explicitly listed.',
      important_laboratory_results: hasLab ? 'Lab panels detected. Glucose / Metabolic parameters noted. Values should be correlated with standard reference intervals.' : 'Not mentioned in the uploaded records',
      other_relevant_medical_findings: hasBP ? 'Vital signs recorded: Blood pressure readings present in document.' : 'Not mentioned in the uploaded records',
      information_requiring_doctor_review: 'Verify current medication adherence and schedule routine metabolic follow-up.',
      missing_or_unclear_information: 'Historical immunization records and baseline ECG not included in this document.',
      disclaimer: 'AI-Generated Summary: For Review by a Qualified Healthcare Professional. This summary is intended to assist medical history review and does not diagnose conditions, prescribe treatment, or replace clinical judgment.'
    };

    const formattedText = this.formatStructuredText(structured, true);

    return {
      summaryText: formattedText,
      structuredJson: structured,
      modelUsed: 'mock-clinical-summarizer-v1',
      isMock: true
    };
  }

  static formatStructuredText(s, isMock = false) {
    return `[${isMock ? 'DEVELOPMENT MOCK ' : ''}AI-GENERATED MEDICAL SUMMARY]
For Review by a Qualified Healthcare Professional

1. PATIENT INFORMATION
${s.patient_information || 'Not mentioned in the uploaded records'}

2. DOCUMENT DATES AND TYPES
${s.document_dates_and_types || 'Not mentioned in the uploaded records'}

3. PREVIOUSLY DOCUMENTED MEDICAL CONDITIONS
${s.previously_documented_conditions || 'Not mentioned in the uploaded records'}

4. PREVIOUS TREATMENTS AND MEDICATIONS
${s.previous_treatments_and_medications || 'Not mentioned in the uploaded records'}

5. ALLERGIES DOCUMENTED IN THE RECORDS
${s.allergies_documented || 'Not mentioned in the uploaded records'}

6. IMPORTANT LABORATORY RESULTS
${s.important_laboratory_results || 'Not mentioned in the uploaded records'}

7. OTHER RELEVANT MEDICAL FINDINGS
${s.other_relevant_medical_findings || 'Not mentioned in the uploaded records'}

8. INFORMATION REQUIRING DOCTOR REVIEW
${s.information_requiring_doctor_review || 'Not mentioned in the uploaded records'}

9. MISSING OR UNCLEAR INFORMATION
${s.missing_or_unclear_information || 'Not mentioned in the uploaded records'}

--------------------------------------------------------------------------------
NOTICE: ${s.disclaimer || 'AI-Generated Summary: For Review by a Qualified Healthcare Professional. This summary is intended to assist medical history review and does not diagnose conditions, prescribe treatment, or replace clinical judgment.'}`;
  }
}

module.exports = MedicalSummaryService;
