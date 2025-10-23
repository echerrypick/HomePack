

'use server';

import { config } from 'dotenv';
config();
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';


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

export type EpcData = {
    address1: string;
    address2: string;
    address3: string;
    posttown: string;
    postcode: string;
    county: string;
    lodgementDate: string;
    inspectionDate: string;
    rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    potentialRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    propertyType: string;
    tenure: string;
    uprn: string;
    buildingReferenceNumber: string;
    constructionAgeBand: string;
    localAuthorityLabel: string;
    totalFloorArea: string;
    mainheatcontDescription: string;
    reportType: string;
    energyTariff: string;
    mechanicalVentilation: string;
    co2EmissCurrPerFloorArea: string;
    mainsGasFlag: string;
    constituencyLabel: string;
    mainFuel: string;
    lightingDescription: string;
    multiGlazeProportion: string;
    mainHeatingControls: string;
    secondheatDescription: string;
    transactionType: string;
    lowEnergyLighting: string;
    hotwaterDescription: string;
    builtForm: string;
    currentEnergyEfficiency: string;
    potentialEnergyEfficiency: string;
    mainHeatDescription: string;
    wallsDescription: string;
    roofDescription: string;
    windowsDescription: string;
    co2EmissionsCurrent: string;
    co2EmissionsPotential: string;
    heatingCostCurrent: string;
    heatingCostPotential: string;
    hotWaterCostCurrent: string;
    hotWaterCostPotential: string;
    lightingCostCurrent: string;
    lightingCostPotential: string;
    energyConsumptionCurrent: string;
    energyConsumptionPotential: string;
    floorDescription: string;
    roofEnergyEff: string;
    windowsEnergyEff: string;
    wallsEnergyEff: string;
    hotWaterEnergyEff: string;
    lightingEnergyEff: string;
    numberHabitableRooms: string;
    numberHeatedRooms: string;
  } | null;

  export type FloodRiskData = {
    postcode: string;
    riskOfFloodingFromRiversAndSea: string;
    suitability: string;
    publishDate: string;
  } | null;
  

export type PropertyData = {
  address: string;
  landRegistry: LandRegistryResult[];
  epc: EpcData;
  floodRisk: FloodRiskData;
  planningHistory: {
    application: string;
    decision: string;
    date: string;
  }[];
}

