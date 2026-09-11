export const DATA_TOOLTIPS: Record<string, string> = {
  // Land Registry
  'pricePaid': 'The most recent sale price recorded by HM Land Registry.',
  'transactionDate': 'The date the most recent sale was completed.',
  'estateType': 'The type of ownership (e.g., Freehold or Leasehold).',
  'addressString': 'The official address as recorded by the Land Registry.',

  // EPC
  'rating': 'The current energy efficiency rating of the property (A is most efficient, G is least).',
  'potentialRating': 'The potential energy efficiency rating if all recommended improvements are made.',
  'propertyType': 'The type of property (e.g., House, Flat, Bungalow).',
  'tenure': 'The legal right to live in the property (e.g., Owner-occupied, Rental).',
  'uprn': 'Unique Property Reference Number - a unique identifier for every address in Great Britain.',
  'constructionAgeBand': 'The estimated age range when the property was built.',
  'totalFloorArea': 'The total internal floor space of the property in square meters.',
  'mainFuel': 'The primary fuel source used for heating (e.g., Mains gas, Electricity).',
  'builtForm': 'The structural layout of the building (e.g., Detached, Semi-detached, Mid-terrace).',
  'currentEnergyEfficiency': 'A numerical score representing the current energy efficiency (higher is better).',
  'potentialEnergyEfficiency': 'The potential numerical score if improvements are implemented.',
  'co2EmissionsCurrent': 'Estimated annual CO2 emissions in tonnes.',
  'heatingCostCurrent': 'Estimated annual cost for space heating.',
  'hotWaterCostCurrent': 'Estimated annual cost for hot water.',
  'lightingCostCurrent': 'Estimated annual cost for lighting.',

  // Flood Risk
  'riskOfFloodingFromRiversAndSea': 'The likelihood of flooding from nearby rivers or the sea.',
  'suitability': 'The suitability of the flood risk assessment for the specific location.',

  // Planning
  'application': 'A brief description of the planning application.',
  'decision': 'The outcome of the planning application (e.g., Granted, Refused).',
  'date': 'The date the decision was made or the application was started.',
  'reference': 'The unique reference number assigned by the local planning authority.',
  
  // Council Tax
  'band': 'The Council Tax band assigned to the property based on its value in 1991.',
  'annualAmount': 'The estimated annual Council Tax charge for the current financial year.',
  'authority': 'The local council responsible for collecting Council Tax.',

  // Radon
  'riskLevel': 'The estimated probability that the property is at or above the Radon Action Level.',
  'percentage': 'The percentage of homes in this area estimated to be at or above the Action Level.',

  // Coal Mining
  'isReportingArea': 'Whether the property is in an area where a coal mining report should be obtained.',
  'isHighRiskArea': 'Whether the property is in a high-risk coal mining area with known hazards.',

  // Broadband
  'maxDownloadSpeed': 'The estimated maximum download speed available at this property.',
  'superfastAvailable': 'Whether Superfast broadband (30Mbps+) is available.',
  'ultrafastAvailable': 'Whether Ultrafast broadband (100Mbps+) is available.'
};
