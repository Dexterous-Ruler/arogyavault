/**
 * OpenAI Service
 * Handles OCR text extraction, embedding generation, and metadata extraction for documents
 */

import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn("[OpenAI Service] Warning: OPENAI_API_KEY not set in environment variables");
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export interface ExtractedMetadata {
  title?: string;
  provider?: string; // Hospital name, lab name, clinic name
  date?: string; // ISO date string
  documentType?: "prescription" | "lab" | "imaging" | "billing";
  tags?: string[];
}

export class OpenAIService {
  /**
   * Extract text from an image using GPT-4 Vision API
   * @param file - Image file buffer
   * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
   * @returns Extracted text from the image
   */
  static async extractTextFromImage(
    file: Buffer,
    mimeType: string
  ): Promise<string> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      console.log(`[OpenAI] Extracting text from image (${mimeType})`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this medical document. Include all details like patient name, date, test results, values, units, and any other information. Return the text in a structured format if possible.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${file.toString("base64")}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      const extractedText = response.choices[0]?.message?.content || "";
      console.log(`[OpenAI] Extracted ${extractedText.length} characters from image`);
      
      return extractedText;
    } catch (error: any) {
      console.error("[OpenAI] Error extracting text from image:", error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  /**
   * Extract text from a PDF file
   * For PDFs, we'll convert pages to images first, then extract text
   * Note: This is a simplified approach. For production, consider using pdf-parse or similar
   * @param file - PDF file buffer
   * @returns Extracted text from the PDF
   */
  static async extractTextFromPDF(file: Buffer): Promise<string> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      console.log(`[OpenAI] Extracting text from PDF`);
      
      // Convert PDF to base64
      const base64Pdf = file.toString("base64");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this medical document PDF. Include all details like patient name, date, test results, values, units, and any other information. Return the text in a structured format if possible.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      });

      const extractedText = response.choices[0]?.message?.content || "";
      console.log(`[OpenAI] Extracted ${extractedText.length} characters from PDF`);
      
