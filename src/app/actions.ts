
'use server';

import { config } from 'dotenv';
config();

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define types for the data we expect from the APIs
export type Address = {
  street: string;
  town: string;
  postcode: string;
}

export type LandRegistryResult = {
  pricePaid: string;
  transactionDate: string;
  estateType: string;
  addressString: string;
}

export type PropertyData = {
  address: string;
  landRegistry: LandRegistryResult[];
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
async function fetchPropertyData(address: Address): Promise<PropertyData> {
  const fullAddress = `${address.street}, ${address.town}, ${address.postcode}`;
  console.log(`[SERVER] fetchPropertyData called for: ${fullAddress}`);
  
  const endpoint = "https://landregistry.data.gov.uk/landregistry/query";

  // --- Normalise input ---
  const postcode = address.postcode.trim().toUpperCase();
  const streetName = address.street.replace(/\d/g, "").replace(/flat/i, "").trim();

  // Helper to safely send SPARQL queries
  async function sendQuery(sparqlQuery: string) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/sparql-results+json",
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`,
      });

      if (!res.ok) throw new Error(`Land Registry request failed: ${res.status}`);
      const data = await res.json();
      return data.results?.bindings || [];
    } catch (err) {
      console.error("❌ SPARQL fetch error:", err);
      return [];
    }
  }

  // --- Base SPARQL query template ---
  const makeQuery = (includeHouse: boolean) => `
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?pricePaid ?transactionDate ?estateType ?addressString
    WHERE {
      ?transx a lrppi:TransactionRecord ;
              lrppi:pricePaid ?pricePaid ;
              lrppi:transactionDate ?transactionDate ;
              lrppi:propertyAddress ?addrURI ;
              lrppi:estateType ?estateTypeURI .
      ?addrURI lrcommon:postcode "${postcode}" ;
               lrcommon:street "${streetName}" ;
               lrcommon:address ?addressString .
      ${includeHouse ? `FILTER regex(str(?addressString), "${address.street.split(" ")[0]}", "i")` : ""}
      ?estateTypeURI rdfs:label ?estateType .
    }
    ORDER BY DESC(?transactionDate)
    LIMIT 10
  `;

  // --- 1️⃣ Attempt: exact address with house number ---
  let results = await sendQuery(makeQuery(true));

  // --- 2️⃣ Fallback: same street, no house number ---
  if (results.length === 0) {
    console.warn("⚠️ No exact match found — retrying without house number...");
    results = await sendQuery(makeQuery(false));
  }

  // --- Format result ---
  const formattedResults = results.map((r: any) => ({
    pricePaid: r.pricePaid?.value,
    transactionDate: r.transactionDate?.value,
    estateType: r.estateType?.value,
    addressString: r.addressString?.value,
  }));

  const propertyData: PropertyData = {
    address: fullAddress,
    landRegistry: formattedResults,
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

  console.log('[SERVER] fetchPropertyData is returning this property object:', JSON.stringify(propertyData, null, 2));
  return propertyData;
}


// --- Main Server Actions ---

export async function getPropertyReport(address: Address): Promise<{ propertyData: PropertyData, summary: string, error?: string }> {
  console.log(`[SERVER] getPropertyReport called for: ${address.street}, ${address.postcode}`);
  
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
  const fullAddress = `${address.street}, ${address.town}, ${address.postcode}`;
  const { street, postcode } = address;

  if (!street || !postcode) {
    return {
      fullAddressUsed: fullAddress || 'No address provided',
      postcode: postcode || 'N/A',
      sparqlQuery: 'Could not be constructed.',
      landRegistryRawResponse: 'Street or Postcode was missing.',
      error: 'Street or Postcode was missing.'
    };
  }
  
  const streetName = street.replace(/[0-9]/g, '').replace(/flat/i, '').trim();

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
               lrcommon:street "${streetName}" ;
               lrcommon:address ?addressString .
      
      ?estateTypeURI rdfs:label ?estateType .
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
