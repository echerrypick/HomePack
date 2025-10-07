'use server';

import { MOCK_ADDRESSES, MOCK_PROPERTY_DATA } from '@/lib/mock-data';
import type { Address, PropertyData } from '@/lib/mock-data';
import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Internal function to get property data and generate AI summary
async function getPropertyReport(addressId: string): Promise<{ propertyData: PropertyData, summary: string }> {
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

type SearchResult = 
  | { status: 'address_selection'; addresses: Address[] }
  | { status: 'report_ready'; report: { propertyData: PropertyData, summary: string }, address: Address };

export async function postcodeSearchOrGetReport(
  currentState: { postcode: string, selectedAddressId?: string }
): Promise<SearchResult> {
  const { postcode, selectedAddressId } = currentState;

  if (selectedAddressId) {
    // Stage 2: Address selected, get the report
    const selectedAddress = MOCK_ADDRESSES.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      throw new Error("Invalid address ID selected.");
    }
    const report = await getPropertyReport(selectedAddressId);
    return { status: 'report_ready', report, address: selectedAddress };
  } else {
    // Stage 1: Postcode search
    await sleep(1000); // Simulate API call
    if (!postcode) {
      throw new Error('Postcode is required');
    }
    // In a real app, you'd fetch this from an API based on the postcode.
    const results = MOCK_ADDRESSES;

    if (results.length === 0) {
      throw new Error("No addresses found for this postcode.");
    }
    
    if (results.length > 1) {
      // Multiple addresses found, user needs to select one
      return { status: 'address_selection', addresses: results };
    }

    // If only one address, proceed directly to generating the report
    const address = results[0];
    const report = await getPropertyReport(address.id);
    return { status: 'report_ready', report, address };
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
