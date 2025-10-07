'use server';

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define types for the data we expect from the APIs
export type Address = {
  id: string; // This will be the full address string from postcodes.io
  address: string; // The full address string
}

export type PropertyData = {
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

// --- API Calls ---

async function fetchAddressesFromQuery(query: string): Promise<Address[]> {
  if (!query) return [];
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(query)}/autocomplete`;
  console.log(`[SERVER] Fetching addresses from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch addresses. The API responded with status: ${response.status}. Details: ${errorText}`);
    }
    const data = await response.json();
    console.log('[SERVER] Raw API Response:', JSON.stringify(data, null, 2));

    if (!data.result) {
      console.log('[SERVER] No results found in API response.');
      return [];
    }
    
    // The result is an array of full address strings
    const mappedAddresses = data.result.map((addressString: string) => ({
        id: addressString,
        address: addressString,
    }));

    console.log('[SERVER] Mapped addresses:', JSON.stringify(mappedAddresses, null, 2));
    return mappedAddresses;

  } catch (error: any) {
    console.error("[SERVER] Error in fetchAddressesFromQuery:", error.message);
    throw new Error(error.message || "There was a problem fetching addresses. Please check your search and try again.");
  }
}


async function fetchPropertyData(fullAddress: string): Promise<PropertyData> {
    // In a real app, you'd call various APIs here using the address.
    // For demonstration, we'll return mock data.
    console.log(`Fetching real data for ${fullAddress}`);
    
    // --- Land Registry API Call ---
    const landRegApiKey = process.env.LAND_REG_API_KEY;
    // MOCK: Replace with actual API call
    const landRegistryData = {
        titleNumber: 'NGL123456',
        tenure: 'Freehold',
        pricePaid: '£250,000',
        date: '2022-01-15',
    };

    // --- EPC API Call ---
    const epcApiKey = process.env.EPC_API_KEY;
    // MOCK: Replace with actual API call
    const epcData = {
        rating: 'B' as const,
        potentialRating: 'A' as const,
        validUntil: '2032-06-20',
        energyUse: 85,
    };

    // --- Flood Risk API Call ---
    const floodApiKey = process.env.FLOOD_API_KEY;
     // MOCK: Replace with actual API call
    const floodRiskData = {
        riverAndSea: 'Low',
        surfaceWater: 'Very Low',
    };

    // --- Planning API Call ---
    const planningApiKey = process.env.PLANNING_API_KEY;
     // MOCK: Replace with actual API call
    const planningHistoryData = [
        { application: 'Single-storey rear extension', decision: 'Approved', date: '2019-05-10' },
    ];
    

    return {
        address: fullAddress,
        landRegistry: landRegistryData,
        epc: epcData,
        floodRisk: floodRiskData,
        planningHistory: planningHistoryData,
    };
}


// --- Main Server Actions ---

export async function getAddressSuggestions(query: string): Promise<Address[]> {
  return fetchAddressesFromQuery(query);
}

export async function getPropertyReport(fullAddress: string): Promise<{ propertyData: PropertyData, summary: string }> {
  const propertyData = await fetchPropertyData(fullAddress);

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
