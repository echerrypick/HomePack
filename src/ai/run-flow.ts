'use server';
import { config } from 'dotenv';
config(); // Load .env file

import { generateAiSummary } from './flows/generate-ai-summary';

// Copied from src/app/actions.ts for type safety
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
    lowEnergyFixedLightCount: string | null;
    uprnSource: string | null;
    floorHeight: string | null;
    mainheatEnergyEff: string | null;
    windowsEnvEff: string | null;
    lightingEnvEff: string | null;
    environmentImpactPotential: string | null;
    glazedType: string | null;
    sheatingEnergyEff: string | null;
    fixedLightingOutletsCount: string | null;
    solarWaterHeatingFlag: string | null;
    constituency: string | null;
    localAuthority: string | null;
    numberOpenFireplaces: string | null;
    glazedArea: string | null;
    heatLossCorridor: string | null;
    flatStoreyCount: string | null;
    roofEnvEff: string | null;
    environmentImpactCurrent: string | null;
    floorEnergyEff: string | null;
    hotWaterEnvEff: string | null;
    mainheatcEnergyEff: string | null;
    wallsEnvEff: string | null;
    photoSupply: string | null;
    mainheatEnvEff: string | null;
    lodgementDatetime: string | null;
    flatTopStorey: string | null;
    extensionCount: string | null;
    mainheatcEnvEff: string | null;
    lmkKey: string | null;
    windTurbineCount: string | null;
    floorLevel: string | null;
  } | null;

export type FloodRiskData = {
    postcode: string;
    riskOfFloodingFromRiversAndSea: string;
    suitability: string;
    publishDate: string;
    easting: string;
    northing: string;
    latitude: string;
    longitude: string;
  } | null;

export type PlanningHistoryItem = {
    application: string;
    decision: string;
    date: string;
    reference: string;
    url: string;
  };


export type PropertyData = {
  address: string;
  landRegistry: LandRegistryResult[];
  epc: EpcData;
  floodRisk: FloodRiskData;
  planningHistory: PlanningHistoryItem[];
}


// This is a sample property data object.
// You can edit this to test the AI flows with different inputs.
const samplePropertyData: PropertyData = {
    address: '12, Cornmill Close, Elvaston, Thulston, DE72 3UA',
    landRegistry: [{
        pricePaid: '250000',
        transactionDate: '2018-05-20',
        estateType: 'Freehold',
        addressString: '12, Cornmill Close, Elvaston, Thulston, DE72 3UA'
    }],
    epc: {
        address1: '12, Cornmill Close',
        address2: 'Elvaston, Thulston',
        address3: '',
        posttown: 'DERBY',
        postcode: 'DE72 3UA',
        county: 'Derbyshire',
        lodgementDate: '2013-01-25',
        inspectionDate: '2013-01-25',
        rating: 'D',
        potentialRating: 'C',
        propertyType: 'House',
        tenure: 'owner-occupied',
        uprn: '200003148315',
        buildingReferenceNumber: '7428554078',
        constructionAgeBand: 'England and Wales: 1991-1995',
        localAuthorityLabel: 'South Derbyshire',
        totalFloorArea: '138.0',
        mainheatcontDescription: 'Programmer, room thermostat and TRVs',
        reportType: '100',
        energyTariff: 'Single',
        mechanicalVentilation: 'natural',
        co2EmissCurrPerFloorArea: '34',
        mainsGasFlag: 'Y',
        constituencyLabel: 'South Derbyshire',
        mainFuel: 'mains gas (not community)',
        lightingDescription: 'Low energy lighting in 29% of fixed outlets',
        multiGlazeProportion: '100',
        mainHeatingControls: '2106',
        secondheatDescription: 'Room heaters, mains gas',
        transactionType: 'marketed sale',
        lowEnergyLighting: '29',
        hotwaterDescription: 'From main system',
        builtForm: 'Detached',
        currentEnergyEfficiency: '68',
        potentialEnergyEfficiency: '79',
        mainHeatDescription: 'Boiler and radiators, mains gas',
        wallsDescription: 'Cavity wall, as built, insulated (assumed)',
        roofDescription: 'Pitched, 250 mm loft insulation',
        windowsDescription: 'Fully double glazed',
        co2EmissionsCurrent: '4.8',
        co2EmissionsPotential: '3.2',
        heatingCostCurrent: '791',
        heatingCostPotential: '717',
        hotWaterCostCurrent: '93',
        hotWaterCostPotential: '94',
        lightingCostCurrent: '117',
        lightingCostPotential: '68',
        energyConsumptionCurrent: '179',
        energyConsumptionPotential: '120',
        floorDescription: 'Solid, no insulation (assumed)',
        roofEnergyEff: 'Good',
        windowsEnergyEff: 'Average',
        wallsEnergyEff: 'Good',
        hotWaterEnergyEff: 'Good',
        lightingEnergyEff: 'Average',
        numberHabitableRooms: '7',
        numberHeatedRooms: '7',
        lowEnergyFixedLightCount: '6',
        uprnSource: 'Address Matched',
        floorHeight: null,
        mainheatEnergyEff: 'Good',
        windowsEnvEff: 'Average',
        lightingEnvEff: 'Average',
        environmentImpactPotential: '75',
        glazedType: 'double glazing, unknown install date',
        sheatingEnergyEff: 'N/A',
        fixedLightingOutletsCount: '21',
        solarWaterHeatingFlag: null,
        constituency: 'E14000935',
        localAuthority: 'E07000039',
        numberOpenFireplaces: '0',
        glazedArea: 'Normal',
        heatLossCorridor: null,
        flatStoreyCount: null,
        roofEnvEff: 'Good',
        environmentImpactCurrent: '64',
        floorEnergyEff: 'N/A',
        hotWaterEnvEff: 'Good',
        mainheatcEnergyEff: 'Good',
        wallsEnvEff: 'Good',
        photoSupply: '0.0',
        mainheatEnvEff: 'Good',
        lodgementDatetime: '2013-01-25 14:36:51',
        flatTopStorey: null,
        extensionCount: '1',
        mainheatcEnvEff: 'Good',
        lmkKey: '876124265912013012514365195270704',
        windTurbineCount: '0',
        floorLevel: null,
    },
    floodRisk: null,
    planningHistory: []
};

/**
 * This script runs an AI flow independently, similar to how you would in Google AI Studio.
 * You can run this file from the terminal using: `npm run run:flow`
 */
async function main() {
    console.log("Running AI Summary Flow with sample data...");

    try {
        const result = await generateAiSummary({
            propertyData: JSON.stringify(samplePropertyData, null, 2),
        });

        console.log("\n✅ Flow completed successfully!");
        console.log("\n--- AI Summary ---");
        console.log(result.summary);
        console.log("--------------------");

    } catch(e) {
        console.error("\n❌ Flow failed:", e);
    }
}

main();
