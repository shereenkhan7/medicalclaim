import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Medical Receipt OCR & Information Extraction Endpoint
app.post('/api/extract-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', filename = 'receipt' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an expert medical receipt and invoice OCR analysis system.
Examine this medical bill, clinic invoice, doctor receipt, pharmacy bill, or healthcare receipt carefully.
Extract the required medical cost submission details accurately:

1. Name of Employee (or Patient Name if the bill is for the employee/patient). If no individual name is visible, provide "Not Specified".
2. Clinic name: Name of the medical center, hospital, dental clinic, polyclinic, specialist clinic, or doctor's practice.
3. Sub-Total: The net amount or sub-total before GST/taxes as a numeric value. If tax is inclusive or not itemized, calculate or reflect the pre-tax amount or total. Must be a number (e.g. 50.00).
4. GST: Goods & Services Tax / VAT / sales tax amount as a numeric value. If 0% or none listed, return 0. (e.g. 4.50 or 0).
5. Grand Total: The total final payable or paid amount as a numeric value. Must be a number (e.g. 54.50).
6. Summary of illness: Diagnosis, symptoms, chief complaint, reason for medical consultation, clinical notes, or summary of condition (e.g. "Acute Upper Respiratory Tract Infection", "Gastritis & Acid Reflux", "Dental Scaling & Polish", "Routine Health Screening", "Migraine / Tension Headache", "Dermatitis Rash"). If diagnosis is not written explicitly, synthesize a concise summary from the prescribed medications, doctor specialism, or treatment items listed. If completely unknown, write "General Medical Consultation".

Additional details:
- receiptNumber: The invoice, bill, or receipt registration number if visible.
- visitDate: The date of consultation/visit in YYYY-MM-DD format (or as written on bill).
- currency: The currency symbol or code (e.g. "SGD", "$", "USD", "MYR", "EUR"). Default to "SGD" or "$" if context implies Singapore/standard dollar.
- notes: Any helpful remarks (e.g. "Prescribed Paracetamol & Amoxicillin", "Self-pay itemized").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: {
              type: Type.STRING,
              description: 'Name of Employee or Patient',
            },
            clinicName: {
              type: Type.STRING,
              description: 'Name of the Clinic or Healthcare Provider',
            },
            subTotal: {
              type: Type.NUMBER,
              description: 'Sub-total amount before GST/tax',
            },
            gst: {
              type: Type.NUMBER,
              description: 'GST or tax amount (0 if exempt or not charged)',
            },
            grandTotal: {
              type: Type.NUMBER,
              description: 'Final grand total amount',
            },
            illnessSummary: {
              type: Type.STRING,
              description: 'Summary of illness, diagnosis, or reason for visit',
            },
            receiptNumber: {
              type: Type.STRING,
              description: 'Invoice, Tax Invoice or Receipt number',
            },
            visitDate: {
              type: Type.STRING,
              description: 'Date of visit or invoice date',
            },
            currency: {
              type: Type.STRING,
              description: 'Currency code or symbol, e.g. SGD, USD, $',
            },
            notes: {
              type: Type.STRING,
              description: 'Additional notes, medications or observations',
            },
          },
          required: [
            'employeeName',
            'clinicName',
            'subTotal',
            'gst',
            'grandTotal',
            'illnessSummary',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      return res.status(500).json({ error: 'Failed to parse extracted receipt data.' });
    }

    // Sanitize values
    const safeSubTotal = typeof parsedData.subTotal === 'number' ? parsedData.subTotal : parseFloat(parsedData.subTotal) || 0;
    const safeGst = typeof parsedData.gst === 'number' ? parsedData.gst : parseFloat(parsedData.gst) || 0;
    let safeGrandTotal = typeof parsedData.grandTotal === 'number' ? parsedData.grandTotal : parseFloat(parsedData.grandTotal) || 0;

    if (safeGrandTotal === 0 && safeSubTotal > 0) {
      safeGrandTotal = safeSubTotal + safeGst;
    }

    return res.json({
      success: true,
      data: {
        employeeName: (parsedData.employeeName || 'Not Specified').trim(),
        clinicName: (parsedData.clinicName || 'Unknown Clinic').trim(),
        subTotal: Number(safeSubTotal.toFixed(2)),
        gst: Number(safeGst.toFixed(2)),
        grandTotal: Number(safeGrandTotal.toFixed(2)),
        illnessSummary: (parsedData.illnessSummary || 'General Medical Consultation').trim(),
        receiptNumber: parsedData.receiptNumber || 'N/A',
        visitDate: parsedData.visitDate || new Date().toISOString().split('T')[0],
        currency: parsedData.currency || '$',
        notes: parsedData.notes || '',
        originalFilename: filename,
      },
    });
  } catch (err: any) {
    console.error('OCR Extraction error:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred during medical receipt extraction.',
    });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medical Cost Submission Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
