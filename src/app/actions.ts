
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

export type DebugStep = {
  title: string;
  query: string;
  response: any;
  error?: string;
};

export type StepByStepDebugInfo = DebugStep[];

export async function getStepByStepDebugInfo(address: Address): Promise<StepByStepDebugInfo> {
  const endpoint = "https://landregistry.data.gov.uk/landregistry/query";
  const postcode = address.postcode.trim().toUpperCase();
  const streetName = address.street.replace(/\d/g, "").replace(/flat/i, "").trim();
  const houseNumber = address.street.split(" ")[0];

  const queries = {
    step1: `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?addressString ?pricePaid ?transactionDate
      WHERE {
        ?transx a lrppi:TransactionRecord ;
                lrppi:pricePaid ?pricePaid ;
                lrppi:transactionDate ?transactionDate ;
                lrppi:propertyAddress ?addrURI .
        ?addrURI lrcommon:postcode "${postcode}" ;
                 lrcommon:address ?addressString .
      } ORDER BY DESC(?transactionDate) LIMIT 3`,
    step2: `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?addressString ?pricePaid ?transactionDate
      WHERE {
        ?transx a lrppi:TransactionRecord ;
                lrppi:pricePaid ?pricePaid ;
                lrppi:transactionDate ?transactionDate ;
                lrppi:propertyAddress ?addrURI .
        ?addrURI lrcommon:postcode "${postcode}" ;
                 lrcommon:street "${streetName}" ;
                 lrcommon:address ?addressString .
      } ORDER BY DESC(?transactionDate) LIMIT 3`,
    step3: `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?addressString ?pricePaid ?transactionDate
      WHERE {
        ?transx a lrppi:TransactionRecord ;
                lrppi:pricePaid ?pricePaid ;
                lrppi:transactionDate ?transactionDate ;
                lrppi:propertyAddress ?addrURI .
        ?addrURI lrcommon:postcode "${postcode}" ;
                 lrcommon:street "${streetName}" ;
                 lrcommon:address ?addressString .
        FILTER regex(str(?addressString), "${houseNumber}", "i")
      } ORDER BY DESC(?transactionDate) LIMIT 3`,
  };

  const debugInfo: StepByStepDebugInfo = [];

  async function runQuery(title: string, query: string) {
    const step: DebugStep = { title, query, response: null };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/sparql-results+json'
        },
        body: `query=${encodeURIComponent(query)}`
      });
      const responseText = await response.text();
      try {
        step.response = JSON.parse(responseText);
      } catch (e) {
        step.response = `Status: ${response.status}. Response Body: ${responseText}`;
        step.error = "Response was not valid JSON.";
      }
      if (!response.ok) {
        step.error = `API responded with status: ${response.status}`;
      }
    } catch (e: any) {
      step.response = `Fetch failed: ${e.message}`;
      step.error = 'An unexpected error occurred during fetch.';
    }
    debugInfo.push(step);
  }

  await runQuery("Step 1: Postcode Only", queries.step1);
  await runQuery("Step 2: Postcode + Street", queries.step2);
  await runQuery("Step 3: Full Query (Postcode + Street + House Number)", queries.step3);
  
  return debugInfo;
}
