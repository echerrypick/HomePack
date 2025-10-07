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

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SERVER] Mapbox API Error Response: ${errorText}`);
      throw new Error(`Failed to fetch addresses from Mapbox. The API responded with status: ${response.status}.`);
    }

    const data = await response.json();

    if (!data.features) {
      return [];
    }

    const mappedAddresses: Address[] = data.features.map((feature: any) => ({
      id: feature.id,
      address: feature.place_name,
    }));
    
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
    tenure: 'Data not found',
    pricePaid: 'Data not found',
    date: 'N/A',
  };

  try {
    const postcodeMatch = fullAddress.match(/([A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2})$/);
    if (postcodeMatch) {
      const postcode = postcodeMatch[0];
      const ppdUrl = `http://landregistry.data.gov.uk/app/ppi/transaction-record?propertyAddress.postcode=${encodeURIComponent(postcode)}&_sort=-transactionDate&_limit=50`;
      console.log(`[SERVER] Fetching Land Registry data from: ${ppdUrl}`);
      
      const response = await fetch(ppdUrl);

      if (response.ok) {
        const json = await response.json();
        const transactions = json.result?.items || [];
        const addressStart = fullAddress.split(',')[0].trim().toUpperCase();

        console.log(`[SERVER] Searching for address starting with: "${addressStart}"`);

        const latestTransaction = transactions.find((item: any) => {
          const itemAddress = item.propertyAddress?.label?.toUpperCase() || '';
          console.log(`[SERVER] Comparing API Address: "${itemAddress}" with search term: "${addressStart}"`);
          return itemAddress.startsWith(addressStart);
        });

        if (latestTransaction) {
          console.log('[SERVER] Found matching transaction:', JSON.stringify(latestTransaction, null, 2));
          landRegistryData = {
            titleNumber: 'N/A', // PPD doesn’t provide title numbers
            tenure: latestTransaction.estateType?.label || 'N/A',
            pricePaid: latestTransaction.pricePaid ? `£${latestTransaction.pricePaid.toLocaleString()}` : 'N/A',
            date: latestTransaction.transactionDate || 'N/A',
          };
        } else {
          console.log('[SERVER] No matching transaction found for address:', addressStart);
          landRegistryData.tenure = 'No recent sales data found.';
          landRegistryData.pricePaid = 'No recent sales data found.';
        }
      } else {
        console.error(`[SERVER] Land Registry API Error: ${response.status} - ${await response.text()}`);
      }
    } else {
      console.log('[SERVER] Could not extract postcode from address:', fullAddress);
    }
  } catch (error: any) {
    console.error('[SERVER] Error fetching Land Registry data:', error.message);
    landRegistryData.tenure = 'Error fetching data.';
    landRegistryData.pricePaid = 'Error fetching data.';
  }

  // MOCK data for other sections
  const epcData = {
    rating: 'B' as const,
    potentialRating: 'A' as const,
    validUntil: '2032-06-20',
    energyUse: 85,
  };

  const floodRiskData = {
    riverAndSea: 'Low',
    surfaceWater: 'Very Low',
  };

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
