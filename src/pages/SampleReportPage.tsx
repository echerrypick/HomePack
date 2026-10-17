import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { ReportDisplay } from '@/components/homepack/report-display';
import { Address, ReportResult } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CircleHelp, Database, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_ADDRESS: Address = {
  houseNumber: '41',
  street: 'Bingley Avenue',
  town: 'Tamworth',
  postcode: 'B78 3BU'
};

const SAMPLE_REPORT_DATA: ReportResult = {
  propertyData: {
    address: '41 Bingley Avenue, Tamworth, Tamworth, Staffordshire, B78 3BU',
    coordinates: { lat: 52.630908, lng: -1.718256 },
    landRegistry: [
      {
        pricePaid: '225000',
        transactionDate: '2025-11-13',
        estateType: 'Freehold',
        propertyType: 'Terraced',
        transactionCategory: 'Standard Price Paid',
        addressString: '41 Bingley Avenue, Tamworth, Tamworth, Staffordshire, B78 3BU'
      },
      {
        pricePaid: '197995',
        transactionDate: '2020-02-24',
        estateType: 'Freehold',
        propertyType: 'Terraced',
        transactionCategory: 'Standard Price Paid',
        newBuild: true,
        addressString: '41 Bingley Avenue, Tamworth, Tamworth, Staffordshire, B78 3BU'
      }
    ],
    recentStreetSales: [
      { pricePaid: '248000', transactionDate: '2026-07-01', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '43 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '287500', transactionDate: '2025-06-27', estateType: 'Freehold', propertyType: 'Semi Detached', newBuild: false, addressString: '22 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '243000', transactionDate: '2025-05-19', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '35 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '230000', transactionDate: '2025-04-15', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '38 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '235000', transactionDate: '2025-02-10', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '40 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '225000', transactionDate: '2024-12-13', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '31 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '240000', transactionDate: '2024-11-22', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '39 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '245000', transactionDate: '2024-07-25', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '31 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '258000', transactionDate: '2024-07-24', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '42 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' },
      { pricePaid: '219950', transactionDate: '2024-07-18', estateType: 'Freehold', propertyType: 'Terraced', newBuild: false, addressString: '33 Bingley Avenue, Tamworth, Staffordshire, B78 3BU' }
    ],
    epc: {
      lmkKey: '0462-3882-7995-2620-3881',
      address1: '41 Bingley Avenue',
      address2: '',
      address3: '',
      posttown: 'Tamworth',
      postcode: 'B78 3BU',
      county: 'Staffordshire',
      lodgementDate: '2020-01-22',
      inspectionDate: '2020-01-22',
      lodgementDatetime: '2020-01-22 09:10:18',
      rating: 'B',
      potentialRating: 'A',
      currentEnergyEfficiency: '83',
      potentialEnergyEfficiency: '97',
      propertyType: 'House',
      builtForm: 'End-Terrace',
      constructionAgeBand: '2019',
      tenure: 'Not recorded',
      uprn: '394042808',
      uprnSource: 'Energy Assessor',
      buildingReferenceNumber: '0462-3882-7995-2620-3881',
      localAuthority: 'E07000199',
      localAuthorityLabel: 'Tamworth Borough Council',
      constituency: 'E14000647',
      constituencyLabel: 'Tamworth',
      totalFloorArea: '63',
      numberHabitableRooms: 'Not recorded',
      numberHeatedRooms: 'Not recorded',
      transactionType: 'New dwelling',
      mainHeatDescription: 'Boiler and radiators, mains gas',
      mainheatcontDescription: 'Time and temperature zone control',
      mainFuel: 'Gas',
      secondheatDescription: 'None',
      hotwaterDescription: 'From main system',
      wallsDescription: 'Average thermal transmittance 0.27 W/m²K',
      wallsEnergyEff: 'Very Good',
      wallsEnvEff: 'Very Good',
      roofDescription: 'Average thermal transmittance 0.11 W/m²K',
      roofEnergyEff: 'Very Good',
      roofEnvEff: 'Very Good',
      floorDescription: 'Average thermal transmittance 0.14 W/m²K',
      floorEnergyEff: 'Very Good',
      floorEnvEff: 'Very Good',
      windowsDescription: 'High performance glazing',
      windowsEnergyEff: 'Very Good',
      windowsEnvEff: 'Very Good',
      lightingDescription: 'Low energy lighting in all fixed outlets',
      lightingEnergyEff: 'Very Good',
      lightingEnvEff: 'Very Good',
      co2EmissionsCurrent: '1',
      co2EmissionsPotential: '0',
      environmentImpactCurrent: '87',
      environmentImpactPotential: '100',
      energyConsumptionCurrent: '94',
      energyConsumptionPotential: '-6',
      heatingCostCurrent: '195',
      heatingCostPotential: '195',
      hotWaterCostCurrent: '66',
      hotWaterCostPotential: '40',
      lightingCostCurrent: '52',
      lightingCostPotential: '52',
      glazedType: 'High performance glazing',
      glazedArea: 'Normal',
      multiGlazeProportion: '100',
      lowEnergyLighting: '100',
      lowEnergyFixedLightCount: '10',
      fixedLightingOutletsCount: '10',
      mainheatEnergyEff: 'Good',
      mainheatEnvEff: 'Good',
      mainheatcEnergyEff: 'Good',
      mainheatcEnvEff: 'Good',
      hotWaterEnvEff: 'Good',
      numberOpenFireplaces: '0',
      solarWaterHeatingFlag: 'N',
      windTurbineCount: '0',
      photoSupply: '0',
      expiryDate: '2030-01-21',
      reportType: 'New dwelling',
      energyTariff: 'Standard',
      mechanicalVentilation: 'Natural ventilation',
      co2EmissCurrPerFloorArea: '17',
      mainsGasFlag: 'Y',
      mainHeatingControls: 'Time and temperature zone control',
      hotWaterEnergyEff: 'Good',
      sheatingEnergyEff: 'N/A',
      heatLossCorridor: 'None',
      flatStoreyCount: '0',
      flatTopStorey: 'N',
      extensionCount: '0',
      floorLevel: '0',
      floorHeight: '2.33'
    },
    floodRisk: {
      postcode: 'B78 3BU',
      riskOfFloodingFromRiversAndSea: 'Very Low',
      riskOfFloodingFromSurfaceWater: 'Very Low',
      riskOfFloodingFromGroundwater: 'Not assessed by this source',
      riskOfFloodingFromReservoirs: 'Check Environment Agency map',
      suitability: 'County to Town',
      publishDate: '2023-06-01',
      easting: '419166',
      northing: '303719',
      latitude: '52.6309',
      longitude: '-1.7183',
      activeWarnings: 'None'
    },
    councilTax: {
      band: 'B',
      annualAmount: '£1,789.48',
      authority: 'Tamworth',
      year: '2026/27',
      source: 'VOA band; CouncilTaxBands.com 2026/27 area charge compiled from published government schedules',
      sourceUrl: 'https://counciltaxbands.com/councils/tamworth/'
    },
    radonRisk: {
      riskLevel: 'Not assessed in this sample',
      percentage: 'Not available',
      description: 'Obtain an address-level UKradon report before relying on a radon assessment.'
    },
    coalMining: {
      isReportingArea: false,
      isHighRiskArea: false,
      description: 'Not assessed by an official property-level source in this sample.'
    },
    broadband: {
      standardAvailable: true,
      superfastAvailable: true,
      ultrafastAvailable: false,
      maxDownloadSpeed: '76 Mbps',
      maxUploadSpeed: '5 Mbps',
      results: [
        { type: 'Standard', available: true, downloadSpeed: '24 Mbps', uploadSpeed: '1 Mbps' },
        { type: 'Superfast', available: true, downloadSpeed: '76 Mbps', uploadSpeed: '5 Mbps' },
        { type: 'Ultrafast', available: false, downloadSpeed: 'N/A', uploadSpeed: 'N/A' },
        { type: 'Gigabit', available: false, downloadSpeed: 'N/A', uploadSpeed: 'N/A' }
      ],
      networks: ['Openreach • FTTC', 'Virgin Media • Cable']
    },
    planningHistory: [
      {
        application: 'Discharge of condition 3 (visibility splays) of application 0196/2021',
        decision: 'Approved',
        date: '2025-11-11',
        reference: '0213/2025',
        url: 'https://planning.tamworth.gov.uk/Northgate/PlanningExplorerAA/Generic/StdDetails.aspx?PT=PlanningApplicationsOn-Line&TYPE=PL/PlanningPK.xml&PARAM0=382909',
        address: 'Land at Dunstall Farm, Dunstall Lane / Ventura Park Road / Meadow Road, Tamworth, Staffordshire, B78 3AX',
        distanceKm: 0.477,
        applicationType: 'Conditions',
        applicationSize: 'Small',
        source: 'PlanIt'
      },
      {
        application: 'Discharge of conditions 3 (wastewater scheme) and 9 (sound insulation) of application 0257/2024',
        decision: 'Withdrawn',
        date: '2025-05-01',
        reference: '0096/2025',
        url: 'https://planning.tamworth.gov.uk/Northgate/PlanningExplorerAA/Generic/StdDetails.aspx?PT=PlanningApplicationsOn-Line&TYPE=PL/PlanningPK.xml&PARAM0=381607',
        address: '43 Longbourn Crescent, Tamworth, Staffordshire, B78 3ES',
        distanceKm: 0.246,
        applicationType: 'Conditions',
        source: 'PlanIt'
      },
      {
        application: 'Erection of an outbuilding for use as a dog grooming business',
        decision: 'Approved',
        date: '2024-11-20',
        reference: '0257/2024',
        url: 'https://planning.tamworth.gov.uk/Northgate/PlanningExplorerAA/Generic/StdDetails.aspx?PT=PlanningApplicationsOn-Line&TYPE=PL/PlanningPK.xml&PARAM0=380187',
        address: '43 Longbourn Crescent, Tamworth, Staffordshire, B78 3ES',
        distanceKm: 0.246,
        applicationType: 'Full',
        applicationSize: 'Small',
        source: 'PlanIt'
      }
    ],
    planningConstraints: [],
    planningCoverage: {
      scope: 'radius',
      radiusMiles: 0.3,
      applications: 'verified PlanIt applications within 0.3 miles; this sample demonstrates the optional business-plan planning scope',
      constraints: 'Planning Data point intersection; absence of a result does not guarantee no constraint exists'
    },
    healthcare: {
      postcode: 'B78 3BU',
      gpSurgeries: [
        {
          name: 'Pear Tree Surgery',
          odsCode: 'M84006',
          address: '28 Meadow Close, Kingsbury, Tamworth',
          postcode: 'B78 2NR',
          distance: 'Distance unavailable',
          isAcceptingNewPatients: null,
          cqcRating: 'CQC match unavailable',
          phone: '01827 872755',
          website: 'http://www.peartreesurgery.nhs.uk'
        },
        {
          name: 'Polesworth Surgery',
          odsCode: 'M84007001',
          address: 'High Street, Polesworth, Tamworth',
          postcode: 'B78 1DU',
          distance: 'Distance unavailable',
          isAcceptingNewPatients: null,
          cqcRating: 'CQC match unavailable',
          phone: '01827 330321',
          website: 'http://www.dordonsurgery.co.uk/'
        },
        {
          name: 'Laurel House Surgery (Fazeley Branch)',
          odsCode: 'M83062001',
          address: 'Albert Road, Fazeley, Tamworth',
          postcode: 'B78 3JQ',
          distance: 'Distance unavailable',
          isAcceptingNewPatients: null,
          cqcRating: 'CQC match unavailable',
          phone: '01827 283994',
          website: 'http://www.laurelhousesurgery.co.uk/index.aspx'
        }
      ],
      dentists: [
        {
          name: 'Polesworth Dental Surgery',
          odsCode: 'V006094',
          address: '11 Bridge Street, Polesworth, Staffordshire',
          postcode: 'B78 1DR',
          distance: 'Distance unavailable',
          isAcceptingNhsPatients: null,
          cqcRating: 'Inspected / Compliant',
          phone: '01827 892958'
        },
        {
          name: 'Kingsbury Dental Practice',
          odsCode: 'V006082',
          address: '5 Jubilee Court, Kingsbury, Staffordshire',
          postcode: 'B78 2LL',
          distance: 'Distance unavailable',
          isAcceptingNhsPatients: null,
          cqcRating: 'Inspected / Compliant',
          phone: '01827 874210',
          website: 'http://www.bhandaldentalpractices.co.uk/'
        }
      ],
      pharmacies: [
        {
          name: 'Polesworth Pharmacy',
          odsCode: 'FRJ85',
          address: '14-16 Bridge Street, Polesworth, Staffordshire',
          postcode: 'B78 1DT',
          distance: 'Distance unavailable',
          openingHours: 'Mon-Fri 09:00-17:30; Sat 09:00-13:00 and 14:00-17:30',
          phone: '01827 892313',
          services: ['Electronic Prescription Service (EPS)', 'NHS Pharmacy First']
        },
        {
          name: 'ASDA Pharmacy',
          odsCode: 'FGV24',
          address: 'ASDA Superstore, Ventura Road, Tamworth',
          postcode: 'B78 3HB',
          distance: 'Distance unavailable',
          openingHours: 'Mon-Sat 09:00-20:00 with scheduled breaks; Sun 10:00-16:00',
          phone: '01827 302210',
          services: ['Electronic Prescription Service (EPS)', 'NHS Pharmacy First']
        }
      ],
      summary: 'Primary healthcare services near B78 3BU from NHS service directories. Registration, NHS availability and opening hours must be confirmed directly.',
      source: 'NHS Directory of Healthcare Services & Care Quality Commission',
      lastUpdated: '27/09/2026'
    },
    crime: {
      radiusMiles: 1,
      totalLast12Months: 1310,
      monthlyAverage: 131,
      latestMonth: '2026-07',
      earliestMonth: '2025-08',
      monthlyTrends: [
        { date: '2025-08', displayMonth: "Aug '25", totalCrimes: 136, isPublished: true, burglary: 3, vehicleCrime: 9, antiSocialBehaviour: 9, violentCrime: 50, other: 65 },
        { date: '2025-09', displayMonth: "Sep '25", totalCrimes: 138, isPublished: true, burglary: 6, vehicleCrime: 10, antiSocialBehaviour: 13, violentCrime: 51, other: 58 },
        { date: '2025-11', displayMonth: "Nov '25", totalCrimes: 112, isPublished: true, burglary: 2, vehicleCrime: 6, antiSocialBehaviour: 13, violentCrime: 40, other: 51 },
        { date: '2025-12', displayMonth: "Dec '25", totalCrimes: 138, isPublished: true, burglary: 1, vehicleCrime: 5, antiSocialBehaviour: 12, violentCrime: 45, other: 75 },
        { date: '2026-01', displayMonth: "Jan '26", totalCrimes: 117, isPublished: true, burglary: 0, vehicleCrime: 4, antiSocialBehaviour: 17, violentCrime: 44, other: 52 },
        { date: '2026-02', displayMonth: "Feb '26", totalCrimes: 124, isPublished: true, burglary: 9, vehicleCrime: 17, antiSocialBehaviour: 17, violentCrime: 36, other: 45 },
        { date: '2026-04', displayMonth: "Apr '26", totalCrimes: 139, isPublished: true, burglary: 3, vehicleCrime: 5, antiSocialBehaviour: 13, violentCrime: 51, other: 67 },
        { date: '2026-05', displayMonth: "May '26", totalCrimes: 147, isPublished: true, burglary: 2, vehicleCrime: 11, antiSocialBehaviour: 15, violentCrime: 47, other: 72 },
        { date: '2026-06', displayMonth: "Jun '26", totalCrimes: 131, isPublished: true, burglary: 5, vehicleCrime: 8, antiSocialBehaviour: 8, violentCrime: 32, other: 78 },
        { date: '2026-07', displayMonth: "Jul '26", totalCrimes: 128, isPublished: true, burglary: 2, vehicleCrime: 4, antiSocialBehaviour: 13, violentCrime: 47, other: 62 }
      ],
      categoryBreakdown: [
        { categoryKey: 'violent-crime', label: 'Violence & Personal Safety', count: 443, percentage: 33.8, riskLevel: 'Elevated', description: 'Offences against the person, common assault, harassment or personal threats.' },
        { categoryKey: 'shoplifting', label: 'Shoplifting & Commercial Theft', count: 275, percentage: 21, riskLevel: 'Moderate', description: 'Theft from local retail premises or high-street stores.' },
        { categoryKey: 'anti-social-behaviour', label: 'Anti-Social Behaviour (ASB)', count: 130, percentage: 9.9, riskLevel: 'Elevated', description: 'Nuisance conduct, noise, rowdy gatherings or intimidation.' },
        { categoryKey: 'public-order', label: 'Public Order Offences', count: 124, percentage: 9.5, riskLevel: 'Low' },
        { categoryKey: 'vehicle-crime', label: 'Vehicle Crime', count: 79, percentage: 6, riskLevel: 'Elevated' },
        { categoryKey: 'burglary', label: 'Burglary & Break-ins', count: 33, percentage: 2.5, riskLevel: 'Moderate' }
      ],
      benchmarks: {
        localAnnualTotal: 1310,
        localAnnualRatePer1000: 59.5,
        forceName: 'Staffordshire Police',
        forceRatePer1000: 81.2,
        nationalRatePer1000: 85.5,
        vsForceComparison: 'Lower',
        vsForceDifferencePercent: -27,
        vsNationalComparison: 'Lower',
        vsNationalDifferencePercent: -30,
        safetyRating: 'Low Crime Area',
        safetyScore: 96
      },
      keyCategories: {
        burglary: { count: 33, percentage: 2.5, ratePer1000: 1.5, forceRate: 3.8, nationalRate: 4.2, status: 'Lower', riskLevel: 'Low', monthlyAvg: 2.8 },
        vehicleCrime: { count: 79, percentage: 6, ratePer1000: 3.6, forceRate: 5.1, nationalRate: 6.2, status: 'Lower', riskLevel: 'Low', monthlyAvg: 6.6 },
        asb: { count: 130, percentage: 9.9, ratePer1000: 5.9, forceRate: 16.8, nationalRate: 17.5, status: 'Lower', riskLevel: 'Low', monthlyAvg: 10.8 },
        violentCrime: { count: 443, percentage: 33.8, ratePer1000: 20.1, forceRate: 31, nationalRate: 32.4, status: 'Lower', riskLevel: 'Low', monthlyAvg: 36.9 }
      },
      recentIncidents: [
        { id: 136676284, category: 'anti-social-behaviour', categoryLabel: 'Anti-Social Behaviour (ASB)', month: "Jul '26", streetName: 'On or near Collins Grove', outcomeStatus: 'Status awaiting police update', distanceMiles: 0.1 },
        { id: 136674400, category: 'anti-social-behaviour', categoryLabel: 'Anti-Social Behaviour (ASB)', month: "Jul '26", streetName: 'On or near Dunstall Lane', outcomeStatus: 'Status awaiting police update', distanceMiles: 0.2 },
        { id: 136675120, category: 'anti-social-behaviour', categoryLabel: 'Anti-Social Behaviour (ASB)', month: "Jul '26", streetName: 'On or near Dunstall Lane', outcomeStatus: 'Status awaiting police update', distanceMiles: 0.2 },
        { id: 136670502, category: 'burglary', categoryLabel: 'Burglary & Break-ins', month: "Jul '26", streetName: 'On or near Armstrong', outcomeStatus: 'Under investigation', distanceMiles: 0.6 }
      ],
      policeForce: { id: 'staffordshire', name: 'Staffordshire Police', telephone: '101', url: 'https://www.staffordshire.police.uk' },
      source: 'data.police.uk (Home Office UK Police Open Data)',
      lastUpdated: '2026-09-27T17:39:59.489Z'
    }
  },
  summary: "**Property Address:** 41 Bingley Avenue, Tamworth, B78 3BU\n\n- **Recorded sale history:** £225,000 on 13 November 2025; earlier new-build transaction £197,995 on 24 February 2020.\n- **Energy efficiency:** Official EPC Band B (83), potentially Band A (97), with 63 m² recorded floor area.\n- **Council Tax:** Official VOA Band B; published Tamworth 2026/27 area charge £1,789.48 before discounts or account adjustments.\n- **Broadband:** Address-level Ofcom lookup returned up to 76 Mbps download and 5 Mbps upload; ultrafast and gigabit were not shown as available.\n- **Planning:** This sample demonstrates the optional business search and shows verified PlanIt applications within 0.3 miles.\n- **Healthcare:** Nearby services are taken from NHS directories; registration and NHS availability must be confirmed directly.\n\nThis is a dated sample snapshot, not a substitute for a newly generated report or professional property searches.",
  logs: []
};

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-12 flex-grow">
        <PageHero eyebrow="Explore before you buy" illustration="report"><h1 className="site-page-heading">Sample UK property report</h1><p>See how available property and local-area records are presented in this dated sample for 41 Bingley Avenue, Tamworth, B78 3BU. Snapshot checked 27 September 2026.</p><p className="page-hero-footnote">Source records change. Generate a new report for current research and independently verify material findings.</p></PageHero>
        <section className="mb-10 grid gap-5 md:grid-cols-3" aria-label="How to use this sample report">
          <SampleGuide icon={Database} title="What this sample shows" text="The layout, source labels, dates, returned records and limitations you can expect. A new address may return more, less or different information." />
          <SampleGuide icon={ListChecks} title="How to use the findings" text="Turn the results into questions for the seller, estate agent, surveyor or conveyancer. Follow important records back to their original source." />
          <SampleGuide icon={CircleHelp} title="What to investigate" text="Check the age of each record, planning relevance, current connectivity, EPC recommendations and any environmental point that affects your decision." />
        </section>
        <ReportDisplay 
          address={SAMPLE_ADDRESS} 
          reportData={SAMPLE_REPORT_DATA} 
          isLoading={false} 
          onReset={() => window.location.href = '/'} 
        />
        <section className="mt-10 rounded-2xl border bg-primary/5 p-6 md:flex md:items-center md:justify-between md:gap-8">
          <div><h2 className="text-2xl font-bold">Research the property you are considering</h2><p className="mt-2 max-w-2xl text-muted-foreground">Generate a current report for the exact address. Coverage depends on the property and the records available when you run it.</p></div>
          <Button asChild className="mt-5 shrink-0 md:mt-0"><Link to="/tool">Create a property report <ArrowRight /></Link></Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SampleGuide({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return <Card><CardHeader><Icon className="h-6 w-6 text-primary" /><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>;
}
