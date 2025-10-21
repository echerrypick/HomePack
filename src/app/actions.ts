
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

function parseAddress(fullAddress: string): { paon: string, street: string, postcode: string } | null {
    const addressParts = fullAddress.split(',').map(p => p.trim());
    const postcode = addressParts[addressParts.length - 1];

    if (!/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i.test(postcode)) {
        console.error("Could not parse postcode from address:", fullAddress);
        return null;
    }

    const paon = addressParts[0];
    const street = addressParts.slice(1, -2).join(', '); // simplistic street extraction

    return { paon, street, postcode };
}


async function fetchPropertyData(address: Address): Promise<PropertyData> {
  const fullAddress = address.address;
  console.log(`[SERVER] fetchPropertyData called for: ${fullAddress}`);

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
    const postcode = address.postcode;
    if (!postcode) {
        console.log('[SERVER] No postcode provided for address:', fullAddress);
        propertyData.landRegistry.pricePaid = 'Could not find postcode in address.';
        return propertyData;
    }
    
    // Use the first line of the address as the PAON (Primary Addressable Object Name)
    const firstLine = fullAddress.split(',')[0].trim().toUpperCase();

    const sparqlQuery = `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      
      SELECT ?pricePaid ?transactionDate ?estateType
      WHERE {
        ?transx a lrppi:TransactionRecord ;
              lrppi:pricePaid ?pricePaid ;
              lrppi:transactionDate ?transactionDate ;
              lrppi:propertyAddress ?addrURI ;
              lrppi:estateType ?estateTypeURI.

        ?addrURI lrcommon:postcode "${postcode}" ;
                 lrcommon:address ?addressString .
        
        ?estateTypeURI rdfs:label ?estateType .

        FILTER(CONTAINS(UCASE(STR(?addressString)), "${firstLine}"))
      }
      ORDER BY DESC(?transactionDate)
      LIMIT 1
    `;
    
    const response = await fetch("https://landregistry.data.gov.uk/landregistry/query", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
        },
        body: new URLSearchParams({ query: sparqlQuery })
    });
    
    if (response.ok) {
        const json = await response.json();
        const results = json.results?.bindings;
        if (results && results.length > 0) {
            const latestTransaction = results[0];
            propertyData.landRegistry = {
                titleNumber: 'N/A', // Title number is not in this dataset
                tenure: latestTransaction.estateType?.value || 'Data not found',
                pricePaid: `£${parseInt(latestTransaction.pricePaid?.value, 10).toLocaleString()}`,
                date: latestTransaction.transactionDate?.value,
            };
        } else {
            console.log('[SERVER] No matching transaction found for address via SPARQL:', firstLine);
            propertyData.landRegistry.pricePaid = 'No recent sales data found';
        }
    } else {
        const errorText = await response.text();
        console.error(`[SERVER] Land Registry SPARQL Error: ${response.status} - ${errorText}`);
        propertyData.landRegistry.pricePaid = `Error fetching sales data. Raw Response: ${errorText}`;
    }

  } catch (error: any) {
    console.error('[SERVER] Error fetching Land Registry data via SPARQL:', error.message);
    propertyData.landRegistry.pricePaid = `Error fetching sales data: ${error.message}`;
  }

  console.log('[SERVER] fetchPropertyData is returning this property object:', JSON.stringify(propertyData, null, 2));
  return propertyData;
}


// --- Main Server Actions ---

export async function getAddressSuggestions(query: string): Promise<Address[]> {
  return fetchAddressesFromQuery(query);
}

export async function getPropertyReport(address: Address): Promise<{ propertyData: PropertyData, summary: string, error?: string }> {
  console.log(`[SERVER] getPropertyReport called for: ${address.address}`);
  
  const propertyData = await fetchPropertyData(address);
  
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
  postcode: string | null;
  sparqlQuery: string;
  landRegistryRawResponse: any;
  error?: string;
}

export async function getDebugInfo(address: Address): Promise<DebugInfo> {
  const fullAddress = address.address;
  const postcode = address.postcode || null;

  if (!fullAddress || !postcode) {
    return {
      fullAddressUsed: fullAddress || 'No address provided',
      postcode: postcode || 'N/A',
      sparqlQuery: 'Could not be constructed.',
      landRegistryRawResponse: 'Could not find postcode from Mapbox API response. Therefore, could not query Land Registry.',
      error: 'Could not find postcode from Mapbox API response.'
    };
  }
  
  const firstLine = fullAddress.split(',')[0].trim().toUpperCase();

  const sparqlQuery = `
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?addressString ?pricePaid ?transactionDate ?estateType
    WHERE {
      ?transx a lrppi:TransactionRecord ;
            lrppi:pricePaid ?pricePaid ;
            lrppi:transactionDate ?transactionDate ;
            lrppi:propertyAddress ?addrURI ;
            lrppi:estateType ?estateTypeURI.

      ?addrURI lrcommon:postcode "${postcode}" ;
                lrcommon:address ?addressString .
      
      ?estateTypeURI rdfs:label ?estateType .

      FILTER(CONTAINS(UCASE(STR(?addressString)), "${firstLine}"))
    }
    ORDER BY DESC(?transactionDate)
    LIMIT 10
  `;

  try {
    const response = await fetch("https://landregistry.data.gov.uk/landregistry/query", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/sparql-results+json'
        },
        body: new URLSearchParams({ query: sparqlQuery })
    });
    
    const responseText = await response.text();
    let rawData: any = `Status: ${response.status}. Response Body: ${responseText}`;

    try {
        rawData = JSON.parse(responseText);
    } catch (e) {
        console.log("Response was not JSON, showing raw text.");
    }

    if (!response.ok) {
        return {
            fullAddressUsed: fullAddress,
            postcode: postcode,
            sparqlQuery: sparqlQuery,
            landRegistryRawResponse: rawData,
            error: `Land Registry API responded with status: ${response.status}`
        };
    }

    return {
      fullAddressUsed: fullAddress,
      postcode: postcode,
      sparqlQuery: sparqlQuery,
      landRegistryRawResponse: rawData,
    };

  } catch (e: any) {
    return {
      fullAddressUsed: fullAddress,
      postcode: postcode,
      sparqlQuery: sparqlQuery,
      landRegistryRawResponse: `An error occurred while fetching the Land Registry data. Error: ${e.message}`,
      error: 'An unexpected error occurred in the debug action.'
    };
  }
}
