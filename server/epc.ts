import { selectBestEpcCertificate } from './epc-match';
// EPC Data Helper: Extracts a field from certificate or candidate matching various casing conventions
export function getEpcField(obj: any, ...keys: string[]): string | null {
  if (!obj || typeof obj !== 'object') return null;

  const extractScalar = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'object') {
      // Check common nested property names in UK Open Data APIs
      const inner = val.value ?? val.amount ?? val.cost ?? val.total ?? val.text ?? val.rating ?? val.score ?? val.current;
      if (inner !== undefined && inner !== null && typeof inner !== 'object') {
        const str = String(inner).trim();
        return (str && str !== '[object Object]') ? str : null;
      }
      return null;
    }
    const str = String(val).trim();
    if (!str || str === '[object Object]' || str === 'undefined' || str === 'null') {
      return null;
    }
    return str;
  };

  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
      const scalar = extractScalar(obj[k]);
      if (scalar !== null) return scalar;
    }
  }

  const nestedCandidates = [obj.data, obj.certificate, obj.attributes, obj.properties];
  for (const nested of nestedCandidates) {
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      for (const k of keys) {
        if (nested[k] !== undefined && nested[k] !== null && nested[k] !== '') {
          const scalar = extractScalar(nested[k]);
          if (scalar !== null) return scalar;
        }
      }
    }
  }
  return null;
}

