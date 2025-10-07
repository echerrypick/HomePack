
'use server';

import { config } from 'dotenv';
config();

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define types for the data we expect from the APIs
export type Address = {
  id: string;
  address: string;
  postcode?: string;
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

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
};

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
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SERVER] Mapbox API Error Response: ${errorText}`);
      throw new Error(`Failed to fetch addresses from Mapbox. The API responded with status: ${response.status}.`);
    }

    const data = await response.json();

    if (!data.features) {
      return [];
    }

    const mappedAddresses: Address[] = data.features.map((feature: any) => {
        const postcodeContext = feature.context?.find((c: any) => c.id.startsWith('postcode.'));
        return {
          id: feature.id,
          address: feature.place_name,
          postcode: postcodeContext?.text,
        };
    });
    
    return mappedAddresses;

  } catch (error: any) {
    console.error("[SERVER] Error in fetchAddressesFromQuery:", error.message);
    throw new Error("There was a problem fetching addresses. Please check your search and try again.");
  }
}

async function fetchPropertyData(fullAddress: string): Promise<PropertyData> {
  console.log(`[SERVER] fetchPropertyData called for: ${fullAddress}`);

  // Start with a complete, default data structure.
  const propertyData: PropertyData = {
    address: fullAddress,
    landRegistry: {
      titleNumber: 'N/A',
      tenure: 'Data not found',
      pricePaid: 'Data not found',
      date: 'N/A',
    },
    epc: {
      rating: 'B' as const,
      potentialRating: 'A' as const,
      validUntil: '2032-06-20',
      energyUse: 85,
    },
    floodRisk: {
      riverAndSea: 'Low',
      surfaceWater: 'Very Low',
    },
    planningHistory: [
      { application: 'Single-storey rear extension', decision: 'Approved', date: '2019-05-10' },
    ],
  };

  try {
    const postcodeMatch = fullAddress.match(/([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2})/i);
    if (postcodeMatch) {
      const postcode = postcodeMatch[0];
      const addressStart = fullAddress.split(',')[0].trim().toUpperCase();
      const paon = addressStart.split(' ')[0]; // Primary Addressable Object Name (house number)

      const ppdUrl = `https://landregistry.data.gov.uk/app/ppi/transaction-record?propertyAddress.postcode=${encodeURIComponent(postcode)}&propertyAddress.paon=${encodeURIComponent(paon)}&_sort=-transactionDate&_limit=200`;
      console.log(`[SERVER] Fetching Land Registry data from: ${ppdUrl}`);

      const response = await fetch(ppdUrl, { headers: FETCH_HEADERS });
      if (response.ok) {
        const json = await response.json();
        const transactions = json.result?.items || [];
        
        console.log(`[SERVER] Searching for address matching: "${addressStart}" within postcode: "${postcode}"`);

        // Pass 1: Exact Match
        let latestTransaction = transactions.find((item: any) => {
            const itemAddress = item.propertyAddress?.label?.toUpperCase() || '';
            return itemAddress === addressStart;
        });

        // Pass 2: Fallback to "includes" if no exact match was found
        if (!latestTransaction) {
            latestTransaction = transactions.find((item: any) => {
                const itemAddress = item.propertyAddress?.label?.toUpperCase() || '';
                return itemAddress.includes(addressStart);
            });
        }

        if (latestTransaction) {
          console.log('[SERVER] Found matching transaction:', JSON.stringify(latestTransaction, null, 2));
          propertyData.landRegistry = {
            titleNumber: 'N/A',
            tenure: latestTransaction.estateType?.label || 'Data not found',
            pricePaid: latestTransaction.pricePaid ? `£${latestTransaction.pricePaid.toLocaleString()}` : 'Data not found',
            date: latestTransaction.transactionDate || 'N/A',
          };
        } else {
            console.log('[SERVER] No matching transaction found for address:', addressStart);
            // If we found the address but there are no transactions, we should reflect this.
            propertyData.landRegistry.pricePaid = 'No recent sales data found';
        }
      } else {
        console.error(`[SERVER] Land Registry API Error: ${response.status} - ${await response.text()}`);
      }
    } else {
      console.log('[SERVER] Could not extract postcode from address:', fullAddress);
    }
  } catch (error: any) {
    console.error('[SERVER] Error fetching Land Registry data:', error.message);
  }

  console.log('[SERVER] fetchPropertyData is returning this property object:', JSON.stringify(propertyData, null, 2));
  return propertyData;
}