      return extractedText;
    } catch (error: any) {
      console.error("[OpenAI] Error extracting text from PDF:", error);
      // If PDF extraction fails, try alternative approach
      // For now, return empty string and log the error
      console.warn("[OpenAI] PDF text extraction failed, returning empty string");
      return "";
    }
  }

  /**
   * Generate embedding for text using OpenAI's embedding model
   * @param text - Text to generate embedding for
   * @returns Embedding vector as JSON string
   */
  static async generateEmbedding(text: string): Promise<string> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    if (!text || text.trim().length === 0) {
      return JSON.stringify([]);
    }

    try {
      console.log(`[OpenAI] Generating embedding for text (${text.length} chars)`);
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.substring(0, 8000), // Limit to 8000 chars to avoid token limits
      });

      const embedding = response.data[0]?.embedding || [];
      const embeddingJson = JSON.stringify(embedding);
      
      console.log(`[OpenAI] Generated embedding with ${embedding.length} dimensions`);
      
      return embeddingJson;
    } catch (error: any) {
      console.error("[OpenAI] Error generating embedding:", error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Extract metadata from medical document text
   * @param extractedText - Text extracted from the document
   * @returns Extracted metadata (title, provider, date, documentType, tags)
   */
  static async extractMetadata(extractedText: string): Promise<ExtractedMetadata> {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return {};
    }

    try {
      console.log(`[OpenAI] Extracting metadata from text (${extractedText.length} chars)`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use cheaper model for metadata extraction
        messages: [
          {
            role: "system",
            content: `You are a medical document parser. Extract key information from medical documents.

Extract the following information:
1. **title**: A concise title for the document (e.g., "Blood Test Report", "Chest X-Ray Report", "Prescription")
2. **provider**: The name of the hospital, lab, clinic, or doctor's name (e.g., "Apollo Hospital", "Dr. John Smith", "Max Lab")
3. **date**: The date of the document in ISO format (YYYY-MM-DD). If multiple dates exist, use the most relevant one (report date, test date, prescription date)
4. **documentType**: One of: "lab", "prescription", "imaging", "billing"
5. **tags**: Array of relevant tags (e.g., ["blood-test", "cbc"], ["x-ray", "chest"], ["prescription", "antibiotics"])

Respond ONLY with a JSON object in this exact format:
{
  "title": "string or null",
  "provider": "string or null",
  "date": "YYYY-MM-DD or null",
  "documentType": "lab" | "prescription" | "imaging" | "billing" or null,
  "tags": ["string"] or []
}

If information is not found, use null for that field.`,
          },
          {
            role: "user",
            content: `Extract metadata from this medical document:\n\n${extractedText.substring(0, 3000)}`, // Limit to 3000 chars
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const metadata = JSON.parse(content) as ExtractedMetadata;
      
      console.log(`[OpenAI] Extracted metadata:`, metadata);
      
      return metadata;
    } catch (error: any) {
      console.error("[OpenAI] Error extracting metadata:", error);
      return {};
    }
  }

  /**
   * Validate if a document is medical-related
   * Uses AI to determine if the document is a medical document (lab report, prescription, etc.)
   * @param extractedText - Text extracted from the document
   * @param fileBuffer - Original file buffer (for image analysis if text is insufficient)
   * @param mimeType - MIME type of the file
   * @returns Object with isValid (boolean) and reason (string)
   */
  static async validateMedicalDocument(
    extractedText: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<{ isValid: boolean; reason: string }> {
    if (!openai) {
      // If OpenAI is not configured, allow all documents (fallback)
      console.warn("[OpenAI] OpenAI not configured, skipping medical validation");
      return { isValid: true, reason: "OpenAI not configured" };
    }

    try {
      console.log(`[OpenAI] Validating if document is medical-related`);
      console.log(`[OpenAI] Extracted text length: ${extractedText.length} chars`);
      console.log(`[OpenAI] File buffer size: ${fileBuffer.length} bytes`);
      console.log(`[OpenAI] MIME type: ${mimeType}`);

      // If we have extracted text, use it for validation
      if (extractedText && extractedText.trim().length > 0) {
        console.log(`[OpenAI] Using text-based validation`);
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Use cheaper model for validation
          messages: [
            {
              role: "system",
              content: `You are a medical document validator. Your task is to determine if a document is a medical document or not.

Medical documents include:
- Lab reports and test results
- Prescriptions
- Medical imaging reports (X-rays, CT scans, MRIs, etc.)
- Doctor's notes and consultation reports
- Discharge summaries
- Medical certificates
- Health insurance claims
- Medical bills and invoices
- Vaccination records
- Health checkup reports

Non-medical documents include:
- Personal photos (selfies, family photos, etc.)
- Receipts for non-medical purchases
- Bank statements
- Identity documents (Aadhaar, passport, etc.)
- Educational certificates
- Legal documents
- Random text documents
- Any document that is clearly not related to health or medical care

Respond ONLY with a JSON object in this exact format:
{
  "isMedical": true or false,
  "reason": "Brief explanation of why it is or isn't a medical document"
}`,
            },
            {
              role: "user",
              content: `Analyze this document text and determine if it is a medical document:\n\n${extractedText.substring(0, 3000)}`, // Limit to 3000 chars
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 200,
        });

        const content = response.choices[0]?.message?.content || "{}";
        const validation = JSON.parse(content);

        const isValid = validation.isMedical === true;
        const reason = validation.reason || (isValid ? "Document appears to be medical-related" : "Document does not appear to be a medical document");

        console.log(`[OpenAI] Medical validation result: ${isValid ? "VALID" : "INVALID"} - ${reason}`);

        return { isValid, reason };
      } else {
        // If no text extracted, try to analyze the image directly
        console.log("[OpenAI] No text extracted, analyzing image directly for medical content");

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a medical document validator. Analyze this image and determine if it is a medical document.

Medical documents include: lab reports, prescriptions, medical imaging reports, doctor's notes, discharge summaries, medical certificates, health insurance claims, medical bills, vaccination records, health checkup reports.

Non-medical documents include: personal photos, receipts for non-medical purchases, bank statements, identity documents, educational certificates, legal documents, random images.

Respond ONLY with a JSON object:
{
  "isMedical": true or false,
  "reason": "Brief explanation"
}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Is this image a medical document? Analyze the content and determine if it's related to health or medical care.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${fileBuffer.toString("base64")}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 200,
        });

        const content = response.choices[0]?.message?.content || "{}";
        const validation = JSON.parse(content);

        const isValid = validation.isMedical === true;
        const reason = validation.reason || (isValid ? "Document appears to be medical-related" : "Document does not appear to be a medical document");

        console.log(`[OpenAI] Medical validation result (image analysis): ${isValid ? "VALID" : "INVALID"} - ${reason}`);

        return { isValid, reason };
      }
    } catch (error: any) {
      console.error("[OpenAI] Error validating medical document:", error);
      // On error, allow the document (fail open) but log the error
      return {
        isValid: true,
        reason: "Validation error occurred, document allowed",
      };
    }
  }

  /**
   * Process a document: extract text and generate embedding
   * @param file - File buffer
   * @param fileType - File type (e.g., 'JPG', 'PNG', 'PDF', 'DOCX')
   * @param mimeType - MIME type of the file
   * @returns Object with extractedText and embedding
   */
  static async processDocument(
    file: Buffer,
    fileType: string,
    mimeType: string
  ): Promise<{ extractedText: string; embedding: string }> {
    try {
      let extractedText = "";

      // Extract text based on file type
      if (fileType === "PDF" || mimeType === "application/pdf") {
        extractedText = await this.extractTextFromPDF(file);
      } else if (
        fileType === "JPG" ||
        fileType === "PNG" ||
        fileType === "IMAGE" ||
        mimeType.startsWith("image/")
      ) {
        extractedText = await this.extractTextFromImage(file, mimeType);
      } else if (fileType === "DOCX" || mimeType.includes("word")) {
        // For DOCX, we might need to convert to text first
        // For now, return empty string (can be enhanced later)
        console.warn("[OpenAI] DOCX text extraction not yet implemented");
        extractedText = "";
      } else {
        console.warn(`[OpenAI] Unsupported file type for OCR: ${fileType}`);
        extractedText = "";
      }

      // Generate embedding from extracted text
      let embedding = "";
      if (extractedText && extractedText.trim().length > 0) {
        embedding = await this.generateEmbedding(extractedText);
      } else {
        embedding = JSON.stringify([]);
      }

      return {
        extractedText,
        embedding,
      };
    } catch (error: any) {
      console.error("[OpenAI] Error processing document:", error);
      // Return empty values on error - don't block document creation
      return {
        extractedText: "",
        embedding: JSON.stringify([]),
      };
    }
  }

  /**
   * Generate health insights for a single document
   * @param extractedText - Text extracted from the document
   * @param documentType - Type of document (lab, prescription, imaging, billing)
   * @returns Object with status, summary, and hasFullAnalysis flag
   */
  static async generateDocumentInsight(
    extractedText: string,
    documentType: string
  ): Promise<{
    status: "normal" | "warning" | "critical" | "none";
    summary: string;
    hasFullAnalysis: boolean;
  }> {
    if (!openai) {
      console.warn("[OpenAI] OpenAI not configured, returning default insight");
      return {
        status: "none",
        summary: "",
        hasFullAnalysis: false,
      };
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        status: "none",
        summary: "No text extracted from document. Unable to generate insights.",
        hasFullAnalysis: false,
      };
    }

    try {
      console.log(`[OpenAI] Generating health insight for ${documentType} document`);

      let systemPrompt = "";
      if (documentType === "lab") {
        systemPrompt = `You are a medical AI assistant analyzing lab reports. Analyze the test results and provide:
1. **status**: "normal" if all values are within normal range, "warning" if some values are slightly elevated/low, "critical" if any values are dangerously high/low
2. **summary**: A concise 2-3 sentence summary highlighting key findings, abnormal values (if any), and recommendations
3. **hasFullAnalysis**: true if detailed analysis is available, false otherwise

Focus on:
- Identifying abnormal test values
- Comparing values to normal ranges
- Highlighting any critical findings
- Providing actionable recommendations

Respond ONLY with a JSON object:
{
  "status": "normal" | "warning" | "critical" | "none",
  "summary": "string",
  "hasFullAnalysis": true or false
}`;
      } else if (documentType === "prescription") {
        systemPrompt = `You are a medical AI assistant analyzing prescriptions. Analyze the medications and provide:
1. **status**: "normal" if dosages are appropriate, "warning" if there are concerns about interactions or dosages, "critical" if there are serious issues
2. **summary**: A concise 2-3 sentence summary about the medications, dosages, and any important notes
3. **hasFullAnalysis**: true if detailed analysis is available, false otherwise

Focus on:
- Medication names and dosages
- Potential drug interactions
- Compliance recommendations

Respond ONLY with a JSON object:
{
  "status": "normal" | "warning" | "critical" | "none",
  "summary": "string",
  "hasFullAnalysis": true or false
}`;
      } else if (documentType === "imaging") {
        systemPrompt = `You are a medical AI assistant analyzing imaging reports. Analyze the findings and provide:
1. **status**: "normal" if findings are normal, "warning" if there are minor findings, "critical" if there are significant findings requiring attention
2. **summary**: A concise 2-3 sentence summary of the imaging findings and recommendations
3. **hasFullAnalysis**: true if detailed analysis is available, false otherwise

Focus on:
- Key findings from the imaging study
- Any abnormalities detected
- Recommendations for follow-up

Respond ONLY with a JSON object:
{
  "status": "normal" | "warning" | "critical" | "none",
  "summary": "string",
  "hasFullAnalysis": true or false
}`;
      } else {
        // For billing or other types
        return {
          status: "none",
          summary: "Health insights are not available for this document type.",
          hasFullAnalysis: false,
        };
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Analyze this ${documentType} document and provide health insights:\n\n${extractedText.substring(0, 4000)}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const insight = JSON.parse(content);

      console.log(`[OpenAI] Generated document insight:`, insight);

      return {
        status: insight.status || "none",
        summary: insight.summary || "",
        hasFullAnalysis: insight.hasFullAnalysis === true,
      };
    } catch (error: any) {
      console.error("[OpenAI] Error generating document insight:", error);
      return {
        status: "none",
        summary: "Unable to generate insights at this time.",
        hasFullAnalysis: false,
      };
    }
  }

  /**
   * Generate overall health summary based on multiple documents
   * @param documents - Array of documents with extracted text and metadata
   * @returns Object with status and message for overall health summary
   */
  static async generateHealthSummary(
    documents: Array<{
      type: string;
      extractedText: string;
      date?: string;
      title?: string;
    }>
  ): Promise<{
    status: "good" | "warning" | "critical";
    message: string;
  }> {
    if (!openai) {
      console.warn("[OpenAI] OpenAI not configured, returning default summary");
      return {
        status: "good",
        message: "Upload lab reports and medical documents to get AI-powered health insights.",
      };
    }

    if (!documents || documents.length === 0) {
      return {
        status: "good",
        message: "No documents available. Upload lab reports to get started with AI health insights.",
      };
    }

    try {
      console.log(`[OpenAI] Generating health summary for ${documents.length} documents`);

      // Prepare document summaries for analysis
      const documentSummaries = documents
        .filter((doc) => doc.extractedText && doc.extractedText.trim().length > 0)
        .map((doc) => {
          const textPreview = doc.extractedText.substring(0, 1000);
          return `Type: ${doc.type}\nDate: ${doc.date || "Unknown"}\nTitle: ${doc.title || "Untitled"}\nContent: ${textPreview}...`;
        })
        .join("\n\n---\n\n");

      if (!documentSummaries) {
        return {
          status: "good",
          message: "Documents uploaded but no text extracted yet. Please wait for processing to complete.",
        };
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a medical AI assistant providing overall health insights based on a patient's medical documents.

Analyze all the provided documents and generate a concise health summary:
1. **status**: "good" if overall health appears normal, "warning" if there are minor concerns, "critical" if there are serious issues requiring immediate attention
2. **message**: A 2-3 sentence summary highlighting:
   - Overall health status
   - Key findings across all documents
   - General recommendations

Be concise, professional, and actionable. Focus on patterns and trends across documents.

Respond ONLY with a JSON object:
{
  "status": "good" | "warning" | "critical",
  "message": "string"
}`,
          },
          {
            role: "user",
            content: `Analyze these medical documents and provide an overall health summary:\n\n${documentSummaries}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const summary = JSON.parse(content);

      console.log(`[OpenAI] Generated health summary:`, summary);

      return {
        status: summary.status || "good",
        message: summary.message || "Based on your latest reports, all values are within normal range. Keep up the healthy lifestyle!",
      };
    } catch (error: any) {
      console.error("[OpenAI] Error generating health summary:", error);
      return {
        status: "good",
        message: "Based on your latest reports, all values are within normal range. Keep up the healthy lifestyle!",
      };
    }
  }
}