// EPC Data Fetching using UK Government Energy Certificate Data API
export async function fetchEpcData(street: string, postcode: string, logs: string[], registerType: 'domestic' | 'non-domestic' = 'domestic'): Promise<any> {
  const searchEndpoint = `https://api.get-energy-performance-data.communities.gov.uk/api/${registerType}/search`;
  const certEndpoint = "https://api.get-energy-performance-data.communities.gov.uk/api/certificate";

  const bearerToken = process.env.EPC_BEARER_TOKEN;

  if (!bearerToken || bearerToken.trim() === "" || bearerToken === "YOUR_BEARER_TOKEN") {
    logs.push("[EPC] Warning: EPC_BEARER_TOKEN is not configured. Please set EPC_BEARER_TOKEN in Settings.");
    return null;
  }

  if (bearerToken.trim().startsWith("43c3")) {
    logs.push("[EPC] Warning: EPC_BEARER_TOKEN appears to be legacy credentials (starts with 43c3...). Please provide the Bearer token from the GOV.UK Energy Certificate Data service.");
    return null;
  }

  const headers: HeadersInit = {
    "Accept": "application/json",
    "Authorization": `Bearer ${bearerToken.trim()}`,
  };

  try {
    const searchUrl = `${searchEndpoint}?postcode=${encodeURIComponent(postcode.trim())}&address=${encodeURIComponent(street.trim())}&page_size=50`;
    logs.push(`[EPC] Searching certificates via GOV.UK Energy Performance API...`);

    let res = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(7500) });
    logs.push(`[EPC] Search API returned HTTP ${res.status}`);

    if (!res.ok) {
      if (res.status === 404 && registerType === 'domestic') {
        logs.push('[EPC] No domestic certificates returned; checking the non-domestic register.');
        return fetchEpcData(street, postcode, logs, 'non-domestic');
      }
      if (res.status === 401 || res.status === 403) {
        logs.push(`[EPC] Error: Authentication failed (HTTP ${res.status}). Check that EPC_BEARER_TOKEN is valid.`);
      } else {
        logs.push(`[EPC] Error: Search API returned HTTP ${res.status} ${res.statusText}`);
      }
      return null;
    }

    let searchJson = await res.json();
    let items = Array.isArray(searchJson.data) ? searchJson.data : (Array.isArray(searchJson) ? searchJson : (searchJson.rows || []));

    // If no exact match or candidate not found in first search, search by postcode
    let candidate = selectBestEpcCertificate(items, street);
    if (!candidate || items.length === 0) {
      const fallbackUrl = `${searchEndpoint}?postcode=${encodeURIComponent(postcode.trim())}&page_size=100`;
      logs.push(`[EPC] Address match check required wider query. Trying postcode fallback (${postcode.trim()})...`);
      try {
        const fallbackRes = await fetch(fallbackUrl, { headers, signal: AbortSignal.timeout(7500) });
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          const fallbackItems = Array.isArray(fallbackJson.data) ? fallbackJson.data : (Array.isArray(fallbackJson) ? fallbackJson : (fallbackJson.rows || []));
          if (fallbackItems.length > 0) {
            items = fallbackItems;
            candidate = selectBestEpcCertificate(items, street);
          }
        }
      } catch (fbErr: any) {
        logs.push(`[EPC] Postcode fallback search note: ${fbErr?.message || fbErr}`);
      }
    }

    if (!candidate) {
      if (registerType === 'domestic') return fetchEpcData(street, postcode, logs, 'non-domestic');
      logs.push('[EPC] No exact premises match in the domestic or non-domestic register.');
      return null;
    }

    const certificateNumber = candidate.certificateNumber ||
      candidate.certificate_number ||
      candidate['certificate-number'] ||
      candidate.certificateId ||
      candidate['certificate-id'] ||
      candidate.lmkKey ||
      candidate['lmk-key'] ||
      candidate.lmk_key ||
      candidate.id;

    let certObj: any = null;
    if (certificateNumber) {
      const certUrl = `${certEndpoint}?certificate_number=${encodeURIComponent(certificateNumber)}`;
      logs.push(`[EPC] Fetching full certificate details for ${certificateNumber}...`);
      try {
        const certRes = await fetch(certUrl, { headers, signal: AbortSignal.timeout(7500) });
        if (certRes.ok) {
          const certJson = await certRes.json();
          if (certJson && typeof certJson === 'object') {
            if (certJson.data && typeof certJson.data === 'object' && !Array.isArray(certJson.data)) {
              certObj = certJson.data;
            } else if (Array.isArray(certJson.data) && certJson.data.length > 0) {
              certObj = certJson.data[0];
            } else if (certJson.rows && Array.isArray(certJson.rows) && certJson.rows.length > 0) {
              certObj = certJson.rows[0];
            } else if (certJson.certificate && typeof certJson.certificate === 'object') {
              certObj = certJson.certificate;
            }
          }
        } else {
          logs.push(`[EPC] Certificate details returned HTTP ${certRes.status}, utilizing register search summary data.`);
        }
      } catch (cErr: any) {
        logs.push(`[EPC] Certificate details request note (${cErr?.message || cErr}), utilizing register search summary data.`);
      }
    }

    // Extract rating and potential rating, checking snake_case fields used by official GOV.UK API
    const rawRating = (
      getEpcField(certObj, 'current_energy_efficiency_band', 'currentEnergyEfficiencyBand', 'currentEnergyRating', 'current-energy-rating', 'current_energy_rating', 'rating', 'energyRating', 'energy_rating', 'currentEnergyBand', 'energyBand') ??
      getEpcField(candidate, 'currentEnergyEfficiencyBand', 'current_energy_efficiency_band', 'currentEnergyRating', 'current-energy-rating', 'current_energy_rating', 'rating', 'energyRating', 'currentEnergyBand', 'energyBand') ?? ''
    ).toString().trim().toUpperCase();

    const rawPotentialRating = (
      getEpcField(certObj, 'potential_energy_efficiency_band', 'potentialEnergyEfficiencyBand', 'potentialEnergyRating', 'potential-energy-rating', 'potential_energy_rating', 'potentialRating', 'potentialEnergyBand', 'potential_energy_band') ??
      getEpcField(candidate, 'potentialEnergyEfficiencyBand', 'potential_energy_efficiency_band', 'potentialEnergyRating', 'potential-energy-rating', 'potential_energy_rating', 'potentialRating') ?? ''
    ).toString().trim().toUpperCase();

    const rating = (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(rawRating) ? rawRating : '') as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    const potentialRating = (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(rawPotentialRating) ? rawPotentialRating : '') as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

    let expiryDate: string | null = getEpcField(certObj, 'expiryDate', 'expiry-date', 'expiry_date', 'valid_until') ?? getEpcField(candidate, 'expiryDate', 'expiry-date', 'expiry_date');
    if (!expiryDate) {
      const lodgeDate = getEpcField(certObj, 'lodgementDate', 'lodgement-date', 'lodgement_date', 'dateRegistered', 'registrationDate', 'registration_date') ??
        getEpcField(candidate, 'lodgementDate', 'lodgement-date', 'lodgement_date', 'dateRegistered', 'registrationDate');
      if (lodgeDate) {
        try {
          const d = new Date(lodgeDate);
          if (!isNaN(d.getTime())) {
            d.setFullYear(d.getFullYear() + 10);
            expiryDate = d.toISOString().split('T')[0];
          }
        } catch (e) {}
      }
    }

    // Helper to format descriptions from objects, arrays or strings
    const extractDescription = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        return val.map((item: any) => (typeof item === 'object' ? item.description || item.name || '' : String(item))).filter(Boolean).join('; ');
      }
      if (typeof val === 'object') {
        return val.description || val.name || val.type || '';
      }
      return String(val);
    };

    // Helper to extract numeric cost or value from objects
    const extractCostValue = (val: any): string => {
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') {
        return val.value !== undefined ? String(val.value) : (val.amount !== undefined ? String(val.amount) : '');
      }
      return String(val);
    };

    const mainheatDesc = extractDescription(certObj?.main_heating) ||
      getEpcField(certObj, 'mainheatDescription', 'mainheat-description', 'mainheat_description', 'mainHeatDescription', 'mainHeatingDescription') ||
      '';

    const wallsDesc = extractDescription(certObj?.walls) ||
      getEpcField(certObj, 'wallsDescription', 'walls-description', 'walls_description') ||
      '';

    const roofDesc = extractDescription(certObj?.roofs) ||
      getEpcField(certObj, 'roofDescription', 'roof-description', 'roof_description') ||
      '';

    const windowsDesc = extractDescription(certObj?.windows) ||
      getEpcField(certObj, 'windowsDescription', 'windows-description', 'windows_description') ||
      '';

    const floorDesc = extractDescription(certObj?.floors) ||
      getEpcField(certObj, 'floorDescription', 'floor-description', 'floor_description') ||
      '';

    const hotwaterDesc = extractDescription(certObj?.hot_water) ||
      getEpcField(certObj, 'hotwaterDescription', 'hotwater-description', 'hotwater_description', 'hotWaterDescription') ||
      '';

    const lightingDesc = extractDescription(certObj?.lighting) ||
      getEpcField(certObj, 'lightingDescription', 'lighting-description', 'lighting_description') ||
      '';

    // Dwelling / Property type mapping
    let propertyType = certObj?.dwelling_type ||
      getEpcField(certObj, 'propertyType', 'property-type', 'property_type', 'dwelling_type') ||
      getEpcField(candidate, 'propertyType', 'property-type') ||
      (registerType === 'non-domestic' ? 'Non-domestic premises' : 'Not recorded');
    if (String(propertyType) === '0') propertyType = 'House';

    // Built form mapping
    let builtForm = getEpcField(certObj, 'builtForm', 'built-form', 'built_form') || '';
    const builtFormStr = String(builtForm).trim();
    if (builtFormStr === '3') builtForm = 'End-terrace';
    else if (builtFormStr === '1') builtForm = 'Detached';
    else if (builtFormStr === '2') builtForm = 'Semi-detached';
    else if (builtFormStr === '4') builtForm = 'Mid-terrace';

    // Scores
    const currentScore = certObj?.energy_rating_current !== undefined ? String(certObj.energy_rating_current) :
      (getEpcField(certObj, 'asset_rating', 'currentEnergyEfficiency', 'current-energy-efficiency', 'current_energy_efficiency', 'currentEnergyScore') ?? '');

    const potentialScore = certObj?.energy_rating_potential !== undefined ? String(certObj.energy_rating_potential) :
      (getEpcField(certObj, 'potentialEnergyEfficiency', 'potential-energy-efficiency', 'potential_energy_efficiency', 'potentialEnergyScore') ?? '');

    logs.push(`[EPC] Success: Found EPC for ${certificateNumber} (Current Band: ${rating} / Score: ${currentScore || 'N/A'}, Potential Band: ${potentialRating} / Score: ${potentialScore || 'N/A'})`);

    return {
      registerType,
      assessmentMethod: getEpcField(certObj, 'methodology') || '',
      buildingComplexity: getEpcField(certObj, 'building_complexity') || '',
      buildingEnvironment: certObj?.technical_information?.building_environment || '',
      address1: getEpcField(certObj, 'address1', 'address-1', 'address_1', 'addressLine1', 'address_line_1', 'line1') ?? getEpcField(candidate, 'address1', 'addressLine1', 'address') ?? '',
      address2: getEpcField(certObj, 'address2', 'address-2', 'address_2', 'addressLine2', 'address_line_2', 'line2') ?? getEpcField(candidate, 'address2', 'addressLine2') ?? '',
      address3: getEpcField(certObj, 'address3', 'address-3', 'address_3', 'addressLine3', 'address_line_3', 'line3') ?? getEpcField(candidate, 'address3', 'addressLine3') ?? '',
      posttown: getEpcField(certObj, 'posttown', 'post-town', 'post_town', 'postTown', 'town', 'city') ?? getEpcField(candidate, 'posttown', 'postTown', 'town') ?? '',
      postcode: getEpcField(certObj, 'postcode', 'post-code', 'post_code') ?? getEpcField(candidate, 'postcode') ?? postcode,
      county: getEpcField(certObj, 'county') ?? getEpcField(candidate, 'county') ?? '',
      lodgementDate: getEpcField(certObj, 'lodgementDate', 'lodgement-date', 'lodgement_date', 'dateRegistered', 'registrationDate', 'registration_date') ?? getEpcField(candidate, 'lodgementDate', 'lodgement-date', 'dateRegistered', 'registrationDate') ?? '',
      inspectionDate: getEpcField(certObj, 'inspectionDate', 'inspection-date', 'inspection_date', 'dateOfAssessment') ?? getEpcField(candidate, 'inspectionDate', 'inspection-date') ?? '',
      rating,
      potentialRating,
      propertyType,
      tenure: getEpcField(certObj, 'tenure') ?? getEpcField(candidate, 'tenure') ?? '',
      uprn: String(getEpcField(certObj, 'uprn', 'buildingReferenceNumber', 'building-reference-number', 'building_reference_number') ?? getEpcField(candidate, 'uprn') ?? ''),
      buildingReferenceNumber: String(getEpcField(certObj, 'buildingReferenceNumber', 'building-reference-number', 'building_reference_number') ?? getEpcField(candidate, 'buildingReferenceNumber', 'building-reference-number') ?? ''),
      constructionAgeBand: getEpcField(certObj, 'constructionAgeBand', 'construction-age-band', 'construction_age_band') ?? getEpcField(candidate, 'constructionAgeBand') ?? '',
      localAuthorityLabel: getEpcField(certObj, 'localAuthorityLabel', 'local-authority-label', 'local_authority_label', 'localAuthorityName') ?? getEpcField(candidate, 'localAuthorityLabel', 'council') ?? '',
      totalFloorArea: String(getEpcField(certObj, 'totalFloorArea', 'total-floor-area', 'total_floor_area') ?? certObj?.technical_information?.floor_area ?? getEpcField(candidate, 'totalFloorArea') ?? ''),
      mainheatcontDescription: getEpcField(certObj, 'mainheatcontDescription', 'mainheatcont-description', 'mainheatcont_description', 'mainHeatingControlsDescription', 'mainHeatingControls') ?? '',
      reportType: getEpcField(certObj, 'reportType', 'report-type', 'report_type') ?? '',
      energyTariff: getEpcField(certObj, 'energyTariff', 'energy-tariff', 'energy_tariff') ?? '',
      mechanicalVentilation: getEpcField(certObj, 'mechanicalVentilation', 'mechanical-ventilation', 'mechanical_ventilation') ?? '',
      co2EmissCurrPerFloorArea: getEpcField(certObj, 'co2EmissCurrPerFloorArea', 'co2-emiss-curr-per-floor-area', 'co2_emiss_curr_per_floor_area', 'co2_emissions_current_per_floor_area') ?? '',
      mainsGasFlag: getEpcField(certObj, 'mainsGasFlag', 'mains-gas-flag', 'mains_gas_flag') ?? '',
      constituencyLabel: getEpcField(certObj, 'constituencyLabel', 'constituency-label', 'constituency_label') ?? getEpcField(candidate, 'constituency') ?? '',
      mainFuel: getEpcField(certObj, 'mainFuel', 'main-fuel', 'main_fuel') ?? certObj?.technical_information?.main_heating_fuel ?? '',
      lightingDescription: lightingDesc,
      multiGlazeProportion: getEpcField(certObj, 'multiGlazeProportion', 'multi-glaze-proportion', 'multi_glaze_proportion') ?? '',
      mainHeatingControls: getEpcField(certObj, 'mainHeatingControls', 'main-heating-controls', 'main_heating_controls') ?? '',
      secondheatDescription: getEpcField(certObj, 'secondheatDescription', 'secondheat-description', 'secondheat_description', 'secondaryHeatingDescription') ?? '',
      transactionType: getEpcField(certObj, 'transactionType', 'transaction-type', 'transaction_type') ?? '',
      lowEnergyLighting: getEpcField(certObj, 'lowEnergyLighting', 'low-energy-lighting', 'low_energy_lighting') ?? '',
      hotwaterDescription: hotwaterDesc,
      builtForm,
      currentEnergyEfficiency: currentScore,
      potentialEnergyEfficiency: potentialScore,
      mainheatDescription: mainheatDesc,
      mainHeatDescription: mainheatDesc,
      wallsDescription: wallsDesc,
      roofDescription: roofDesc,
      windowsDescription: windowsDesc,
      co2EmissionsCurrent: extractCostValue(getEpcField(certObj, 'co2EmissionsCurrent', 'co2-emissions-current', 'co2_emissions_current')),
      co2EmissionsPotential: extractCostValue(getEpcField(certObj, 'co2EmissionsPotential', 'co2-emissions-potential', 'co2_emissions_potential')),
      heatingCostCurrent: extractCostValue(getEpcField(certObj, 'heatingCostCurrent', 'heating-cost-current', 'heating_cost_current')),
      heatingCostPotential: extractCostValue(getEpcField(certObj, 'heatingCostPotential', 'heating-cost-potential', 'heating_cost_potential')),
      hotWaterCostCurrent: extractCostValue(getEpcField(certObj, 'hotWaterCostCurrent', 'hot-water-cost-current', 'hot_water_cost_current')),
      hotWaterCostPotential: extractCostValue(getEpcField(certObj, 'hotWaterCostPotential', 'hot-water-cost-potential', 'hot_water_cost_potential')),
      lightingCostCurrent: extractCostValue(getEpcField(certObj, 'lightingCostCurrent', 'lighting-cost-current', 'lighting_cost_current')),
      lightingCostPotential: extractCostValue(getEpcField(certObj, 'lightingCostPotential', 'lighting-cost-potential', 'lighting_cost_potential')),
      energyConsumptionCurrent: extractCostValue(getEpcField(certObj, 'energyConsumptionCurrent', 'energy-consumption-current', 'energy_consumption_current')),
      energyConsumptionPotential: extractCostValue(getEpcField(certObj, 'energyConsumptionPotential', 'energy-consumption-potential', 'energy_consumption_potential')),
      floorDescription: floorDesc,
      roofEnergyEff: getEpcField(certObj, 'roofEnergyEff', 'roof-energy-eff', 'roof_energy_eff') ?? '',
      windowsEnergyEff: getEpcField(certObj, 'windowsEnergyEff', 'windows-energy-eff', 'windows_energy_eff') ?? '',
      wallsEnergyEff: getEpcField(certObj, 'wallsEnergyEff', 'walls-energy-eff', 'walls_energy_eff') ?? '',
      hotWaterEnergyEff: getEpcField(certObj, 'hotWaterEnergyEff', 'hot-water-energy-eff', 'hot_water_energy_eff') ?? '',
      lightingEnergyEff: getEpcField(certObj, 'lightingEnergyEff', 'lighting-energy-eff', 'lighting_energy_eff') ?? '',
      numberHabitableRooms: getEpcField(certObj, 'numberHabitableRooms', 'number-habitable-rooms', 'number_habitable_rooms') ?? '',
      numberHeatedRooms: getEpcField(certObj, 'numberHeatedRooms', 'number-heated-rooms', 'number_heated_rooms') ?? '',
      lowEnergyFixedLightCount: getEpcField(certObj, 'lowEnergyFixedLightCount', 'low-energy-fixed-light-count', 'low_energy_fixed_light_count'),
      uprnSource: getEpcField(certObj, 'uprnSource', 'uprn-source', 'uprn_source'),
      floorHeight: getEpcField(certObj, 'floorHeight', 'floor-height', 'floor_height'),
      mainheatEnergyEff: getEpcField(certObj, 'mainheatEnergyEff', 'mainheat-energy-eff', 'mainheat_energy_eff'),
      windowsEnvEff: getEpcField(certObj, 'windowsEnvEff', 'windows-env-eff', 'windows_env_eff'),
      lightingEnvEff: getEpcField(certObj, 'lightingEnvEff', 'lighting-env-eff', 'lighting_env_eff'),
      environmentImpactPotential: getEpcField(certObj, 'environmentImpactPotential', 'environment-impact-potential', 'environment_impact_potential'),
      glazedType: getEpcField(certObj, 'glazedType', 'glazed-type', 'glazed_type'),
      sheathingEnergyEff: getEpcField(certObj, 'sheathingEnergyEff', 'sheathing-energy-eff', 'sheathing_energy_eff', 'sheatingEnergyEff', 'sheating-energy-eff'),
      sheatingEnergyEff: getEpcField(certObj, 'sheathingEnergyEff', 'sheathing-energy-eff', 'sheathing_energy_eff', 'sheatingEnergyEff', 'sheating-energy-eff'),
      fixedLightingOutletsCount: getEpcField(certObj, 'fixedLightingOutletsCount', 'fixed-lighting-outlets-count', 'fixed_lighting_outlets_count'),
      solarWaterHeatingFlag: getEpcField(certObj, 'solarWaterHeatingFlag', 'solar-water-heating-flag', 'solar_water_heating_flag'),
      constituency: getEpcField(certObj, 'constituency'),
      localAuthority: getEpcField(certObj, 'localAuthority', 'local-authority', 'local_authority'),
      numberOpenFireplaces: getEpcField(certObj, 'numberOpenFireplaces', 'number-open-fireplaces', 'number_open_fireplaces'),
      glazedArea: getEpcField(certObj, 'glazedArea', 'glazed-area', 'glazed_area'),
      heatLossCorridor: getEpcField(certObj, 'heatLossCorridor', 'heat-loss-corridor', 'heat_loss_corridor'),
      flatStoreyCount: getEpcField(certObj, 'flatStoreyCount', 'flat-storey-count', 'flat_storey_count'),
      roofEnvEff: getEpcField(certObj, 'roofEnvEff', 'roof-env-eff', 'roof_env_eff'),
      environmentImpactCurrent: getEpcField(certObj, 'environmentImpactCurrent', 'environment-impact-current', 'environment_impact_current'),
      floorEnergyEff: getEpcField(certObj, 'floorEnergyEff', 'floor-energy-eff', 'floor_energy_eff'),
      hotWaterEnvEff: getEpcField(certObj, 'hotWaterEnvEff', 'hot-water-env-eff', 'hot_water_env_eff'),
      mainheatcEnergyEff: getEpcField(certObj, 'mainheatcEnergyEff', 'mainheatc-energy-eff', 'mainheatc_energy_eff'),
      wallsEnvEff: getEpcField(certObj, 'wallsEnvEff', 'walls-env-eff', 'walls_env_eff'),
      photoSupply: getEpcField(certObj, 'photoSupply', 'photo-supply', 'photo_supply'),
      mainheatEnvEff: getEpcField(certObj, 'mainheatEnvEff', 'mainheat-env-eff', 'mainheat_env_eff'),
      floorEnvEff: getEpcField(certObj, 'floorEnvEff', 'floor-env-eff', 'floor_env_eff'),
      lodgementDatetime: getEpcField(certObj, 'lodgementDatetime', 'lodgement-datetime', 'lodgement_datetime'),
      flatTopStorey: getEpcField(certObj, 'flatTopStorey', 'flat-top-storey', 'flat_top_storey'),
      extensionCount: getEpcField(certObj, 'extensionCount', 'extension-count', 'extension_count'),
      mainheatcEnvEff: getEpcField(certObj, 'mainheatcEnvEff', 'mainheatc-env-eff', 'mainheatc_env_eff'),
      lmkKey: getEpcField(certObj, 'lmkKey', 'lmk-key', 'lmk_key') ?? certificateNumber,
      windTurbineCount: getEpcField(certObj, 'windTurbineCount', 'wind-turbine-count', 'wind_turbine_count'),
      floorLevel: getEpcField(certObj, 'floorLevel', 'floor-level', 'floor_level'),
      expiryDate,
    };
  } catch (err: any) {
    logs.push(`[EPC] Error occurred during EPC data fetch: ${err?.message || String(err)}`);
    return null;
  }
}
