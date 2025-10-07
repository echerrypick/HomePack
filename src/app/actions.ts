'use server';

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define interfaces for the data we expect from the APIs
export interface Address {
  id: string; // This will be the UDPRN from OS Places
  address: string; // The full address string
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
  
  console.log(`[SERVER] Fetching addresses for postcode: ${postcode} from URL: ${url}`);

  try {
    const response = await fetch(url);
    
    console.log(`[SERVER] API Response Status: ${response.status}`);

    if (response.status === 401) {
        throw new Error("The address lookup API key is invalid. Please check your OS_NAMES_API_KEY in the .env file.");
    }
    if (!response.ok) {
        const errorText = await response.text();
        console.error("[SERVER] API Error Response Text:", errorText);
        throw new Error(`Failed to fetch addresses. The API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[SERVER] Raw API data received:', JSON.stringify(data, null, 2));

    if (!data.results) {
      console.log('[SERVER] No results found in API response.');
      return [];
    }
    
    const mappedAddresses = data.results
        .filter((hit: any) => hit.GAZETTEER_ENTRY)
        .map((hit: any) => {
            const gazetteerEntry = hit.GAZETTEER_ENTRY;
            return {
                id: gazetteerEntry.ID.toString(),
                address: gazetteerEntry.ADDRESS,
                line1: gazetteerEntry.NAME1,
                town: gazetteerEntry.POST_TOWN,
                postcode: gazetteerEntry.POSTCODE,
            };
    });

    console.log('[SERVER] Mapped addresses:', JSON.stringify(mappedAddresses, null, 2));
    return mappedAddresses;

  } catch (error: any) {
    console.error("[SERVER] Error in fetchAddressesFromPostcode:", error.message);
    // Re-throw a more user-friendly error or the specific error from the try block
    throw new Error(error.message || "There was a problem fetching addresses. Please check the postcode and try again.");
  }
}


async function fetchPropertyData(addressId: string, fullAddress: string): Promise<PropertyData> {
    // In a real app, you'd call various APIs here using the addressId (UDPRN).
    // For demonstration, we'll return mock data.
    console.log(`Fetching real data for ${fullAddress} (ID: ${addressId})`);
    
    // --- Land Registry API Call ---
    const landRegApiKey = process.env.LAND_REG_API_KEY;
    if (!landRegApiKey) throw new Error('Land Registry API key not configured.');
    // MOCK: Replace with actual API call
    const landRegistryData = {
        titleNumber: 'NGL123456',
        tenure: 'Freehold',
        pricePaid: '£250,000',
        date: '2022-01-15',
    };

    // --- EPC API Call ---
    const epcApiKey = process.env.EPC_API_KEY;
    if (!epcApiKey) throw new Error('EPC API key not configured.');
    // MOCK: Replace with actual API call
    const epcData = {
        rating: 'B' as const,
        potentialRating: 'A' as const,
        validUntil: '2032-06-20',
        energyUse: 85,
    };

    // --- Flood Risk API Call ---
    const floodApiKey = process.env.FLOOD_API_KEY;
    if(!floodApiKey) throw new Error('Flood Risk API key not configured.');
     // MOCK: Replace with actual API call
    const floodRiskData = {
        riverAndSea: 'Low',
        surfaceWater: 'Very Low',
    };

    // --- Planning API Call ---
    const planningApiKey = process.env.PLANNING_API_KEY;
    if(!planningApiKey) throw new Error('Planning API key not configured.');
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
    const report = await getPropertyReport(selectedAddressId, selectedAddress.address);
    return { status: 'report_ready', report, address: selectedAddress };
  } else {
    // Stage 1: Postcode search
    if (addresses.length > 1) {
      // Multiple addresses found, user needs to select one
      return { status: 'address_selection', addresses: addresses };
    }

    // If only one address, proceed directly to generating the report
    const address = addresses[0];
    const report = await getPropertyReport(address.id, address.address);
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
