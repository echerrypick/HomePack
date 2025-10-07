'use server';

import { MOCK_ADDRESSES, MOCK_PROPERTY_DATA } from '@/lib/mock-data';
import type { Address, PropertyData } from '@/lib/mock-data';
import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type SearchResult = 
  | { status: 'address_selection'; addresses: Address[] }
  | { status: 'report_ready'; report: { propertyData: PropertyData, summary: string }, address: Address };

export async function processPostcode(postcode: string): Promise<SearchResult> {
    await sleep(1000); // Simulate API call
    if (!postcode) {
        throw new Error('Postcode is required');
    }
    // In a real app, you'd fetch this from an API.
    const results = MOCK_ADDRESSES;

    if (results.length === 0) {
        throw new Error("No addresses found for this postcode.");
    }
    
    if (results.length > 1) {
        return { status: 'address_selection', addresses: results };
    }

    // If only one address, proceed to get property data
    const address = results[0];
    const report = await getPropertyData(address.id);
    return { status: 'report_ready', report, address };
}


export async function getPropertyData(addressId: string): Promise<{ propertyData: PropertyData, summary: string }> {
  await sleep(1500); // Simulate API calls
  const propertyData = MOCK_PROPERTY_DATA[addressId];
  if (!propertyData) {
    throw new Error('Property data not found.');
  }

  try {
    const summaryResult = await generateAiSummary({
      propertyData: JSON.stringify(propertyData, null, 2),
    });
    
    return {
      propertyData,
      summary: summaryResult.summary,
    };
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    // Return a fallback summary if AI fails
    return {
      propertyData,
      summary: "AI summary could not be generated at this time. Please review the property data manually."
    }
  }
}

export async function generateConditionReportAction(imageURIs: string[]): Promise<string> {
  if (!imageURIs || imageURIs.length === 0) {
    throw new Error("No images provided for condition report.");
  }

  await sleep(2500); // Simulate AI processing time

  try {
    const reportResult = await generateAiConditionReport({
      photoDataUris: imageURIs,
    });
    return reportResult.conditionReport;
  } catch (error) {
    console.error("AI Condition Report generation failed:", error);
    return "The AI condition report could not be generated. This may be due to an issue with the images or a temporary service problem. Please try again later."
  }
}
