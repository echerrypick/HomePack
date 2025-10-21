
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
export async function fetchPropertyData(address: Address): Promise<{data: PropertyData, logs: string[]}> {
  const logs: string[] = [];
  // logs.push(`[START] Fetching data for: ${address.street}, ${address.town}, ${address.postcode}`);
  
  const endpoint = "https://landregistry.data.gov.uk/landregistry/query";

  // --- Normalise input ---
  const postcode = address.postcode.trim().toUpperCase();
  const streetInput = address.street.trim();
  
  let paon = ''; // Primary Addressable Object Name (building number/name)
  let street = '';

  // Improved logic to split building identifier from street name
  const paonMatch = streetInput.match(/^(\d+[a-zA-Z]?(-\d+[a-zA-Z]?)?)/); // Matches "10", "10a", "10-12", "10a-12b"
  if (paonMatch) {
    paon = paonMatch[1];
    street = streetInput.substring(paonMatch[0].length).trim();
  } else {
    // Fallback for non-numeric names like 'The Cottage'
    const streetParts = streetInput.split(' ');
    if (streetParts.length > 1) {
        paon = streetParts[0];
        street = streetParts.slice(1).join(' ');
    } else {
        street = streetInput;
    }
  }


  // logs.push(`[NORMALIZE] Postcode for query: "${postcode}"`);
  // logs.push(`[NORMALIZE] PAON for query: "${paon}"`);
  // logs.push(`[NORMALIZE] Street for query: "${street}"`);


  // Helper to safely send SPARQL queries
  async function sendQuery(sparqlQuery: string) {
    // logs.push(`[QUERY] Sending SPARQL query:\n${sparqlQuery}`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/sparql-results+json",
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`,
      });

      if (!res.ok) {
        const errorText = await res.text();
        // logs.push(`[ERROR] Land Registry request failed: ${res.status}. Response: ${errorText}`);
        throw new Error(`Land Registry request failed: ${res.status}`);
      }
      const data = await res.json();
      // logs.push(`[RESPONSE] Raw JSON response:\n${JSON.stringify(data, null, 2)}`);
      return data.results?.bindings || [];
    } catch (err: any) {
      // logs.push(`[FATAL] SPARQL fetch error: ${err.message}`);
      console.error("❌ SPARQL fetch error:", err);
      return [];
    }
  }

  const makeQuery = () => {
    // Use the final, correct query structure
    return `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?pricePaid ?transactionDate ?estateType ?paon ?street ?postcode ?town ?locality ?district ?county
      WHERE {
        ?transx a lrppi:TransactionRecord ;
                lrppi:pricePaid ?pricePaid ;
                lrppi:transactionDate ?transactionDate ;
                lrppi:propertyAddress ?addrURI ;
                lrppi:estateType ?estateTypeURI .
        ?addrURI lrcommon:postcode ?postcode ;
                 lrcommon:paon ?paon ;
                 lrcommon:street ?street .

        OPTIONAL { ?addrURI lrcommon:town ?town . }
        OPTIONAL { ?addrURI lrcommon:locality ?locality . }
        OPTIONAL { ?addrURI lrcommon:district ?district . }
        OPTIONAL { ?addrURI lrcommon:county ?county . }

        FILTER (
          regex(?postcode, "^${postcode}$", "i") && 
          regex(?paon, "^${paon}$", "i") && 
          regex(?street, "^${street}$", "i")
        )

        ?estateTypeURI rdfs:label ?estateType .
      }
      ORDER BY DESC(?transactionDate)
      LIMIT 10
    `;
  }
  
  // logs.push('[ATTEMPT] Querying with component regex filters.');
  let results = await sendQuery(makeQuery());

  // --- Format result ---
  const formattedResults = results.map((r: any) => {
    // Reconstruct the address string for display
    const addressParts = [
        r.paon?.value,
        r.street?.value,
        r.town?.value,
        r.locality?.value,
        r.district?.value,
        r.county?.value,
        r.postcode?.value
    ];
    const addressString = addressParts.filter(Boolean).join(', ');

    return {
      pricePaid: r.pricePaid?.value,
      transactionDate: r.transactionDate?.value,
      estateType: r.estateType?.value,
      addressString: addressString,
    }
  });

  // logs.push(`[FORMAT] Formatted ${formattedResults.length} results.`);

  const propertyData: PropertyData = {
    address: `${address.street}, ${address.town}, ${address.postcode}`,
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

  // logs.push(`[END] Returning property data object.`);
  return { data: propertyData, logs };
}



// --- Main Server Actions ---

export async function getPropertyReport(address: Address): Promise<{ propertyData: PropertyData, summary: string, logs: string[], error?: string }> {
  console.log(`[SERVER] getPropertyReport called for: ${address.street}, ${address.postcode}`);
  
  const { data: propertyData, logs } = await fetchPropertyData(address);
  
  console.log('[SERVER] Data received from fetchPropertyData inside getPropertyReport:', JSON.stringify(propertyData, null, 2));

  try {
    const summaryResult = await generateAiSummary({
      propertyData: JSON.stringify(propertyData, null, 2),
    });
    
    console.log('[SERVER] getPropertyReport is returning SUCCESS with updated data.');
    return {
      propertyData: propertyData,
      summary: summaryResult.summary,
      logs,
    };
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    console.log('[SERVER] getPropertyReport is returning FAILURE but still with property data.');
    return {
      propertyData,
      summary: "AI summary could not be generated at this time. Please review the property data manually.",
      logs,
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


// --- Step-by-Step Debug Action ---

export async function getStepByStepDebugInfo(address: Address): Promise<any> {
  const endpoint = "https://landregistry.data.gov.uk/landregistry/query";
  const postcode = address.postcode.trim().toUpperCase();
  const streetInput = address.street.trim();

  let paon = '';
  let street = '';
  const paonMatch = streetInput.match(/^(\d+[a-zA-Z]?(-\d+[a-zA-Z]?)?)/);
  if (paonMatch) {
    paon = paonMatch[1];
    street = streetInput.substring(paonMatch[0].length).trim();
  } else {
    const streetParts = streetInput.split(' ');
    if (streetParts.length > 1) {
      paon = streetParts[0];
      street = streetParts.slice(1).join(' ');
    } else {
      street = streetInput;
    }
  }
  
  const query1 = `
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
      ?addrURI lrcommon:address ?addressString ;
               lrcommon:postcode ?postcodeValue .
      FILTER(regex(?postcodeValue, "${postcode.replace(/\s+/g, '')}", "i"))
      ?estateTypeURI rdfs:label ?estateType .
    } ORDER BY DESC(?transactionDate) LIMIT 10`;

  const query2 = `
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
      ?addrURI lrcommon:address ?addressString ;
               lrcommon:postcode ?postcodeValue .
      FILTER (
        regex(?addressString, "${street}", "i") && 
        regex(?postcodeValue, "${postcode.replace(/\s+/g, '')}", "i")
      )
      ?estateTypeURI rdfs:label ?estateType .
    } ORDER BY DESC(?transactionDate) LIMIT 10`;
  
  const query3 = `
      PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?pricePaid ?transactionDate ?estateType ?paon ?street ?postcode ?town ?locality ?district ?county
      WHERE {
        ?transx a lrppi:TransactionRecord ;
                lrppi:pricePaid ?pricePaid ;
                lrppi:transactionDate ?transactionDate ;
                lrppi:propertyAddress ?addrURI ;
                lrppi:estateType ?estateTypeURI .
        ?addrURI lrcommon:postcode ?postcode ;
                 lrcommon:paon ?paon ;
                 lrcommon:street ?street .

        OPTIONAL { ?addrURI lrcommon:town ?town . }
        OPTIONAL { ?addrURI lrcommon:locality ?locality . }
        OPTIONAL { ?addrURI lrcommon:district ?district . }
        OPTIONAL { ?addrURI lrcommon:county ?county . }

        FILTER (
          regex(?postcode, "^${postcode}$", "i") && 
          regex(?paon, "^${paon}$", "i") && 
          regex(?street, "^${street}$", "i")
        )

        ?estateTypeURI rdfs:label ?estateType .
      }
      ORDER BY DESC(?transactionDate)
      LIMIT 10
    `;

  async function sendQuery(sparqlQuery: string) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/sparql-results+json" },
        body: `query=${encodeURIComponent(sparqlQuery)}`,
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { query: sparqlQuery, error: `Request failed: ${res.status} - ${errorText}` };
      }
      const data = await res.json();
      return { query: sparqlQuery, response: data };
    } catch (err: any) {
      return { query: sparqlQuery, error: err.message };
    }
  }

  const [result1, result2, result3] = await Promise.all([
    sendQuery(query1),
    sendQuery(query2),
    sendQuery(query3)
  ]);

  return { result1, result2, result3 };
}
