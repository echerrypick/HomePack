'use server';

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define interfaces for the data we expect from the APIs
export interface Address {
  id: string; // Will be a composite ID from the address data, e.g., UDRN
  line1: string;
  town: string;
  postcode: string;
}

export interface PropertyData {
  address: string;
  landRegistry: {
    titleNumber: string;
    tenure: string;
    pricePaid: string;
    date: string;
  };
  epc: {
    rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    potentialRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    validUntil: string;
    energyUse: number;
  };
  floodRisk: {
    riverAndSea: string;
    surfaceWater: string;
  };
  planningHistory: {
    application: string;
    decision: string;
    date: string;
  }[];
}

// Simulate network latency for a better user experience feel
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Calls ---
// Note: In a real app, these would be more robust, with error handling, etc.

async function fetchAddressesFromPostcode(postcode: string): Promise<Address[]> {
  // In a real app, you'd use an address lookup API.
  // We'll simulate this with our mock data for now.
  const { MOCK_ADDRESSES } = await import('@/lib/mock-data');
  await sleep(1000);
  return MOCK_ADDRESSES;
}

async function fetchPropertyData(addressId: string): Promise<PropertyData> {
    // In a real app, you'd call various APIs here (Land Registry, EPC, etc.)
    // using the addressId (like a UPRN) to get the data.
    // We'll simulate this with our mock data.
    const { MOCK_PROPERTY_DATA } = await import('@/lib/mock-data');
    await sleep(1500);
    const data = MOCK_PROPERTY_DATA[addressId];
    if (!data) {
        throw new Error("Could not retrieve property details.");
    }
    return data;
}


// --- Main Server Action ---

async function getPropertyReport(addressId: string): Promise<{ propertyData: PropertyData, summary: string }> {
  const propertyData = await fetchPropertyData(addressId);

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
    const addresses = await fetchAddressesFromPostcode(postcode);
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    
    if (!selectedAddress) {
      throw new Error("Invalid address ID selected.");
    }
    const report = await getPropertyReport(selectedAddressId);
    return { status: 'report_ready', report, address: selectedAddress };
  } else {
    // Stage 1: Postcode search
    if (!postcode) {
      throw new Error('Postcode is required');
    }
    const results = await fetchAddressesFromPostcode(postcode);

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

  // No need to sleep here, the AI call has its own latency
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
