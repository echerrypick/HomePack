'use server';

import { config } from 'dotenv';
config();

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define types for the data we expect from the APIs
export type Address = {
  id: string;
  address: string;
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
  const apiKey = process.env.MAPBOX_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('[SERVER] MAPBOX_API_KEY is not set. Cannot fetch addresses.');
    throw new Error('Server configuration error: Mapbox API key is missing.');
  }

  if (!query) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${apiKey}&country=gb&types=address,postcode&limit=10`;

  console.log(`[SERVER] Fetching addresses from Mapbox: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SERVER] Mapbox API Error Response: ${errorText}`);
      throw new Error(`Failed to fetch addresses from Mapbox. The API responded with status: ${response.status}.`);
    }

    const data = await response.json();
    console.log('[SERVER] Raw Mapbox API Response:', JSON.stringify(data, null, 2));

    if (!data.features) {
      console.log('[SERVER] No features found in Mapbox API response.');
      return [];
    }

    const mappedAddresses: Address[] = data.features.map((feature: any) => ({
      id: feature.id,
      address: feature.place_name,
    }));
    
    console.log('[SERVER] Mapped addresses:', JSON.stringify(mappedAddresses, null, 2));
    return mappedAddresses;

  } catch (error: any) {
    console.error("[SERVER] Error in fetchAddressesFromQuery:", error.message);
    throw new Error("There was a problem fetching addresses. Please check your search and try again.");
  }
}


async function fetchPropertyData(fullAddress: string): Promise<PropertyData> {
    console.log(`[SERVER] Fetching real data for ${fullAddress}`);
    
    let landRegistryData = {
        titleNumber: 'N/A',
        tenure: 'N/A',
        pricePaid: 'N/A',
        date: 'N/A',
    };

  try {
    const postcodeMatch = fullAddress.match(/([A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2})$/i);
    if (postcodeMatch) {
      const postcode = postcodeMatch[0];
      console.log(`[SERVER] Extracted postcode: ${postcode}`);
      const ppdUrl = `http://landregistry.data.gov.uk/data/ppi/transaction-record.json?ppi:propertyAddress.postcode=${encodeURIComponent(postcode)}&_sort=-transactionDate&_limit=50`;
      
      console.log(`[SERVER] Fetching Land Registry data from: ${ppdUrl}`);
      const response = await fetch(ppdUrl);
      
      if(response.ok) {
          const json = await response.json();
          console.log('[SERVER] Raw Land Registry Response:', JSON.stringify(json, null, 2));
          const results = json.result.items;

          const addressUpper = fullAddress.toUpperCase();
          console.log(`[SERVER] Searching for address starting with: ${addressUpper.split(',')[0]}`);
          const latestTransaction = results.find((item: any) => 
              addressUpper.startsWith(item.propertyAddress.label.toUpperCase())
          );
          
          if (latestTransaction) {
              console.log("[SERVER] Found matching transaction:", JSON.stringify(latestTransaction, null, 2));
              landRegistryData = {
                  titleNumber: latestTransaction.transactionId || 'N/A', // Not a real title number, but a unique ID
                  tenure: latestTransaction.estateType?.label || 'N/A',
                  pricePaid: `£${latestTransaction.pricePaid.toLocaleString()}`,
                  date: latestTransaction.transactionDate,
              };
          } else {
              console.log("[SERVER] No matching transaction found in Land Registry data for this address.");
          }
      } else {
          console.error(`[SERVER] Land Registry API Error: ${response.status}`);
      }
    } else {
        console.log("[SERVER] Could not extract postcode from address for Land Registry lookup.");
    }
  } catch(error) {
      console.error("[SERVER] Error fetching or parsing Land Registry data:", error);
  }

  console.log("[SERVER] Final constructed landRegistryData:", JSON.stringify(landRegistryData, null, 2));


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

export async function getPropertyReport(fullAddress: string): Promise<{ propertyData: PropertyData, summary: string, error?: string }> {
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
    return {
      propertyData,
      summary: "AI summary could not be generated at this time. Please review the property data manually.",
      error: "AI summary error"
    }
  }
}

export async function generateConditionReportAction(imageURIs: string[]): Promise<{ report: string, error?: string }> {
  if (!imageURIs || imageURIs.length === 0) {
    throw new Error("No images provided for condition report.");
  }

  try {
    const reportResult = await generateAiConditionReport({
      photoDataUris: imageURIs,
    });
    return { report: reportResult.conditionReport };
  } catch (error) {
    console.error("AI Condition Report generation failed:", error);
    return { 
        report: "The AI condition report could not be generated. This may be due to an issue with the images or a temporary service problem. Please try again later.",
        error: "AI report error"
    }
  }
}