async function fetchEpcData(address: Address): Promise<{data: EpcData, logs: string[]}> {
    const logs: string[] = [];
    const endpoint = "https://epc.opendatacommunities.org/api/v1/domestic/search";
    const url = `${endpoint}?postcode=${encodeURIComponent(address.postcode)}&address=${encodeURIComponent(address.street)}&size=1`;
    // logs.push(`[EPC] Fetching from: ${url}`);
    
    const headers: HeadersInit = {
        "Accept": "application/json",
    };

    if (process.env.EPC_ENCODED_TOKEN) {
        headers["Authorization"] = `Basic ${process.env.EPC_ENCODED_TOKEN}`;
        // logs.push("[EPC] Using Basic authentication with encoded token.");
    } else {
        // logs.push("[EPC] No API credentials found, making unauthenticated request.");
    }

    try {
        const res = await fetch(url, { headers });

        if (!res.ok) {
            // logs.push(`[EPC ERROR] API request failed with status: ${res.status}`);
            const errorText = await res.text();
            // logs.push(`[EPC ERROR] Response: ${errorText}`);
            return { data: null, logs };
        }

        const data = await res.json();
        // logs.push(`[EPC RESPONSE] Raw JSON response:\n${JSON.stringify(data, null, 2)}`);

        if (data.rows && data.rows.length > 0) {
            const latestEpc = data.rows[0]; // API returns most recent first
            const formattedEpc: EpcData = {
                address1: latestEpc['address1'],
                address2: latestEpc['address2'],
                address3: latestEpc['address3'],
                posttown: latestEpc['posttown'],
                postcode: latestEpc['postcode'],
                county: latestEpc['county'],
                lodgementDate: latestEpc['lodgement-date'],
                inspectionDate: latestEpc['inspection-date'],
                rating: latestEpc['current-energy-rating'],
                potentialRating: latestEpc['potential-energy-rating'],
                propertyType: latestEpc['property-type'],
                tenure: latestEpc['tenure'],
                uprn: latestEpc['uprn'],
                buildingReferenceNumber: latestEpc['building-reference-number'],
                constructionAgeBand: latestEpc['construction-age-band'],
                localAuthorityLabel: latestEpc['local-authority-label'],
                totalFloorArea: latestEpc['total-floor-area'],
                mainheatcontDescription: latestEpc['mainheatcont-description'],
                reportType: latestEpc['report-type'],
                energyTariff: latestEpc['energy-tariff'],
                mechanicalVentilation: latestEpc['mechanical-ventilation'],
                co2EmissCurrPerFloorArea: latestEpc['co2-emiss-curr-per-floor-area'],
                mainsGasFlag: latestEpc['mains-gas-flag'],
                constituencyLabel: latestEpc['constituency-label'],
                mainFuel: latestEpc['main-fuel'],
                lightingDescription: latestEpc['lighting-description'],
                multiGlazeProportion: latestEpc['multi-glaze-proportion'],
                mainHeatingControls: latestEpc['main-heating-controls'],
                secondheatDescription: latestEpc['secondheat-description'],
                transactionType: latestEpc['transaction-type'],
                lowEnergyLighting: latestEpc['low-energy-lighting'],
                hotwaterDescription: latestEpc['hotwater-description'],
                builtForm: latestEpc['built-form'],
                currentEnergyEfficiency: latestEpc['current-energy-efficiency'],
                potentialEnergyEfficiency: latestEpc['potential-energy-efficiency'],
                mainHeatDescription: latestEpc['mainheat-description'],
                wallsDescription: latestEpc['walls-description'],
                roofDescription: latestEpc['roof-description'],
                windowsDescription: latestEpc['windows-description'],
                co2EmissionsCurrent: latestEpc['co2-emissions-current'],
                co2EmissionsPotential: latestEpc['co2-emissions-potential'],
                heatingCostCurrent: latestEpc['heating-cost-current'],
                heatingCostPotential: latestEpc['heating-cost-potential'],
                hotWaterCostCurrent: latestEpc['hot-water-cost-current'],
                hotWaterCostPotential: latestEpc['hot-water-cost-potential'],
                lightingCostCurrent: latestEpc['lighting-cost-current'],
                lightingCostPotential: latestEpc['lighting-cost-potential'],
                energyConsumptionCurrent: latestEpc['energy-consumption-current'],
                energyConsumptionPotential: latestEpc['energy-consumption-potential'],
                floorDescription: latestEpc['floor-description'],
                roofEnergyEff: latestEpc['roof-energy-eff'],
                windowsEnergyEff: latestEpc['windows-energy-eff'],
                wallsEnergyEff: latestEpc['walls-energy-eff'],
                hotWaterEnergyEff: latestEpc['hot-water-energy-eff'],
                lightingEnergyEff: latestEpc['lighting-energy-eff'],
                numberHabitableRooms: latestEpc['number-habitable-rooms'],
                numberHeatedRooms: latestEpc['number-heated-rooms'],
            };
            // logs.push(`[EPC] Formatted EPC data: ${JSON.stringify(formattedEpc, null, 2)}`);
            return { data: formattedEpc, logs };
        } else {
            // logs.push("[EPC] No EPC certificate found for this address.");
            return { data: null, logs };
        }

    } catch (err: any) {
        // logs.push(`[EPC FATAL] Fetch error: ${err.message}`);
        console.error("❌ EPC fetch error:", err);
        return { data: null, logs };
    }
}

