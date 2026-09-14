import React from 'react';
import { ReportDisplay } from '@/components/homepack/report-display';
import { Address, ReportResult } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SAMPLE_ADDRESS: Address = {
  houseNumber: '10',
  street: 'Downing Street',
  town: 'London',
  postcode: 'SW1A 2AA'
};

const SAMPLE_REPORT_DATA: ReportResult = {
  propertyData: {
    address: '10 Downing Street, London, SW1A 2AA',
    landRegistry: [
      {
        pricePaid: '1500000',
        transactionDate: '2020-05-15',
        estateType: 'Freehold',
        addressString: '10 Downing Street, London, SW1A 2AA'
      },
      {
        pricePaid: '1200000',
        transactionDate: '2015-10-20',
        estateType: 'Freehold',
        addressString: '10 Downing Street, London, SW1A 2AA'
      }
    ],
    epc: {
      lmkKey: '1234567890',
      address1: '10 Downing Street',
      address2: '',
      address3: '',
      posttown: 'London',
      postcode: 'SW1A 2AA',
      county: 'Greater London',
      lodgementDate: '2022-01-01',
      inspectionDate: '2021-12-15',
      lodgementDatetime: '2022-01-01 10:00:00',
      rating: 'C',
      potentialRating: 'B',
      currentEnergyEfficiency: '72',
      potentialEnergyEfficiency: '85',
      propertyType: 'House',
      builtForm: 'Detached',
      constructionAgeBand: '1900-1929',
      tenure: 'Owner-occupied',
      uprn: '100023332222',
      uprnSource: 'Land Registry',
      buildingReferenceNumber: '99887766',
      localAuthority: 'E09000001',
      localAuthorityLabel: 'City of Westminster',
      constituency: 'E14000647',
      constituencyLabel: 'Cities of London and Westminster',
      totalFloorArea: '150',
      numberHabitableRooms: '8',
      numberHeatedRooms: '8',
      transactionType: 'Marketed sale',
      mainHeatDescription: 'Gas central heating',
      mainheatcontDescription: 'Programmer, room thermostat and TRVs',
      mainFuel: 'Gas',
      secondheatDescription: 'None',
      hotwaterDescription: 'From main system',
      wallsDescription: 'Solid brick, as built, no insulation (assumed)',
      wallsEnergyEff: 'Very Poor',
      wallsEnvEff: 'Very Poor',
      roofDescription: 'Pitched, 200 mm loft insulation',
      roofEnergyEff: 'Good',
      roofEnvEff: 'Good',
      floorDescription: 'Suspended, no insulation (assumed)',
      floorEnergyEff: 'N/A',
      floorEnvEff: 'N/A',
      windowsDescription: 'Fully double glazed',
      windowsEnergyEff: 'Average',
      windowsEnvEff: 'Average',
      lightingDescription: 'Low energy lighting in all fixed outlets',
      lightingEnergyEff: 'Very Good',
      lightingEnvEff: 'Very Good',
      co2EmissionsCurrent: '5.2',
      co2EmissionsPotential: '2.1',
      environmentImpactCurrent: '65',
      environmentImpactPotential: '82',
      energyConsumptionCurrent: '245',
      energyConsumptionPotential: '110',
      heatingCostCurrent: '1200',
      heatingCostPotential: '600',
      hotWaterCostCurrent: '150',
      hotWaterCostPotential: '100',
      lightingCostCurrent: '80',
      lightingCostPotential: '80',
      glazedType: 'Double glazing',
      glazedArea: 'Normal',
      multiGlazeProportion: '100',
      lowEnergyLighting: '100',
      lowEnergyFixedLightCount: '12',
      fixedLightingOutletsCount: '12',
      mainheatEnergyEff: 'Good',
      mainheatEnvEff: 'Good',
      mainheatcEnergyEff: 'Good',
      mainheatcEnvEff: 'Good',
      hotWaterEnvEff: 'Good',
      numberOpenFireplaces: '2',
      solarWaterHeatingFlag: 'N',
      windTurbineCount: '0',
      photoSupply: '0',
      expiryDate: '2032-01-01',
      reportType: 'Existing',
      energyTariff: 'Standard',
      mechanicalVentilation: 'None',
      co2EmissCurrPerFloorArea: '34',
      mainsGasFlag: 'Y',
      mainHeatingControls: 'Programmer, room thermostat and TRVs',
      hotWaterEnergyEff: 'Good',
      sheatingEnergyEff: 'N/A',
      heatLossCorridor: 'None',
      flatStoreyCount: '0',
      flatTopStorey: 'N',
      extensionCount: '0',
      floorLevel: '0',
      floorHeight: '2.4'
    },
    floodRisk: {
      postcode: 'SW1A 2AA',
      riskOfFloodingFromRiversAndSea: 'Very Low',
      riskOfFloodingFromSurfaceWater: 'Very Low',
      riskOfFloodingFromGroundwater: 'Negligible',
      riskOfFloodingFromReservoirs: 'No Risk',
      suitability: 'County to Town',
      publishDate: '2023-06-01',
      easting: '530000',
      northing: '179000',
      latitude: '51.5033',
      longitude: '-0.1275',
      activeWarnings: 'None'
    },
    councilTax: {
      band: 'H',
      annualAmount: '1824.38',
      authority: 'City of Westminster',
      year: '2024/25'
    },
    radonRisk: {
      riskLevel: 'Low',
      percentage: '< 1%',
      description: 'The property is in a Lower probability radon area as less than 1% of homes are estimated to be at or above the Action Level.'
    },
    coalMining: {
      isReportingArea: false,
      isHighRiskArea: false,
      description: 'The property is not within a coal mining reporting area.'
    },
    broadband: {
      standardAvailable: true,
      superfastAvailable: true,
      ultrafastAvailable: true,
      maxDownloadSpeed: '1000 Mbps',
      maxUploadSpeed: '220 Mbps'
    },
    planningHistory: [
      {
        application: 'Installation of security measures',
        decision: 'Approved',
        date: '2021-03-10',
        reference: '21/01234/FULL',
        url: '#'
      },
      {
        application: 'Internal alterations to office space',
        decision: 'Approved',
        date: '2019-11-05',
        reference: '19/05678/LBC',
        url: '#'
      }
    ],
    healthcare: {
      postcode: 'SW1A 2AA',
      gpSurgeries: [
        {
          name: 'The Westminster Medical Practice',
          odsCode: 'E87012',
          address: '42 Whitehall, Westminster, London',
          postcode: 'SW1A 2BX',
          distance: '0.3 miles',
          isAcceptingNewPatients: true,
          cqcRating: 'Good',
          cqcPublicationDate: '2023-11-14',
          cqcReportUrl: 'https://www.cqc.org.uk',
          phone: '020 7930 1234',
          website: 'https://www.westminstermedical.nhs.uk'
        },
        {
          name: 'Victoria Health Centre',
          odsCode: 'Y02456',
          address: '77 Victoria Street, London',
          postcode: 'SW1H 0HW',
          distance: '0.6 miles',
          isAcceptingNewPatients: true,
          cqcRating: 'Outstanding',
          cqcPublicationDate: '2024-02-18',
          cqcReportUrl: 'https://www.cqc.org.uk',
          phone: '020 7828 5678',
          website: 'https://www.victoriahealthcentre.nhs.uk'
        },
        {
          name: 'St James & Soho Surgery',
          odsCode: 'Y04112',
          address: '15 Great Chapel Street, London',
          postcode: 'W1F 8FR',
          distance: '0.9 miles',
          isAcceptingNewPatients: false,
          cqcRating: 'Good',
          cqcPublicationDate: '2023-08-20',
          phone: '020 7437 2345'
        }
      ],
      dentists: [
        {
          name: 'Westminster Dental Care & Implant Clinic',
          odsCode: 'V12098',
          address: '28 Parliament Street, London',
          postcode: 'SW1A 2JA',
          distance: '0.2 miles',
          isAcceptingNhsPatients: true,
          cqcRating: 'CQC Inspected & Compliant',
          phone: '020 7222 4321',
          website: 'https://www.westminsterdental.co.uk'
        },
        {
          name: 'St James Dental Practice',
          odsCode: 'V18944',
          address: '12 Pall Mall, London',
          postcode: 'SW1Y 5ED',
          distance: '0.5 miles',
          isAcceptingNhsPatients: false,
          cqcRating: 'Good',
          phone: '020 7930 9876'
        }
      ],
      pharmacies: [
        {
          name: 'Boots Pharmacy - Whitehall',
          odsCode: 'FPM89',
          address: '36 Whitehall, Westminster, London',
          postcode: 'SW1A 2BX',
          distance: '0.2 miles',
          openingHours: 'Mon-Fri: 08:30 - 18:30, Sat: 09:00 - 17:00',
          phone: '020 7930 5678',
          services: ['NHS Pharmacy First', 'Prescription Dispensing', 'Flu Vaccination', 'Blood Pressure Check']
        },
        {
          name: 'Parliament Street Chemist',
          odsCode: 'FX412',
          address: '14 Parliament Street, London',
          postcode: 'SW1A 2NE',
          distance: '0.3 miles',
          openingHours: 'Mon-Fri: 09:00 - 18:00',
          phone: '020 7222 1122',
          services: ['Prescription Dispensing', 'Emergency Contraception', 'Stop Smoking Service']
        }
      ],
      summary: 'Primary healthcare access near SW1A 2AA verified via NHS Service Search and CQC registers. 2 local GP surgeries accepting new NHS patients and community dispensing pharmacies within 0.3 miles.'
    }
  },
  summary: "This property is a historic detached house in the City of Westminster. It has a solid sales history with significant value appreciation. The energy performance is currently rated C, which is typical for a building of this age, but there is potential to reach a B rating with floor insulation and solar panels. Flood risk is very low. Planning history shows recent approvals for security and internal improvements, indicating the property is well-maintained and adapted for modern use.",
  logs: []
};

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <h1 className="text-xl font-bold text-primary">Sample Property Report</h1>
          <p className="text-sm text-muted-foreground">This is a demonstration of the comprehensive data provided in a HomePack.</p>
        </div>
        <ReportDisplay 
          address={SAMPLE_ADDRESS} 
          reportData={SAMPLE_REPORT_DATA} 
          isLoading={false} 
          onReset={() => window.location.href = '/'} 
        />
      </main>
      <Footer />
    </div>
  );
}
