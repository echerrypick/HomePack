'use server';

import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
import { generateAiConditionReport } from '@/ai/flows/generate-ai-condition-report';

// Define interfaces for the data we expect from the APIs
export interface Address {
  id: string; // This will be the UDPRN from Ideal Postcodes
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
  const apiKey = process.env.IDEAL_POSTCODES_API_KEY;
  if (!apiKey) {
    throw new Error("Address lookup API key is not configured.");
  }
  const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch addresses from postcode.");
  }
  const data = await response.json();

  if (data.code !== 2000) {
    throw new Error(data.message || "Could not retrieve addresses.");
  }

  // Map the API response to our Address interface
  return data.result.hits.map((hit: any) => ({
    id: hit.udprn,
    line1: hit.line_1,
    town: hit.post_town,
    postcode: hit.postcode,
  }));
}

async function fetchPropertyData(addressId: string, fullAddress: string): Promise<PropertyData> {
    // In a real app, you'd call various APIs here using the addressId (UDPRN).
    // For this example, we'll simulate this by calling mock-style functions.
    // In a full implementation, each of these would be a `fetch` call.
    
    // Simulate fetching data from various sources
    const landRegistryData = { titleNumber: 'NGL123456', tenure: 'Leasehold', pricePaid: '£750,000', date: '2022-08-15' };
    const epcData = { rating: 'C', potentialRating: 'B', validUntil: '2030-01-01', energyUse: 95 };
    const floodRiskData = { riverAndSea: 'Low', surfaceWater: 'Very Low' };
    const planningHistoryData = [{ application: 'Rear extension', decision: 'Approved', date: '2019-05-20' }];

    // You would replace the above with actual fetch calls to your APIs:
    // const landRegistryData = await fetch(`https://land-registry-api.com/properties/${addressId}`, { headers: { 'Authorization': `Bearer ${process.env.LAND_REG_API_KEY}` } }).then(res => res.json());
    // ... and so on for EPC, Flood Risk, etc.

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
    if (!postcode) {
      throw new Error('Postcode is required');
    }
    
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