async function fetchFloodRiskData(postcode: string): Promise<{ data: FloodRiskData | null, logs: string[] }> {
    const logs: string[] = [];
    const csvFilePath = path.join(process.cwd(), 'src/data/open_flood_risk_by_postcode.csv');
    logs.push(`[FLOOD] Looking for postcode-level CSV at: ${csvFilePath}`);

    if (!postcode) {
        logs.push(`[FLOOD ERROR] No postcode provided. Cannot perform flood risk lookup.`);
        return { data: null, logs };
    }

    if (!fs.existsSync(csvFilePath)) {
        logs.push(`[FLOOD ERROR] CSV file not found.`);
        return { data: null, logs };
    }

    const results: any[] = [];
    
    return new Promise((resolve) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.postcode) {
                    results.push(row);
                }
            })
            .on('end', () => {
                logs.push(`[FLOOD] Loaded ${results.length} rows from CSV.`);
                
                const normalizedPostcode = postcode.replace(/\s+/g, '').toLowerCase();
                logs.push(`[FLOOD] Searching for normalized postcode: ${normalizedPostcode}`);
                
                // Pass 1: Exact match
                let match = results.find(row => row.postcode.replace(/\s+/g, '').toLowerCase() === normalizedPostcode);
                
                if (match) {
                    logs.push(`[FLOOD] Found exact match for postcode ${postcode}.`);
                } else {
                    // Pass 2: Wildcard match
                    logs.push(`[FLOOD] No exact match found. Searching for wildcard match.`);
                    match = results.find(row => {
                        if (row.postcode.includes('*')) {
                            const prefix = row.postcode.replace(/\s+/g, '').toLowerCase().replace('*', '');
                            return normalizedPostcode.startsWith(prefix);
                        }
                        return false;
                    });
                    if (match) {
                        logs.push(`[FLOOD] Found wildcard match for postcode ${postcode} with rule ${match.postcode}.`);
                    }
                }

                if (match) {
                    const formatted: FloodRiskData = {
                        postcode: match.postcode,
                        riskOfFloodingFromRiversAndSea: match.PROB_4BAND || 'Unknown',
                        suitability: match.SUITABILITY || 'Unknown',
                        publishDate: match.PUB_DATE || 'Unknown',
                    };
                    logs.push(`[FLOOD] Found risk for postcode ${postcode}: ${JSON.stringify(formatted)}`);
                    resolve({ data: formatted, logs });
                } else {
                    logs.push(`[FLOOD] No flood risk data found for postcode ${postcode}.`);
                    resolve({ data: null, logs });
                }
            })
            .on('error', (err) => {
                logs.push(`[FLOOD FATAL] CSV parsing error: ${err.message}`);
                resolve({ data: null, logs });
            });
    });
}



// --- API Calls ---
export async function fetchPropertyData(address: Address): Promise<{data: PropertyData, logs: string[]}> {
  const logs: string[] = [];
  // logs.push(`[START] Fetching data for: ${address.street}, ${address.town}, ${address.postcode}`);
  
  const endpoint = "https://landregistry.data.gov.uk/landregistry/query";

  const postcode = address.postcode.trim();
  const streetInput = address.street.trim();
  
  let paon = ''; 
  let street = '';

  const paonMatch = streetInput.match(/^(\d+[a-zA-Z]?(-\d+[a-zA-Z]?)?)\s+/);
  if (paonMatch) {
    paon = paonMatch[1];
    street = streetInput.substring(paonMatch[0].length).trim();
  } else {
      street = streetInput;
  }

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
  const landRegistryResults = await sendQuery(makeQuery());

  // --- Format result ---
  const formattedResults = landRegistryResults.map((r: any) => {
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

  // --- Fetch EPC Data ---
  const { data: epcData, logs: epcLogs } = await fetchEpcData(address);
  logs.push(...epcLogs);

  // --- Fetch Flood Risk Data ---
  const { data: floodRiskData, logs: floodLogs } = await fetchFloodRiskData(address.postcode);
  logs.push(...floodLogs);


  const propertyData: PropertyData = {
    address: formattedResults.length > 0 ? formattedResults[0].addressString : `${address.street}, ${address.town}, ${address.postcode}`,
    landRegistry: formattedResults,
    epc: epcData,
    floodRisk: floodRiskData,
    planningHistory: [
      { application: 'Single-storey rear extension', decision: 'Approved', date: '2019-05-10' },
    ],
  };

  // logs.push(`[END] Returning property data object.`);
  return { data: propertyData, logs };
}



// --- Main Server Actions ---

export async function getPropertyReport(address: Address): Promise<{ propertyData: PropertyData, summary: string, logs: string[], error?: string }> {
  // console.log(`[SERVER] getPropertyReport called for: ${address.street}, ${address.postcode}`);
  
  const { data: propertyData, logs } = await fetchPropertyData(address);
  
  // console.log('[SERVER] Data received from fetchPropertyData inside getPropertyReport:', JSON.stringify(propertyData, null, 2));

  try {
    const summaryResult = await generateAiSummary({
      propertyData: JSON.stringify(propertyData, null, 2),
    });
    
    // console.log('[SERVER] getPropertyReport is returning SUCCESS with updated data.');
    return {
      propertyData: propertyData,
      summary: summaryResult.summary,
      logs,
    };
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    // console.log('[SERVER] getPropertyReport is returning FAILURE but still with property data.');
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
      // console.error(`[SERVER] Invalid image URI format: ${uri}`);
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
  const postcode = address.postcode.trim();
  const streetInput = address.street.trim();

  let paon = '';
  let street = '';
  const paonMatch = streetInput.match(/^(\d+[a-zA-Z]?(-\d+[a-zA-Z]?)?)\s+/);
  if (paonMatch) {
    paon = paonMatch[1];
    street = streetInput.substring(paonMatch[0].length).trim();
  } else {
      street = streetInput;
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






    

    