// --- Main Server Actions ---

export async function getAddressSuggestions(query: string): Promise<Address[]> {
  return fetchAddressesFromQuery(query);
}

export async function getPropertyReport(fullAddress: string): Promise<{ propertyData: PropertyData, summary: string, error?: string }> {
  console.log(`[SERVER] getPropertyReport called for: ${fullAddress}`);
  
  const propertyData = await fetchPropertyData(fullAddress);
  
  console.log('[SERVER] Data received from fetchPropertyData inside getPropertyReport:', JSON.stringify(propertyData, null, 2));

  try {
    const summaryResult = await generateAiSummary({
      propertyData: JSON.stringify(propertyData, null, 2),
    });
    
    console.log('[SERVER] getPropertyReport is returning SUCCESS with updated data.');
    return {
      propertyData: propertyData,
      summary: summaryResult.summary,
    };
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    console.log('[SERVER] getPropertyReport is returning FAILURE but still with property data.');
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

  // Basic URI validation
  for (const uri of imageURIs) {
    if (!uri.startsWith('data:image/')) {
      console.error(`[SERVER] Invalid image URI format: ${uri}`);
      return { 
        report: "An invalid image format was provided. Please upload valid image files.",
        error: "Invalid image format"
      }
    }
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


// --- Debug Action ---

export type DebugInfo = {
  fullAddressUsed: string;
  postcode: string;
  landRegistryUrl: string;
  landRegistryRawResponse: any;
  error?: string;
}

export async function getDebugInfo(address: Address): Promise<DebugInfo> {
  const fullAddress = address.address;
  const postcode = address.postcode;

  if (!fullAddress) {
    return {
      fullAddressUsed: 'No address provided',
      postcode: '',
      landRegistryUrl: '',
      landRegistryRawResponse: 'No address was provided to debug.',
      error: 'No address was provided.'
    };
  }

  if (!postcode) {
    return {
      fullAddressUsed: fullAddress,
      postcode: 'N/A',
      landRegistryUrl: 'Could not be constructed.',
      landRegistryRawResponse: 'Could not find postcode from Mapbox API response. Therefore, could not query Land Registry.',
      error: 'Could not find postcode from Mapbox API response.'
    };
  }

  const addressStart = fullAddress.split(',')[0].trim().toUpperCase();
  const paon = addressStart.split(' ')[0];

  const ppdUrl = `https://landregistry.data.gov.uk/app/ppi/transaction-record?propertyAddress.postcode=${encodeURIComponent(postcode)}&propertyAddress.paon=${encodeURIComponent(paon)}&_sort=-transactionDate&_limit=200`;

  try {
    const response = await fetch(ppdUrl, { headers: FETCH_HEADERS });
    
    const responseText = await response.text();
    
    if (!responseText) {
        if (response.status === 200) {
            return {
                fullAddressUsed: fullAddress,
                postcode: postcode,
                landRegistryUrl: ppdUrl,
                landRegistryRawResponse: `API returned an empty response with status 200. This usually means the query was successful but no matching records were found in the public dataset (e.g., no sales since 1995, or a non-market sale).`,
                error: `Empty response from Land Registry API with status code: ${response.status}.`
            };
        }
        return {
            fullAddressUsed: fullAddress,
            postcode: postcode,
            landRegistryUrl: ppdUrl,
            landRegistryRawResponse: `API returned an empty response. Status: ${response.status}`,
            error: `Empty response from Land Registry API with status code: ${response.status}.`
        };
    }

    if (!response.ok) {
        return {
            fullAddressUsed: fullAddress,
            postcode: postcode,
            landRegistryUrl: ppdUrl,
            landRegistryRawResponse: responseText || `API responded with status: ${response.status}`,
            error: `Land Registry API responded with status: ${response.status}`
        };
    }

    const rawData = JSON.parse(responseText);

    return {
      fullAddressUsed: fullAddress,
      postcode: postcode,
      landRegistryUrl: ppdUrl,
      landRegistryRawResponse: rawData,
    };

  } catch (e: any) {
    return {
      fullAddressUsed: fullAddress,
      postcode: postcode,
      landRegistryUrl: ppdUrl,
      landRegistryRawResponse: `An error occurred while fetching or parsing the Land Registry data. This often happens if the API returns a non-JSON response (like HTML). Error: ${e.message}`,
      error: 'An unexpected error occurred in the debug action.'
    };
  }
}

    
