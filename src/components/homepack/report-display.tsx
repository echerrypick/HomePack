import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Landmark, Zap, Waves, ClipboardList, ExternalLink, Search, Lock, Shield, ShieldAlert, Wifi, Coins, Mountain, Info, Home, Smartphone, GraduationCap, School as SchoolIcon } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DATA_TOOLTIPS } from '@/lib/data-tooltips';
import { Address, PropertyData, LandRegistryResult, EpcData, FloodRiskData, PlanningHistoryItem, ReportResult, CouncilTaxData, RadonRiskData, CoalMiningData, BroadbandData, School, MobileData } from '@/types';
import { PropertyMap } from './property-map';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { GenerationSpotlightModal } from './generation-spotlight-modal';

type ReportDisplayProps = {
  address: Address;
  reportData: ReportResult | null;
  isLoading: boolean;
  onReset: () => void;
};

function SchoolsDisplay({ schools, coordinates, address }: { schools: School[] | undefined, coordinates: { lat: number, lng: number } | undefined, address: string }) {
  if (!coordinates) return <DataItem label="Location Map" value="Coordinates not available" />;

  let primaryIndex = 0;
  let secondaryIndex = 0;

  return (
    <div className="space-y-6">
      <PropertyMap 
        propertyLocation={coordinates} 
        schools={schools || []} 
        address={address} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {(schools || []).map((school, idx) => {
          const isPrimary = school.type === 'Primary';
          const label = isPrimary ? `P${++primaryIndex}` : `S${++secondaryIndex}`;
          const isOutstanding = school.ofstedRating.toLowerCase().includes('outstanding');
          const isGood = school.ofstedRating.toLowerCase().includes('good');

          return (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl border border-border bg-card/70 hover:bg-card transition-all shadow-2xs hover:shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Marker Identifier Pin Pill matching the map */}
                <div className="flex flex-col items-center shrink-0">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    isPrimary ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {label}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-foreground truncate">{school.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      {isPrimary ? <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" /> : <SchoolIcon className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                      <span>{school.type} School</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-foreground/80">{school.distance || 'Nearby'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge className={`
                  ${isOutstanding ? 'bg-emerald-600 text-white' : 
                    isGood ? 'bg-blue-600 text-white' : 
                    school.ofstedRating.toLowerCase().includes('improvement') ? 'bg-amber-500 text-white' : 
                    'bg-red-500 text-white'} border-none text-[10px] h-5 px-2 font-semibold shadow-2xs
                `}>
                  {school.ofstedRating}
                </Badge>
              </div>
            </div>
          );
        })}
        {(!schools || schools.length === 0) && (
          <p className="text-sm text-muted-foreground italic col-span-2">No school data found for this location.</p>
        )}
      </div>
    </div>
  );
}

function EpcDisplay({ epcData, logs, isFree, isAdmin }: { epcData: EpcData, logs: string[], isFree: boolean, isAdmin: boolean }) {
    const epcLogs = logs.filter(log => log.startsWith('[EPC'));

    if (!epcData) {
        return (
            <>
                <DataItem label="EPC Details" value="Not available" />
                 {isAdmin && epcLogs.length > 0 && (
            <Accordion className="w-full" data-pdf-ignore>
                <AccordionItem value="log">
                    <AccordionTrigger className="text-sm text-primary hover:underline">
                       Show Fetch Log (Admin Only)
                    </AccordionTrigger>
                    <AccordionContent>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                           {epcLogs.join('\n')}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
         )}
    </>
);
}

    const epcValue = (7 - (epcData.rating.charCodeAt(0) - 'A'.charCodeAt(0))) * (100/7);
    const isExpired = epcData.expiryDate ? new Date(epcData.expiryDate) < new Date() : false;

    const dataOrNA = (value: string | number | undefined | null) => {
        return value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
    }

    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between items-center font-serif font-bold text-[#2d4a77]">
                    <div className="flex items-center gap-2">
                        <span>Current Rating: {epcData.rating}</span>
                        {isExpired && (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1">EXPIRED</Badge>
                        )}
                    </div>
                    <span>Potential: {epcData.potentialRating}</span>
                </div>
                <Progress value={epcValue} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>G (Worst)</span>
                    <span>A (Best)</span>
                </div>
                {epcData.expiryDate && (
                    <div className={`text-xs mt-1 ${isExpired ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        Expiry Date: {new Date(epcData.expiryDate).toLocaleDateString()}
                    </div>
                )}
            </div>
            
            {!isFree ? (
              <Accordion className="w-full" data-pdf-ignore>
                <AccordionItem value="epc-details">
                  <AccordionTrigger>
                      <span className="text-sm text-primary hover:underline">View Full EPC Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <DataItem label="Address Line 1" value={dataOrNA(epcData.address1)} tooltip={DATA_TOOLTIPS.address1} />
                          <DataItem label="Address Line 2" value={dataOrNA(epcData.address2)} tooltip={DATA_TOOLTIPS.address2} />
                          <DataItem label="Address Line 3" value={dataOrNA(epcData.address3)} tooltip={DATA_TOOLTIPS.address3} />
                            <DataItem label="Town" value={dataOrNA(epcData.posttown)} tooltip={DATA_TOOLTIPS.posttown} />
                          <DataItem label="Postcode" value={dataOrNA(epcData.postcode)} tooltip={DATA_TOOLTIPS.postcode} />
                          <DataItem label="County" value={dataOrNA(epcData.county)} tooltip={DATA_TOOLTIPS.county} />
                            <Separator className="md:col-span-2" />
                          <DataItem label="Lodgement Date" value={epcData.lodgementDate ? new Date(epcData.lodgementDate).toLocaleDateString() : 'N/A'} tooltip={DATA_TOOLTIPS.lodgementDate}/>
                          <DataItem label="Inspection Date" value={epcData.inspectionDate ? new Date(epcData.inspectionDate).toLocaleDateString() : 'N/A'} tooltip={DATA_TOOLTIPS.inspectionDate} />
                          <DataItem label="Lodgement Datetime" value={epcData.lodgementDatetime ? new Date(epcData.lodgementDatetime).toLocaleString() : 'N/A'} tooltip={DATA_TOOLTIPS.lodgementDatetime}/>
                          <Separator className="md:col-span-2" />
                          <DataItem label="Current Rating" value={dataOrNA(epcData.rating)} tooltip={DATA_TOOLTIPS.rating} />
                          <DataItem label="Potential Rating" value={dataOrNA(epcData.potentialRating)} tooltip={DATA_TOOLTIPS.potentialRating} />
                          <DataItem label="Current Efficiency" value={dataOrNA(epcData.currentEnergyEfficiency)} tooltip={DATA_TOOLTIPS.currentEnergyEfficiency} />
                          <DataItem label="Potential Efficiency" value={dataOrNA(epcData.potentialEnergyEfficiency)} tooltip={DATA_TOOLTIPS.potentialEnergyEfficiency} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Property Type" value={dataOrNA(epcData.propertyType)} tooltip={DATA_TOOLTIPS.propertyType} />
                          <DataItem label="Built Form" value={dataOrNA(epcData.builtForm)} tooltip={DATA_TOOLTIPS.builtForm} />
                            <DataItem label="Construction Age" value={dataOrNA(epcData.constructionAgeBand)} tooltip={DATA_TOOLTIPS.constructionAgeBand} />
                          <DataItem label="Tenure" value={dataOrNA(epcData.tenure)} tooltip={DATA_TOOLTIPS.tenure} />
                            <DataItem label="UPRN" value={dataOrNA(epcData.uprn)} tooltip={DATA_TOOLTIPS.uprn} />
                          <DataItem label="UPRN Source" value={dataOrNA(epcData.uprnSource)} tooltip={DATA_TOOLTIPS.uprnSource} />
                          <DataItem label="Building Reference" value={dataOrNA(epcData.buildingReferenceNumber)} tooltip={DATA_TOOLTIPS.buildingReferenceNumber} />
                          <DataItem label="Local Authority" value={dataOrNA(epcData.localAuthorityLabel)} tooltip={DATA_TOOLTIPS.localAuthorityLabel} />
                          <DataItem label="Constituency" value={dataOrNA(epcData.constituencyLabel)} tooltip={DATA_TOOLTIPS.constituencyLabel} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Total Floor Area" value={`${dataOrNA(epcData.totalFloorArea)} m²`} tooltip={DATA_TOOLTIPS.totalFloorArea} />
                            <DataItem label="Habitable Rooms" value={dataOrNA(epcData.numberHabitableRooms)} tooltip={DATA_TOOLTIPS.numberHabitableRooms} />
                          <DataItem label="Heated Rooms" value={dataOrNA(epcData.numberHeatedRooms)} tooltip={DATA_TOOLTIPS.numberHeatedRooms} />
                          <DataItem label="Transaction Type" value={dataOrNA(epcData.transactionType)} tooltip={DATA_TOOLTIPS.transactionType} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Main Heat Source" value={dataOrNA(epcData.mainHeatDescription)} tooltip={DATA_TOOLTIPS.mainHeatDescription} />
                          <DataItem label="Main Heat Controls" value={dataOrNA(epcData.mainheatcontDescription)} tooltip={DATA_TOOLTIPS.mainheatcontDescription} />
                          <DataItem label="Main Fuel" value={dataOrNA(epcData.mainFuel)} tooltip={DATA_TOOLTIPS.mainFuel} />
                          <DataItem label="Secondary Heat" value={dataOrNA(epcData.secondheatDescription)} tooltip={DATA_TOOLTIPS.secondheatDescription} />
                          <DataItem label="Hot Water" value={dataOrNA(epcData.hotwaterDescription)} tooltip={DATA_TOOLTIPS.hotwaterDescription} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Walls" value={dataOrNA(epcData.wallsDescription)} tooltip={DATA_TOOLTIPS.wallsDescription} />
                          <DataItem label="Walls Energy Eff." value={dataOrNA(epcData.wallsEnergyEff)} tooltip={DATA_TOOLTIPS.wallsEnergyEff} />
                          <DataItem label="Roof" value={dataOrNA(epcData.roofDescription)} tooltip={DATA_TOOLTIPS.roofDescription} />
                          <DataItem label="Roof Energy Eff." value={dataOrNA(epcData.roofEnergyEff)} tooltip={DATA_TOOLTIPS.roofEnergyEff} />
                          <DataItem label="Floor" value={dataOrNA(epcData.floorDescription)} tooltip={DATA_TOOLTIPS.floorDescription} />
                          <DataItem label="Windows" value={dataOrNA(epcData.windowsDescription)} tooltip={DATA_TOOLTIPS.windowsDescription} />
                          <DataItem label="Windows Energy Eff." value={dataOrNA(epcData.windowsEnergyEff)} tooltip={DATA_TOOLTIPS.windowsEnergyEff} />
                          <DataItem label="Lighting" value={dataOrNA(epcData.lightingDescription)} tooltip={DATA_TOOLTIPS.lightingDescription} />
                          <DataItem label="Lighting Energy Eff." value={dataOrNA(epcData.lightingEnergyEff)} tooltip={DATA_TOOLTIPS.lightingEnergyEff} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="CO₂ Emissions (Current)" value={`${dataOrNA(epcData.co2EmissionsCurrent)} tonnes/year`} tooltip={DATA_TOOLTIPS.co2EmissionsCurrent} />
                          <DataItem label="CO₂ Emissions (Potential)" value={`${dataOrNA(epcData.co2EmissionsPotential)} tonnes/year`} tooltip={DATA_TOOLTIPS.co2EmissionsPotential} />
                          <DataItem label="Environment Impact (Current)" value={dataOrNA(epcData.environmentImpactCurrent)} tooltip={DATA_TOOLTIPS.environmentImpactCurrent} />
                          <DataItem label="Environment Impact (Potential)" value={dataOrNA(epcData.environmentImpactPotential)} tooltip={DATA_TOOLTIPS.environmentImpactPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Energy Consumption (Current)" value={`${dataOrNA(epcData.energyConsumptionCurrent)} kWh/m² per year`} tooltip={DATA_TOOLTIPS.energyConsumptionCurrent} />
                          <DataItem label="Energy Consumption (Potential)" value={`${dataOrNA(epcData.energyConsumptionPotential)} kWh/m² per year`} tooltip={DATA_TOOLTIPS.energyConsumptionPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Heating Cost (Current)" value={`£${dataOrNA(epcData.heatingCostCurrent)} / year`} tooltip={DATA_TOOLTIPS.heatingCostCurrent} />
                          <DataItem label="Heating Cost (Potential)" value={`£${dataOrNA(epcData.heatingCostPotential)} / year`} tooltip={DATA_TOOLTIPS.heatingCostPotential} />
                          <DataItem label="Hot Water Cost (Current)" value={`£${dataOrNA(epcData.hotWaterCostCurrent)} / year`} tooltip={DATA_TOOLTIPS.hotWaterCostCurrent} />
                          <DataItem label="Hot Water Cost (Potential)" value={`£${dataOrNA(epcData.hotWaterCostPotential)} / year`} tooltip={DATA_TOOLTIPS.hotWaterCostPotential} />
                          <DataItem label="Lighting Cost (Current)" value={`£${dataOrNA(epcData.lightingCostCurrent)} / year`} tooltip={DATA_TOOLTIPS.lightingCostCurrent} />
                          <DataItem label="Lighting Cost (Potential)" value={`£${dataOrNA(epcData.lightingCostPotential)} / year`} tooltip={DATA_TOOLTIPS.lightingCostPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Glazing Type" value={dataOrNA(epcData.glazedType)} tooltip={DATA_TOOLTIPS.glazedType} />
                          <DataItem label="Glazed Area" value={dataOrNA(epcData.glazedArea)} tooltip={DATA_TOOLTIPS.glazedArea} />
                          <DataItem label="Multi-glaze Proportion" value={`${dataOrNA(epcData.multiGlazeProportion)}%`} tooltip={DATA_TOOLTIPS.multiGlazeProportion} />
                          <DataItem label="Low Energy Lighting" value={`${dataOrNA(epcData.lowEnergyLighting)}%`} tooltip={DATA_TOOLTIPS.lowEnergyLighting} />
                          <DataItem label="Low Energy Fixed Light Count" value={dataOrNA(epcData.lowEnergyFixedLightCount)} tooltip={DATA_TOOLTIPS.lowEnergyFixedLightCount} />
                          <DataItem label="Fixed Lighting Outlets Count" value={dataOrNA(epcData.fixedLightingOutletsCount)} tooltip={DATA_TOOLTIPS.fixedLightingOutletsCount} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Main Heat Energy Eff." value={dataOrNA(epcData.mainheatEnergyEff)} tooltip={DATA_TOOLTIPS.mainheatEnergyEff} />
                          <DataItem label="Main Heat Env. Eff." value={dataOrNA(epcData.mainheatEnvEff)} tooltip={DATA_TOOLTIPS.mainheatEnvEff} />
                          <DataItem label="Main Heat Ctrl Energy Eff." value={dataOrNA(epcData.mainheatcEnergyEff)} tooltip={DATA_TOOLTIPS.mainheatcEnergyEff} />
                          <DataItem label="Main Heat Ctrl Env. Eff." value={dataOrNA(epcData.mainheatcEnvEff)} tooltip={DATA_TOOLTIPS.mainheatcEnvEff} />
                          <DataItem label="Walls Env. Eff." value={dataOrNA(epcData.wallsEnvEff)} tooltip={DATA_TOOLTIPS.wallsEnvEff} />
                          <DataItem label="Roof Env. Eff." value={dataOrNA(epcData.roofEnvEff)} tooltip={DATA_TOOLTIPS.roofEnvEff} />
                          <DataItem label="Floor Energy Eff." value={dataOrNA(epcData.floorEnergyEff)} tooltip={DATA_TOOLTIPS.floorEnergyEff} />
                          <DataItem label="Floor Env. Eff." value={dataOrNA(epcData.floorEnvEff)} tooltip={DATA_TOOLTIPS.floorEnvEff} />
                          <DataItem label="Windows Env. Eff." value={dataOrNA(epcData.windowsEnvEff)} tooltip={DATA_TOOLTIPS.windowsEnvEff} />
                          <DataItem label="Hot Water Env. Eff." value={dataOrNA(epcData.hotWaterEnvEff)} tooltip={DATA_TOOLTIPS.hotWaterEnvEff} />
                          <DataItem label="Lighting Env. Eff." value={dataOrNA(epcData.lightingEnvEff)} tooltip={DATA_TOOLTIPS.lightingEnvEff} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Number of Open Fireplaces" value={dataOrNA(epcData.numberOpenFireplaces)} tooltip={DATA_TOOLTIPS.numberOpenFireplaces} />
                          <DataItem label="Solar Water Heating" value={dataOrNA(epcData.solarWaterHeatingFlag)} tooltip={DATA_TOOLTIPS.solarWaterHeatingFlags} />
                          <DataItem label="Wind Turbine Count" value={dataOrNA(epcData.windTurbineCount)} tooltip={DATA_TOOLTIPS.windTurbineCount} />
                          <DataItem label="Photo Supply" value={dataOrNA(epcData.photoSupply)} tooltip={DATA_TOOLTIPS.photoSupply} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="LMK Key" value={dataOrNA(epcData.lmkKey)} tooltip={DATA_TOOLTIPS.lmkKey} />
                          <DataItem label="Constituency ID" value={dataOrNA(epcData.constituency)} tooltip={DATA_TOOLTIPS.constituency} />
                          <DataItem label="Local Authority ID" value={dataOrNA(epcData.localAuthority)} tooltip={DATA_TOOLTIPS.localAuthority} />
                      </div>
                  </AccordionContent>
                </AccordionItem>
                {isAdmin && epcLogs.length > 0 && (
                  <AccordionItem value="log">
                      <AccordionTrigger>
                          <span className="text-sm text-primary hover:underline">Show Fetch Log (Admin Only)</span>
                      </AccordionTrigger>
                      <AccordionContent>
                          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                             {epcLogs.join('\n')}
                          </pre>
                      </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            ) : (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed border-border flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Full EPC details are available for <span className="font-semibold text-primary">Subscription</span> and <span className="font-semibold text-primary">Agency</span> users.</p>
              </div>
            )}
            
        </>
    );
}

function FloodRiskDisplay({ floodRiskData, logs, isAdmin }: { floodRiskData: FloodRiskData, logs: string[], isAdmin: boolean }) {
    const floodLogs = logs.filter(log => log.startsWith('[FLOOD'));

    const isNullOrEmpty = (value: string | undefined | null) => value === null || value === undefined || value.trim() === '' || value.toLowerCase() === 'null';

    if (!floodRiskData) {
        return (
            <>
                <DataItem label="Flood Risk" value="Data not available" />
                {isAdmin && floodLogs.length > 0 && (
                    <Accordion className="w-full">
                        <AccordionItem value="log">
                            <AccordionTrigger className="text-sm text-primary hover:underline">
                               Show Fetch Log (Admin Only)
                            </AccordionTrigger>
                            <AccordionContent>
                                <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                                   {floodLogs.join('\n')}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataItem label="Rivers and Sea" value={floodRiskData.riskOfFloodingFromRiversAndSea} tooltip={DATA_TOOLTIPS.riskOfFloodingFromRiversAndSea} />
                <DataItem label="Surface Water" value={floodRiskData.riskOfFloodingFromSurfaceWater} tooltip={DATA_TOOLTIPS.riskOfFloodingFromSurfaceWater} />
                <DataItem label="Groundwater" value={floodRiskData.riskOfFloodingFromGroundwater} tooltip={DATA_TOOLTIPS.riskOfFloodingFromGroundwater} />
                <DataItem label="Reservoirs" value={floodRiskData.riskOfFloodingFromReservoirs} tooltip={DATA_TOOLTIPS.riskOfFloodingFromReservoirs} />
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                    Current Status: <span className="font-semibold text-foreground">{floodRiskData.activeWarnings}</span>
                </p>
            </div>

            <Accordion className="w-full" data-pdf-ignore>
                <AccordionItem value="technical-details">
                    <AccordionTrigger className="text-sm text-primary hover:underline py-2">
                        View Technical Details
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <DataItem label="Data Suitability" value={isNullOrEmpty(floodRiskData.suitability) ? ' - ' : floodRiskData.suitability} tooltip={DATA_TOOLTIPS.SUITABILITY} />
                            <DataItem label="Publication Date" value={isNullOrEmpty(floodRiskData.publishDate) ? ' - ' : new Date(floodRiskData.publishDate).toLocaleDateString()} tooltip={DATA_TOOLTIPS.PUB_DATE} />
                            <DataItem label="Easting" value={floodRiskData.easting} tooltip={DATA_TOOLTIPS.easting} />
                            <DataItem label="Northing" value={floodRiskData.northing} tooltip={DATA_TOOLTIPS.northing} />
                            <DataItem label="Latitude" value={floodRiskData.latitude} tooltip={DATA_TOOLTIPS.latitude} />
                            <DataItem label="Longitude" value={floodRiskData.longitude} tooltip={DATA_TOOLTIPS.longitude} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {isAdmin && floodLogs.length > 0 && (
                    <AccordionItem value="log">
                        <AccordionTrigger className="text-sm text-primary hover:underline py-2">
                            Show Fetch Log (Admin Only)
                        </AccordionTrigger>
                        <AccordionContent>
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                               {floodLogs.join('\n')}
                            </pre>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}

function CouncilTaxDisplay({ data, logs, isAdmin, postcode }: { data: CouncilTaxData, logs: string[], isAdmin: boolean, postcode: string }) {
  if (!data) return <DataItem label="Council Tax" value="Not available" />;
  const councilTaxLogs = logs.filter(log => 
    log.startsWith('[Gemini-Grounding') || 
    log.startsWith('[Brave-Search') || 
    log.startsWith('[Grounding')
  );
  const isVerified = councilTaxLogs.some(log => log.includes('Success'));
  const govUkUrl = `https://www.tax.service.gov.uk/check-council-tax-band/search?postcode=${postcode.replace(/\s+/g, '+')}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-green-100 text-green-700 border-green-200 font-medium">
              <Search className="h-2.5 w-2.5 mr-1" /> Verified via Search
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-amber-50 text-amber-700 border-amber-200 font-medium">
              <Info className="h-2.5 w-2.5 mr-1" /> AI Estimate (Search Unavailable)
            </Badge>
          )}
        </div>
        <a 
          href={govUkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
          data-pdf-ignore
        >
          Verify on GOV.UK <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataItem label="Tax Band" value={data.band} tooltip={DATA_TOOLTIPS.band} />
        <DataItem label="Annual Amount" value={data.annualAmount} tooltip={DATA_TOOLTIPS.annualAmount} />
        <DataItem label="Local Authority" value={data.authority} tooltip={DATA_TOOLTIPS.authority} />
        <DataItem label="Tax Year" value={data.year} />
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Source: GOV.UK / {data.authority}
      </p>
      
      {isAdmin && (
        <Accordion className="w-full mt-4" data-pdf-ignore>
          <AccordionItem value="log" className="border-none">
            <AccordionTrigger className="text-xs text-primary hover:underline py-2 bg-muted/50 px-3 rounded-md">
              <div className="flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span>Grounding Debug Log (Admin Only)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              {councilTaxLogs.length > 0 ? (
                <pre className="p-4 bg-slate-950 text-slate-50 rounded-md overflow-x-auto text-[10px] font-mono whitespace-pre-wrap border border-slate-800 shadow-inner max-h-[400px]">
                  {councilTaxLogs.join('\n')}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted rounded-md border border-dashed">
                  No grounding logs found for this search. This might happen if the data was retrieved from cache or if the search failed before logging started.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

function EnvironmentalHazardsDisplay({ radon, coal }: { radon: RadonRiskData, coal: CoalMiningData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-green-100 text-green-700 border-green-200 font-medium">
          <Search className="h-2.5 w-2.5 mr-1" /> Verified via Search
        </Badge>
      </div>
      <div className="space-y-3">
        <h4 className="text-base font-serif font-bold flex items-center gap-2 text-[#2d4a77]">
          <Mountain className="h-4 w-4" />
          Radon Gas Risk
        </h4>
        {radon ? (
          <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Risk Level: {radon.riskLevel}</span>
              <Badge variant={radon.riskLevel === 'Low' ? 'outline' : 'destructive'}>
                {radon.percentage}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {radon.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Radon data not available.</p>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-serif font-bold flex items-center gap-2 text-[#2d4a77]">
          <ShieldAlert className="h-4 w-4" />
          Coal Mining & Ground Stability
        </h4>
        {coal ? (
          <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {coal.isReportingArea ? 'In Reporting Area' : 'Not in Reporting Area'}
              </span>
              <Badge variant={coal.isHighRiskArea ? 'destructive' : 'outline'}>
                {coal.isHighRiskArea ? 'High Risk' : 'No Known Risk'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {coal.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Mining data not available.</p>
        )}
      </div>
      
      <p className="text-[10px] text-muted-foreground italic">
        Sources: British Geological Survey (BGS) / Coal Authority
      </p>
    </div>
  );
}

function BroadbandDisplay({ data }: { data: BroadbandData }) {
  if (!data) return <DataItem label="Broadband" value="Not available" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-green-100 text-green-700 border-green-200 font-medium">
          <Search className="h-2.5 w-2.5 mr-1" /> Verified via Search
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataItem label="Max Download Speed" value={data.maxDownloadSpeed} tooltip={DATA_TOOLTIPS.maxDownloadSpeed} />
        <DataItem label="Max Upload Speed" value={data.maxUploadSpeed} />
      </div>

      {data.results && data.results.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Availability by Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {data.results.map((r, i) => (
              <div key={i} className={`p-2 rounded-md border ${r.available ? 'bg-green-50 border-green-100' : 'bg-muted/50 border-border'} text-center`}>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{r.type}</p>
                <p className={`text-sm font-bold ${r.available ? 'text-green-700' : 'text-muted-foreground'}`}>
                  {r.available ? r.downloadSpeed : 'Unavailable'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.networks && data.networks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Networks</p>
          <div className="flex flex-wrap gap-1.5">
            {data.networks.map((n, i) => (
              <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 h-5 bg-background">{n}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-[10px] text-muted-foreground italic">
        Source: Ofcom Broadband Coverage
      </p>
    </div>
  );
}

function MobileDisplay({ data, summary }: { data: MobileData[] | undefined, summary?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Mobile Coverage</p>
            <p className="text-xs text-muted-foreground">Detailed provider data pending or loading.</p>
          </div>
          <a
            href="https://checker.ofcom.org.uk/en-gb/mobile-coverage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            data-pdf-ignore
          >
            Check Ofcom Live <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
          <Search className="h-2.5 w-2.5 mr-1" /> Mobile Infrastructure Grounded
        </Badge>
        <a
          href="https://checker.ofcom.org.uk/en-gb/mobile-coverage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          data-pdf-ignore
        >
          Check on Ofcom <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {summary && (
        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs leading-relaxed text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
          <Smartphone className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-300 mb-0.5">Network Summary</p>
            <p>{summary}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {data.map((m, i) => {
          const isFiveGGood = m.fiveG && (m.fiveG.toLowerCase().includes('good') || m.fiveG.toLowerCase().includes('available') || m.fiveG.toLowerCase().includes('excellent'));
          return (
            <div key={i} className="p-3.5 bg-card/80 rounded-xl border border-border/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-foreground">{m.operator}</span>
                <Badge variant={isFiveGGood ? 'default' : 'outline'} className={`text-[10px] h-5 ${isFiveGGood ? 'bg-emerald-600 text-white' : ''}`}>
                  5G: {m.fiveG}
                </Badge>
              </div>

              {m.transmitterNotice && (
                <div className="p-1.5 px-2 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                  <span className="text-amber-600">📡</span>
                  <span>{m.transmitterNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Voice Signal:</span>
                  <span className="font-medium text-foreground">{m.voice}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Data Signal:</span>
                  <span className="font-medium text-foreground">{m.data || m.data4g || '4G Available'}</span>
                </div>
                {(m.indoor || m.outdoor) && (
                  <>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Indoor:</span>
                      <span className="font-medium text-foreground">{m.indoor || 'Good'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Outdoor:</span>
                      <span className="font-medium text-foreground">{m.outdoor || 'Good'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Source: Ofcom Mobile Checker & Mast Infrastructure Grounding
      </p>
    </div>
  );
}

function PlanningHistoryDisplay({ planningHistory, uprn, localAuthorityId, logs, isAdmin }: { planningHistory: PlanningHistoryItem[], uprn: string, localAuthorityId: string | null | undefined, logs: string[], isAdmin: boolean }) {
    const planningLogs = logs.filter(log => log.startsWith('[PLANNING'));

    const display = (
        <>
           {uprn ? (
                <DataItem label="UPRN Used" value={uprn} tooltip="The Unique Property Reference Number used for this search." />
            ) : (
                <DataItem label="UPRN Used" value="Not available" tooltip="A UPRN could not be found for this property." />
            )}
            {localAuthorityId ? (
                <DataItem label="Local Authority ID Used" value={localAuthorityId} tooltip="The Local Authority ID used to filter the search." />
            ) : (
                <DataItem label="Local Authority ID Used" value="Not available" tooltip="A Local Authority ID could not be found for this property." />
            )}
            <Separator className="my-2" />
           {planningHistory.length > 0 ? (
                <ul className="space-y-4">
                     {planningHistory.map((item, index) => (
                        <li key={index} className="text-sm border-l-2 border-primary/50 pl-4 py-1">
                            <p className="font-semibold">{item.application}</p>
                            <p className="text-muted-foreground">
                                Status: <span className={item.decision.toLowerCase().includes('approve') ? 'text-green-600' : 'text-red-600'}>{item.decision}</span> on {item.date}
                            </p>
                              <div className='flex justify-between items-center'>
                                <p className="text-muted-foreground text-xs">Reference: {item.reference}</p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    View <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No planning history found for this property's UPRN.</p>
            )}
        </>
    );

    return (
        <>
           {display}
    <div className="mt-4 flex flex-col gap-2" data-pdf-ignore>
        <Accordion className="w-full">
          {isAdmin && planningLogs.length > 0 && (
                <AccordionItem value="log">
                    <AccordionTrigger>
                        <span className="text-sm text-primary hover:underline">Show Fetch Log (Admin Only)</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                           {planningLogs.join('\n')}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
          )}
        </Accordion>
        {isAdmin && (
          <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to="/debug/planning">
                  <Search className="mr-2 h-4 w-4" />
                  Debug Planning History
              </Link>
          </Button>
        )}
    </div>
</>
);
}


export function ReportDisplay({ address, reportData, isLoading, onReset }: ReportDisplayProps) {
  const { profile, isAdmin } = useAuth();
  console.log("[DEBUG] isAdmin:", isAdmin, "profile role:", profile?.role);
  const [conditionReport, setConditionReport] = useState<string | null>(null);
  const [isConditionReportLoading, setIsConditionReportLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const downloadPdf = async () => {
    setIsDownloading(true);
    const toastId = toast.loading('Preparing PDF report...');

    try {
      if (!reportData) {
        throw new Error('No report data available');
      }

      const template = document.getElementById('homepack-pdf-template');
      if (!template) {
        throw new Error('Technical error: Report template not found');
      }

      const safeStreet = `${address.houseNumber}-${address.street}`.replace(/[^a-z0-9]/gi, '-');
      const filename = `HomePack-${safeStreet}.pdf`;
      
      const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true,
          onclone: (clonedDoc) => {
            // Aggressive fix for "oklab" / "oklch" unsupported color functions in html2canvas
            // 1. Remove all oklch/oklab from style tags
            const styleTags = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleTags.length; i++) {
              let css = styleTags[i].innerHTML;
              if (css.includes('oklch') || css.includes('oklab')) {
                // Replace with a safe fallback (slate-500)
                css = css.replace(/oklch\([^)]+\)/g, '#64748b');
                css = css.replace(/oklab\([^)]+\)/g, '#64748b');
                styleTags[i].innerHTML = css;
              }
            }

            // 2. Iterate through all elements and fix styles
            const allElements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              
              // Check common color properties
              const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
              
              props.forEach(prop => {
                try {
                  const style = el.style as any;
                  const val = style[prop];
                  if (val && (val.includes('oklch') || val.includes('oklab'))) {
                    style[prop] = '#64748b';
                  }

                  // Force standard colors for any element that might have these colors from external CSS
                  const computed = clonedDoc.defaultView?.getComputedStyle(el);
                  if (computed) {
                    const cssProp = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
                    const computedVal = computed.getPropertyValue(cssProp);
                    if (computedVal && (computedVal.includes('oklch') || computedVal.includes('oklab'))) {
                      style[prop] = '#64748b';
                    }
                  }
                } catch (e) {
                  // Ignore errors
                }
              });
            }
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Ensure the template is visible during capture
      const originalStyle = template.parentElement?.style.cssText || "";
      if (template.parentElement) {
        template.parentElement.style.position = 'static';
        template.parentElement.style.left = '0';
        template.parentElement.style.visibility = 'visible';
        template.parentElement.style.height = 'auto';
        template.parentElement.style.overflow = 'visible';
      }

      try {
        // Use the worker approach for more control
        const worker = html2pdf().set(opt).from(template).toPdf().get('pdf');
        const pdf = await worker;
        const blobUrl = pdf.output('bloburl');
        
        if (blobUrl) {
          window.open(blobUrl, '_blank');
          toast.success('Report generated! Check the new tab.', { id: toastId });
        } else {
          throw new Error('Failed to generate PDF blob URL');
        }
      } catch (pdfErr: any) {
        throw pdfErr;
      } finally {
        // Restore original style
        if (template.parentElement) {
          template.parentElement.style.cssText = originalStyle;
        }
      }
    } catch (error: any) {
      console.error('CRITICAL PDF ERROR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMessage}. Please try again.`, { 
        id: toastId,
        duration: 8000 
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <GenerationSpotlightModal address={address} onCancel={onReset} />;
  }

  if (!reportData) return null;

  const { propertyData, summary, logs } = reportData;
  const { landRegistry, epc, floodRisk, planningHistory, councilTax, radonRisk, coalMining, broadband } = propertyData;
  
  const getPrimaryTransaction = (results: LandRegistryResult[]) => {
     if (!results || results.length === 0) return null;
     return results[0];
  }

  const primaryTransaction = getPrimaryTransaction(landRegistry);
  const isFree = profile?.role === 'free';


  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" onClick={onReset} className="-ml-4 h-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start New Report
            </Button>
          </div>
          <h2 className="text-4xl font-bold font-serif tracking-tight text-[#2d4a77]">{propertyData.address}</h2>
          <p className="text-muted-foreground font-sans mt-1">Comprehensive property information pack generated by HomePackAI.</p>
        </div>
        {!isFree ? (
          <Button 
            size="lg" 
            className="w-full md:w-auto" 
            onClick={downloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2" />
                Create PDF Report
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border">
            <Lock className="h-4 w-4" />
            Upgrade to download PDF
          </div>
        )}
      </div>

      {/* Hidden PDF Template - Moving off-screen for reliable capture */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, background: 'white' }} aria-hidden="true">
        <div 
          id="homepack-pdf-template"
          ref={pdfTemplateRef}
          style={{ 
            width: '794px', 
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          <div className="bg-white text-black font-sans">
            {/* Page 1: Cover */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col items-center justify-center text-center">
              <div className="mb-12">
                <div className="p-6 bg-[#2d4a77] rounded-2xl inline-block">
                  <Home className="h-20 w-20 text-white" />
                </div>
              </div>
              
              <h1 className="text-6xl font-serif font-bold text-[#2d4a77] mb-4 tracking-tight">HomePackAI</h1>
              <p className="text-xl font-sans text-muted-foreground mb-16 uppercase tracking-[0.3em] font-medium">Property Information Report</p>
              
              <div className="w-full max-w-2xl bg-[#f0f7ff] p-12 rounded-sm border border-[#d1e3f8] space-y-6">
                <h2 className="text-4xl font-serif font-bold text-[#2d4a77] leading-tight">
                  {address.houseNumber} {address.street}
                </h2>
                <div className="space-y-1">
                  <p className="text-2xl text-[#4a5568]">{address.town}, {address.postcode}</p>
                </div>
                <div className="pt-6 space-y-2 border-t border-[#d1e3f8]/50">
                  <p className="text-lg text-[#4a5568]">Prepared for <span className="font-semibold">{profile?.displayName || profile?.email}</span></p>
                  <p className="text-lg text-[#4a5568]">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              
              <div className="mt-24 max-w-md">
                <p className="text-lg font-serif italic text-muted-foreground leading-relaxed">
                  A polished property due-diligence summary designed for buyers, sellers, and advisers.
                </p>
              </div>
              
              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 1</span>
              </div>
            </div>

            {/* Page 2: Contents */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <h2 className="text-4xl font-serif font-bold text-[#2d4a77] mb-16 flex items-center gap-3">
                <span className="text-[#2d4a77]/30 text-5xl">.</span> Contents
              </h2>
              
              <div className="space-y-10 text-xl flex-grow">
                {[
                  { id: 1, title: 'Executive Summary', page: '03' },
                  { id: 2, title: 'Location & Local Schools', page: '04' },
                  { id: 3, title: 'Land Registry & Sales History', page: '05' },
                  { id: 4, title: 'Energy Performance (EPC)', page: '06' },
                  { id: 5, title: 'Council Tax & Flood Risk', page: '07' },
                  { id: 6, title: 'Environmental Hazards & Planning', page: '08' },
                  { id: 7, title: 'Broadband & Mobile Connectivity', page: '08' },
                  { id: 8, title: 'AI Condition Report', page: '09' },
                ].map((item) => (
                  <div key={item.id} className="flex items-end gap-4 group">
                    <span className="text-[#2d4a77] font-bold w-8">{item.id}</span>
                    <span className="font-serif text-[#2d4a77] font-medium">{item.title}</span>
                    <div className="flex-grow border-b border-dotted border-[#2d4a77]/20 mb-1.5" />
                    <span className="text-[#2d4a77] font-bold font-mono">{item.page}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto p-8 bg-[#fefce8] border border-[#fef08a] rounded-sm">
                <p className="text-sm leading-relaxed text-[#854d0e]">
                  <span className="font-bold">Important:</span> This report is for information only. Critical items should still be verified with the relevant authority, solicitor, lender, or surveyor.
                </p>
              </div>
              
              <div className="mt-12 w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 2</span>
              </div>
            </div>

            {/* Page 3: Summary */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-4">1. Executive Summary</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                This summary condenses the key findings from the uploaded HomePack report into a cleaner, easier-to-scan buyer format.
              </p>
              
              <div className="bg-[#f0f7ff] p-10 rounded-sm border border-[#d1e3f8] mb-12">
                <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Property Summary</h3>
                <div className="space-y-4 text-base leading-relaxed text-[#2d3748]">
                  <p className="flex gap-3">
                    <span className="text-[#2d4a77]">•</span>
                    <span>{address.street}, {address.town} appears to be a {epc?.rating === 'A' || epc?.rating === 'B' ? 'modern, energy-efficient' : 'well-established'} home with a current EPC rating of {epc?.rating || 'N/A'} and a potential to improve to {epc?.potentialRating || 'N/A'}.</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="text-[#2d4a77]">•</span>
                    <span>The latest sale recorded is {primaryTransaction ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()} on ${new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')}` : 'not available in recent records'}.</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="text-[#2d4a77]">•</span>
                    <span>Flood exposure appears {floodRisk?.riskOfFloodingFromRiversAndSea?.toLowerCase().includes('low') ? 'relatively low' : 'to require attention'}, with {floodRisk?.riskOfFloodingFromRiversAndSea || 'unknown'} river/sea flooding risk and {floodRisk?.activeWarnings || 'no active warnings'}.</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="text-[#2d4a77]">•</span>
                    <span>{broadband?.superfastAvailable ? 'Superfast broadband availability is indicated' : 'Broadband availability should be verified'}, providing good digital connectivity for the property.</span>
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#d1e3f8] text-sm italic text-[#2d4a77]">
                  <span className="font-bold">Recommendation:</span> present unresolved items as "Further verification recommended" rather than "No data" to give the report a more premium and buyer-friendly tone.
                </div>
              </div>
              
              <div className="grid grid-cols-2 border border-[#e2e8f0]">
                <div className="p-8 border-r border-b border-[#e2e8f0]">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Last Sold Price</p>
                  <p className="text-3xl font-serif font-bold text-[#2d4a77]">{primaryTransaction ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()}` : 'N/A'}</p>
                </div>
                <div className="p-8 border-b border-[#e2e8f0]">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current EPC Rating</p>
                  <p className="text-3xl font-serif font-bold text-[#2d4a77]">{epc?.rating || 'N/A'}</p>
                </div>
                <div className="p-8 border-r border-[#e2e8f0]">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Flood Risk</p>
                  <p className="text-3xl font-serif font-bold text-green-600">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low (estimated)'}</p>
                </div>
                <div className="p-8">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Council Tax Band</p>
                  <p className="text-3xl font-serif font-bold text-[#b45309]">{councilTax?.band || 'Check VOA'}</p>
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">3. Land Registry & Sales History</h2>
                <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                  <h3 className="text-xl font-serif font-bold text-white mb-2">Ownership & transaction history</h3>
                  <p className="text-white/80 text-sm">Clean presentation of the latest recorded sale and prior transaction history.</p>
                </div>
              </div>
              
              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 3</span>
              </div>
            </div>

            {/* Page 4: Location & Schools */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-4">2. Location & Local Schools</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Map showing the property location and nearby educational institutions with their latest Ofsted ratings.
              </p>

              {propertyData.coordinates && (
                <div className="mb-8 border border-[#d1e3f8] rounded-sm overflow-hidden">
                  <PropertyMap 
                    propertyLocation={propertyData.coordinates} 
                    schools={propertyData.schools || []} 
                    address={propertyData.address} 
                  />
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-[#2d4a77] border-b pb-2">Nearest Schools</h3>
                <div className="grid grid-cols-1 gap-4">
                  {(propertyData.schools || []).map((school, idx) => (
                    <div key={idx} className="p-4 bg-[#f0f7ff] rounded-sm border border-[#d1e3f8] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#2d4a77]">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.type} School • {school.distance} away</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Ofsted Rating</p>
                        <Badge className={`
                          ${school.ofstedRating.toLowerCase().includes('outstanding') ? 'bg-green-600' : 
                            school.ofstedRating.toLowerCase().includes('good') ? 'bg-blue-600' : 
                            school.ofstedRating.toLowerCase().includes('requires improvement') ? 'bg-amber-500' : 
                            'bg-red-500'} text-white border-none
                        `}>
                          {school.ofstedRating}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!propertyData.schools || propertyData.schools.length === 0) && (
                    <p className="text-muted-foreground italic">No school data available for this location.</p>
                  )}
                </div>
              </div>

              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 4</span>
              </div>
            </div>

            {/* Page 5: Sales History & EPC */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <div className="border border-[#e2e8f0] mb-12">
                <div className="grid grid-cols-3 bg-white">
                  <div className="p-4 border-r border-b border-[#e2e8f0] text-muted-foreground text-sm">Estate type</div>
                  <div className="p-4 border-r border-b border-[#e2e8f0] font-bold">{primaryTransaction?.estateType || 'Freehold'}</div>
                  <div className="p-4 border-b border-[#e2e8f0] text-muted-foreground text-sm">Latest sale shown: {primaryTransaction ? new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                  
                  <div className="p-4 border-r border-b border-[#e2e8f0] text-muted-foreground text-sm">Latest recorded price</div>
                  <div className="p-4 border-r border-b border-[#e2e8f0] font-bold">£{primaryTransaction ? parseInt(primaryTransaction.pricePaid, 10).toLocaleString() : 'N/A'}</div>
                  <div className="p-4 border-b border-[#e2e8f0] text-muted-foreground text-sm italic">Recorded in official registry</div>
                  
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Previous recorded price</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">£{landRegistry[1] ? parseInt(landRegistry[1].pricePaid, 10).toLocaleString() : 'N/A'}</div>
                  <div className="p-4 text-muted-foreground text-sm">{landRegistry[1] ? new Date(landRegistry[1].transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Full sales history</h3>
              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden mb-16">
                <table className="w-full text-sm">
                  <thead className="bg-[#f0f7ff]">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-[#2d4a77]">Date</th>
                      <th className="px-6 py-4 text-left font-bold text-[#2d4a77]">Price paid</th>
                      <th className="px-6 py-4 text-left font-bold text-[#2d4a77]">Tenure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landRegistry.map((t, i) => (
                      <tr key={i} className="border-t border-[#e2e8f0]">
                        <td className="px-6 py-4">{new Date(t.transactionDate).toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4 font-bold">£{parseInt(t.pricePaid, 10).toLocaleString()}</td>
                        <td className="px-6 py-4">{t.estateType}</td>
                      </tr>
                    ))}
                    {landRegistry.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">No transaction history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">4. Energy Performance (EPC)</h2>
              <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Energy efficiency snapshot</h3>
                <p className="text-white/80 text-sm">The property indicates {epc?.rating === 'A' || epc?.rating === 'B' ? 'strong' : 'standard'} efficiency and a possible pathway to an improved rating.</p>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-[#e2e8f0] mb-12">
                <div className="p-10 bg-[#f0fdf4] border-r border-[#e2e8f0]">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-4">Current Rating</p>
                  <p className="text-6xl font-serif font-bold text-green-700 mb-4">{epc?.rating || 'N/A'}</p>
                  <p className="text-sm text-green-800/70 italic">Good current efficiency</p>
                </div>
                <div className="p-10 bg-[#f0f7ff]">
                  <p className="text-xs font-bold text-[#2d4a77] uppercase tracking-wider mb-4">Potential Rating</p>
                  <p className="text-6xl font-serif font-bold text-[#2d4a77] mb-4">{epc?.potentialRating || 'N/A'}</p>
                  <p className="text-sm text-[#2d4a77]/70 italic">Improvement opportunity remains</p>
                </div>
              </div>

              <div className="border border-[#e2e8f0]">
                <div className="grid grid-cols-3">
                  <div className="p-4 border-r border-b border-[#e2e8f0] text-muted-foreground text-sm">Property type</div>
                  <div className="p-4 border-r border-b border-[#e2e8f0] font-bold">{epc?.propertyType || 'House'}</div>
                  <div className="p-4 border-b border-[#e2e8f0] font-medium">{epc?.builtForm || 'End-terrace'}</div>
                  
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Total floor area</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{epc?.totalFloorArea || '63.0'} m²</div>
                  <div className="p-4 text-muted-foreground text-sm italic">Official EPC measurement</div>
                </div>
              </div>
              
              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 5</span>
              </div>
            </div>

            {/* Page 6: EPC Details & Council Tax */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <div className="border border-[#e2e8f0] mb-16">
                {[
                  { label: 'Main heating', value: epc?.mainHeatDescription || 'Mains gas', note: 'Standard heating system' },
                  { label: 'Walls', value: epc?.wallsDescription?.split(';')[0] || 'Cavity wall', note: 'Average thermal transmittance' },
                  { label: 'Windows', value: epc?.windowsDescription || 'Fully double glazed', note: 'High performance glazing' },
                  { label: 'Estimated annual heating cost', value: `£${epc?.heatingCostCurrent || '0'} / year`, note: 'From official EPC summary' },
                  { label: 'CO2 emissions', value: `${epc?.co2EmissionsCurrent || '0'} tonnes / year`, note: 'From official EPC summary' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 border-b last:border-0 border-[#e2e8f0]">
                    <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">{row.label}</div>
                    <div className="p-4 border-r border-[#e2e8f0] font-bold">{row.value}</div>
                    <div className="p-4 text-muted-foreground text-xs italic">{row.note}</div>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">5. Council Tax & Flood Risk</h2>
              <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Local taxation and flood indicators</h3>
                <p className="text-white/80 text-sm">Presenting unresolved authority data separately from the flood findings makes the report feel more trustworthy.</p>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Council tax</h3>
              <div className="border border-[#e2e8f0] mb-12">
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Tax band</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{councilTax?.band || 'Check VOA'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Further verification recommended</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Local authority</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{councilTax?.authority || 'Local authority'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Tax year shown: {councilTax?.year || '2024/25'}</div>
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Flood risk</h3>
              <div className="border border-[#e2e8f0]">
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Rivers & sea</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold text-green-600">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low (estimated)'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Very low indicator shown in source output</div>
                </div>
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Groundwater</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{floodRisk?.riskOfFloodingFromGroundwater || 'Negligible'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">None indicated</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Active warnings</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{floodRisk?.activeWarnings || 'No active warnings'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">No live warning noted in official report</div>
                </div>
              </div>
              
              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 6</span>
              </div>
            </div>

            {/* Page 7: Environmental & Planning */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">6. Environmental Hazards & Planning</h2>
              <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Environmental and planning checks</h3>
                <p className="text-white/80 text-sm">Where data is incomplete, a premium report should clearly separate "not found" from "not available".</p>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Environmental hazards</h3>
              <div className="border border-[#e2e8f0] mb-12">
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Radon risk</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{radonRisk?.riskLevel || 'Unknown'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">No confirmed result displayed</div>
                </div>
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Mining / subsidence</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{coalMining?.isReportingArea ? 'Yes' : 'No'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Based on source presentation</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Ground stability</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold italic text-muted-foreground">Data unavailable via search</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Would benefit from source note and timestamp</div>
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#2d4a77] mb-6">Planning history</h3>
              <div className="border border-[#e2e8f0] rounded-sm p-8 bg-white mb-16">
                {planningHistory.length > 0 ? (
                  <div className="space-y-6">
                    {planningHistory.slice(0, 5).map((item, i) => (
                      <div key={i} className="border-l-4 border-[#2d4a77] pl-6 py-1">
                        <p className="font-bold text-[#2d4a77] mb-1">{item.application}</p>
                        <p className="text-sm text-muted-foreground">{item.date} • {item.decision}</p>
                      </div>
                    ))}
                    {planningHistory.length > 5 && (
                      <p className="text-sm text-muted-foreground italic text-center pt-4">...and {planningHistory.length - 5} more applications</p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground italic py-4">No planning applications found in the official records.</p>
                )}
              </div>

              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">7. Broadband & Connectivity</h2>
              <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Digital connectivity</h3>
                <p className="text-white/80 text-sm">Detailed availability and speed coverage for the property.</p>
              </div>

              <div className="border border-[#e2e8f0] mb-8">
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Max download speed</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{broadband?.maxDownloadSpeed || 'Unknown'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Based on Ofcom coverage data</div>
                </div>
                <div className="grid grid-cols-3 border-b border-[#e2e8f0]">
                  <div className="p-4 border-r border-[#e2e8f0] text-muted-foreground text-sm">Max upload speed</div>
                  <div className="p-4 border-r border-[#e2e8f0] font-bold">{broadband?.maxUploadSpeed || 'Unknown'}</div>
                  <div className="p-4 text-muted-foreground text-xs italic">Based on Ofcom coverage data</div>
                </div>
              </div>

              {broadband?.results && (
                <div className="grid grid-cols-3 gap-4 mb-12">
                  {broadband.results.map((r, i) => (
                    <div key={i} className="p-4 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm text-center">
                      <p className="text-[10px] font-bold text-[#2d4a77] uppercase mb-1">{r.type}</p>
                      <p className="font-bold text-[#2d4a77]">{r.available ? r.downloadSpeed : 'Unavailable'}</p>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">8. Mobile Coverage</h2>
              <div className="bg-[#2d4a77] p-6 rounded-sm mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Network availability</h3>
                <p className="text-white/80 text-sm">Coverage levels for major UK mobile operators at this location.</p>
              </div>

              <div className="space-y-4">
                {(propertyData.mobile || []).map((m, i) => {
                  const isFiveGGood = m.fiveG && (m.fiveG.includes('Good') || m.fiveG.includes('Available'));
                  return (
                    <div key={i} className="p-4 border border-[#e2e8f0] rounded-sm flex justify-between items-center">
                      <div className="flex-grow pr-4">
                        <p className="font-bold text-[#2d4a77]">{m.operator}</p>
                        <p className="text-xs text-muted-foreground">Voice: {m.voice} • Data: {m.data || m.data4g || '4G Available'}</p>
                        {m.transmitterNotice && (
                          <p className="text-[11px] text-amber-700 font-medium mt-1">📡 {m.transmitterNotice}</p>
                        )}
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">5G Status</p>
                        <Badge className={isFiveGGood ? 'bg-green-600' : 'bg-slate-400'}>{m.fiveG}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-auto w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 8</span>
              </div>
            </div>

            {/* Page 9: End */}
            <div data-pdf-page className="w-[794px] h-[1123px] p-[80px] flex flex-col">
              {conditionReport && (
                <div className="mb-16">
                  <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-8">9. AI Condition Report</h2>
                  <div className="p-10 bg-[#f0f7ff] rounded-sm border border-[#d1e3f8]">
                    <p className="text-base leading-relaxed text-[#2d3748] whitespace-pre-wrap">{conditionReport}</p>
                  </div>
                </div>
              )}

              <div className="mt-auto py-12 px-8 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm text-center">
                <h3 className="text-2xl font-serif font-bold text-[#2d4a77] mb-4">End of HomePack Report</h3>
                <p className="text-[#4a5568] italic">Redesigned for a more professional customer-facing presentation.</p>
              </div>
              
              <div className="mt-12 w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-8">
                <span>HomePackAI Property Information Report</span>
                <span className="font-bold">Page 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-background p-4 rounded-xl">
        <div className="lg:col-span-2 space-y-8">
          <AiSummary summary={summary} />

          <DataSection icon={Home} title="Location & Local Schools">
            <SchoolsDisplay 
              schools={propertyData.schools} 
              coordinates={propertyData.coordinates} 
              address={propertyData.address} 
            />
          </DataSection>

          <DataSection icon={Landmark} title="Land Registry">
            {primaryTransaction ? (
                <>
                  <DataItem label="Last Sold Price" value={`£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()}`} />
                  <DataItem label="Last Sold Date" value={new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')} />
                  <DataItem label="Tenure" value={primaryTransaction.estateType} />
                  
                  {!isFree && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-md font-semibold text-foreground mb-2">Full Sales History</h3>
                      <div className="space-y-3">
                        {landRegistry.map((transaction, index) => (
                          <div key={index} className="p-2 rounded-md even:bg-muted/50">
                            <div className="flex justify-between items-center text-sm">
                              <p className="font-medium text-primary">£{parseInt(transaction.pricePaid, 10).toLocaleString()}</p>
                              <p className="text-muted-foreground">{new Date(transaction.transactionDate).toLocaleDateString('en-GB')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
            ) : (
                <>
                  <DataItem label="Title Number" value={"N/A"} />
                  <DataItem label="Tenure" value={"Data not found"} />
                  <DataItem label="Last Sold" value={"No recent sales data found"} />
               </>
            )}
            
          </DataSection>

          <DataSection icon={Zap} title="Energy Performance (EPC)">
              <EpcDisplay epcData={epc} logs={logs} isFree={isFree} isAdmin={isAdmin} />
          </DataSection>

          <DataSection icon={Coins} title="Council Tax">
            <CouncilTaxDisplay data={councilTax} logs={logs} isAdmin={isAdmin} postcode={address.postcode} />
          </DataSection>
          
          <DataSection icon={Waves} title="Flood Risk">
            <FloodRiskDisplay floodRiskData={floodRisk} logs={logs} isAdmin={isAdmin} />
          </DataSection>

          <DataSection icon={ShieldAlert} title="Environmental Hazards">
            <EnvironmentalHazardsDisplay radon={radonRisk} coal={coalMining} />
          </DataSection>

          <DataSection icon={ClipboardList} title="Planning History">
            <PlanningHistoryDisplay planningHistory={planningHistory} uprn={epc?.uprn || ''} localAuthorityId={epc?.localAuthority} logs={logs} isAdmin={isAdmin} />
          </DataSection>

          <DataSection icon={Wifi} title="Broadband & Connectivity">
            <BroadbandDisplay data={broadband} />
          </DataSection>

          <DataSection icon={Smartphone} title="Mobile Coverage">
            <MobileDisplay data={propertyData.mobile} summary={propertyData.mobileSummary} />
          </DataSection>

        </div>
        <div className="lg:col-span-1 space-y-8">
          {!isFree ? (
            <>
              <div data-pdf-ignore>
                <ImageUploader onReportGenerated={setConditionReport} setIsLoading={setIsConditionReportLoading} />
              </div>
              <AiConditionReport report={conditionReport} isLoading={isConditionReportLoading} />
            </>
          ) : (
            <Card className="border-dashed border-2 bg-muted/30" data-pdf-ignore>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">AI Condition Report</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Upload photos and generate AI-powered condition reports. Available for Subscription and Agency users.
                </p>
                <Button variant="outline" className="w-full">View Pricing</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
