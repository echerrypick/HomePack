export type UserRole = 'admin' | 'free' | 'subscription' | 'agency';

export type SearchedAddress = {
  address: string;
  timestamp: string;
};

export type UserNotifications = {
  emailAlerts?: boolean;
  propertyUpdates?: boolean;
  marketingEmails?: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  preferredRegion?: string;
  bio?: string;
  notifications?: UserNotifications;
  role: UserRole;
  searchCount: number;
  lastSearchReset: string;
  searchedAddresses: string[];
  searchHistory: SearchedAddress[];
  propertyReportCounts?: Record<string, number>;
  createdAt: string;
  updatedAt?: string;
};

export type Address = {
  houseNumber: string;
  street: string;
  town: string;
  postcode: string;
};

export type LandRegistryResult = {
  pricePaid: string;
  transactionDate: string;
  estateType: string;
  addressString: string;
};

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
    floorEnvEff: string | null;
    lodgementDatetime: string | null;
    flatTopStorey: string | null;
    extensionCount: string | null;
    mainheatcEnvEff: string | null;
    lmkKey: string | null;
    windTurbineCount: string | null;
    floorLevel: string | null;
    expiryDate: string | null;
  } | null;

export type FloodRiskData = {
    postcode: string;
    riskOfFloodingFromRiversAndSea: string;
    riskOfFloodingFromSurfaceWater: string;
    riskOfFloodingFromGroundwater: string;
    riskOfFloodingFromReservoirs: string;
    suitability: string;
    publishDate: string;
    easting: string;
    northing: string;
    latitude: string;
    longitude: string;
    activeWarnings: string;
  } | null;

export type CouncilTaxData = {
  band: string;
  annualAmount: string;
  authority: string;
  year: string;
} | null;

export type RadonRiskData = {
  riskLevel: string;
  percentage: string;
  description: string;
} | null;

export type CoalMiningData = {
  isReportingArea: boolean;
  isHighRiskArea: boolean;
  description: string;
} | null;

export type GenerationSignal = {
  generation: string;
  signalDbm: string;
  quality: string;
  bands: string[];
};

export type MobileData = {
  operator: string;
  voice?: string;
  data?: string;
  fiveG?: string;
  data4g?: string;
  data5g?: string;
  indoor?: string;
  outdoor?: string;
  transmitterNotice?: string;
  signals?: GenerationSignal[];
  overall?: string;
};

export type BroadbandResult = {
  type: string;
  downloadSpeed: string;
  uploadSpeed: string;
  available: boolean;
};

export type BroadbandData = {
  superfastAvailable: boolean;
  ultrafastAvailable: boolean;
  standardAvailable: boolean;
  maxDownloadSpeed: string;
  maxUploadSpeed: string;
  results?: BroadbandResult[];
  networks?: string[];
} | null;

export type PlanningHistoryItem = {
    application: string;
    decision: string;
    date: string;
    reference: string;
    url: string;
  };
  
export type PropertyDocument = {
  id: string;
  name: string;
  description: string;
  status: 'missing' | 'pending' | 'completed' | 'not-applicable';
  category: 'legal' | 'technical' | 'local' | 'other';
  required: boolean;
};

export type School = {
  name: string;
  type: 'Primary' | 'Secondary';
  ofstedRating: string;
  distance: string;
  location?: {
    lat: number;
    lng: number;
  };
};

export type PropertyData = {
  address: string;
  landRegistry: LandRegistryResult[];
  epc: EpcData;
  floodRisk: FloodRiskData;
  planningHistory: PlanningHistoryItem[];
  councilTax: CouncilTaxData;
  radonRisk: RadonRiskData;
  coalMining: CoalMiningData;
  broadband: BroadbandData;
  mobile?: MobileData[];
  mobileSummary?: string;
  schools?: School[];
  coordinates?: { lat: number; lng: number };
};

export type ReportResult = {
  propertyData: PropertyData;
  summary: string;
  logs: string[];
  error?: string;
};

export type HomePackJobStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface HomePackJobStep {
  id: string;
  label: string;
  status: HomePackJobStepStatus;
  detail?: string;
}

export interface HomePackJob {
  id: string;
  address: Address;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: HomePackJobStep[];
  result?: ReportResult | null;
  error?: string | null;
  createdAt: number;
  updatedAt?: number;
  completedAt?: number;
}
