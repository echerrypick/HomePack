'use server';

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define interfaces for the data we expect from the APIs
export interface Address {
  id: string; // This will be the UDPRN from OS Places
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

// --- API Calls ---

async function fetchAddressesFromPostcode(postcode: string): Promise<Address[]> {
  const apiKey = process.env.OS_NAMES_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error("Address lookup API key is not configured. Please add OS_NAMES_API_KEY to your .env file.");
  }
  const url = `https://api.os.uk/search/names/v1/find?key=${apiKey}&query=${encodeURIComponent(postcode)}`;

  try {
    const response = await fetch(url);

    if (response.status === 404) {
        throw new Error("Invalid postcode. Please check and try again.");
    }
    if (response.status === 401) {
        throw new Error("The address lookup API key is invalid. Please check your OS_NAMES_API_KEY in the .env file.");
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch addresses. The API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    // Map the API response to our Address interface
    return data.results.map((hit: any) => {
        const dpa = hit.GAZETTEER_ENTRY;
        return {
            id: dpa.ID.toString(),
            line1: dpa.NAME1,
            town: dpa.POST_TOWN,
            postcode: dpa.POSTCODE,
        };
    });
  } catch (error: any) {
    console.error("Error fetching addresses:", error.message);
    // Re-throw a more user-friendly error or the specific error from the try block
    throw new Error(error.message || "There was a problem fetching addresses. Please check the postcode and try again.");
  }
}

async function fetchPropertyData(addressId: string, fullAddress: string): Promise<PropertyData> {
    // In a real app, you'd call various APIs here using the addressId (UDPRN).
    
    // --- Land Registry API Call ---
    const landRegApiKey = process.env.LAND_REG_API_KEY;
    if (!landRegApiKey) throw new Error('Land Registry API key not configured.');
    const landRegistryResponse = await fetch(`https://land-registry-api.com/properties/${addressId}`, { headers: { 'Authorization': `Bearer ${landRegApiKey}` } });
    if(!landRegistryResponse.ok) throw new Error('Failed to fetch Land Registry data.');
    const landRegistryData = await landRegistryResponse.json();

    // --- EPC API Call ---
    const epcApiKey = process.env.EPC_API_KEY;
    if (!epcApiKey) throw new Error('EPC API key not configured.');
    const epcResponse = await fetch(`https://epc-api.com/properties/${addressId}`, { headers: { 'Authorization': `Bearer ${epcApiKey}` } });
    if(!epcResponse.ok) throw new Error('Failed to fetch EPC data.');
    const epcData = await epcResponse.json();

    // --- Flood Risk API Call ---
    const floodApiKey = process.env.FLOOD_API_KEY;
    if(!floodApiKey) throw new Error('Flood Risk API key not configured.');
    const floodRiskResponse = await fetch(`https://environment-agency-api.com/flood-risk/${addressId}`, { headers: { 'Authorization': `Bearer ${floodApiKey}` } });
    if(!floodRiskResponse.ok) throw new Error('Failed to fetch Flood Risk data.');
    const floodRiskData = await floodRiskResponse.json();

    // --- Planning API Call ---
    const planningApiKey = process.env.PLANNING_API_KEY;
    if(!planningApiKey) throw new Error('Planning API key not configured.');
    const planningResponse = await fetch(`https://planning-data-api.com/applications/${addressId}`, { headers: { 'Authorization': `Bearer ${planningApiKey}` } });
    if(!planningResponse.ok) throw new Error('Failed to fetch Planning History data.');
    const planningHistoryData = await planningResponse.json();
    

    return {
        address: fullAddress,
        landRegistry: landRegistryData,
        epc: epcData,
        floodRisk: floodRiskData,
        planningHistory: planningHistoryData,
    };
}


// --- Main Server Action ---

async function getPropertyReport(addressId: string, fullAddress: string): Promise<{ propertyData: PropertyData, summary: string }> {
  const propertyData = await fetchPropertyData(addressId, fullAddress);

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

  if (!postcode) {
    throw new Error('Postcode is required');
  }

  const addresses = await fetchAddressesFromPostcode(postcode);
  if (addresses.length === 0) {
      throw new Error("No addresses found for this postcode.");
  }
      
  if (selectedAddressId) {
    // Stage 2: Address selected, get the report
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    
    if (!selectedAddress) {
      throw new Error("Invalid address ID selected.");
    }
    const fullAddress = `${selectedAddress.line1}, ${selectedAddress.town}, ${selectedAddress.postcode}`;
    const report = await getPropertyReport(selectedAddressId, fullAddress);
    return { status: 'report_ready', report, address: selectedAddress };
  } else {
    // Stage 1: Postcode search
    if (addresses.length > 1) {
      // Multiple addresses found, user needs to select one
      return { status: 'address_selection', addresses: addresses };
    }

    // If only one address, proceed directly to generating the report
    const address = addresses[0];
    const fullAddress = `${address.line1}, ${address.town}, ${address.postcode}`;
    const report = await getPropertyReport(address.id, fullAddress);
    return { status: 'report_ready', report, address };
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
