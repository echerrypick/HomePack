import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// In AI Studio Build, GEMINI_API_KEY is automatically provided via process.env
const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
               ((import.meta as any).env?.VITE_GEMINI_API_KEY) || 
               "";

export async function generateAiSummary(propertyData: any) {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyData }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (err: any) {
    console.error("AI Summary generation error:", err);
    return `AI summary could not be generated due to an error: ${err.message || String(err)}`;
  }
}

export async function generateAiConditionReport(photoDataUris: string[]) {
  try {
    const response = await fetch('/api/generate-condition-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoDataUris }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to generate condition report');
    }

    const data = await response.json();
    return data.report;
  } catch (err: any) {
    console.error("AI Condition Report error:", err);
    return `The AI condition report could not be generated due to an error: ${err.message || String(err)}`;
  }
}
