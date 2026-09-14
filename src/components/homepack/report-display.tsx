import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Landmark, Zap, Waves, ClipboardList, ExternalLink, Search, Lock, Shield, ShieldAlert, Wifi, Coins, Mountain, Info, Home, Smartphone, GraduationCap, School as SchoolIcon, Plus, Stethoscope } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { HealthcareDisplay } from './healthcare-display';
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DATA_TOOLTIPS } from '@/lib/data-tooltips';
import { Address, PropertyData, LandRegistryResult, EpcData, FloodRiskData, PlanningHistoryItem, ReportResult, CouncilTaxData, RadonRiskData, CoalMiningData, BroadbandData, School, MobileData, HealthcareAccessData } from '@/types';
import { PropertyMap } from './property-map';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseReportForUser } from '@/firebase';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { HomePackPdfTemplate } from './HomePackPdfTemplate';
import { PropertyQuickNav } from './PropertyQuickNav';

// Enterprise automated data error handling & formatters (prevents missing data placeholders like £[object Object])
export function cleanDataValue(val: any): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'object') {
    const inner = val.value ?? val.amount ?? val.cost ?? val.total ?? val.rating ?? val.score ?? val.current;
    if (inner !== undefined && inner !== null && typeof inner !== 'object') {
      const s = String(inner).trim();
      return (s && s !== '[object Object]' && s !== 'undefined' && s !== 'null' && s !== 'N/A') ? s : null;
    }
    return null;
  }
  const str = String(val).trim();
  if (!str || str === '[object Object]' || str === 'undefined' || str === 'null' || str === 'N/A') {
    return null;
  }
  return str;
}

export function formatAnnualCost(val: any, fallback = 'Not recorded on certificate'): string {
  const clean = cleanDataValue(val);
  if (!clean) return fallback;
  const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return fallback;
  return `£${Math.round(num).toLocaleString('en-GB')} / year`;
}

export function formatCo2Tonnes(val: any, fallback = 'Not recorded on certificate'): string {
  const clean = cleanDataValue(val);
  if (!clean) return fallback;
  const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return fallback;
  return `${num.toLocaleString('en-GB', { maximumFractionDigits: 1 })} tonnes / year`;
}

export function formatKwhYear(val: any, fallback = 'Not recorded on certificate'): string {
  const clean = cleanDataValue(val);
  if (!clean) return fallback;
  const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return fallback;
  return `${Math.round(num).toLocaleString('en-GB')} kWh/m² per year`;
}

export function formatSchoolDistance(dist?: string): string {
  if (!dist) return 'Nearby';
  const trimmed = dist.trim();
  if (trimmed.toLowerCase().endsWith('away')) return trimmed;
  return `${trimmed} away`;
}

export function formatPercentVal(val: any, fallback = 'Not recorded'): string {
  const clean = cleanDataValue(val);
  if (!clean) return fallback;
  const num = parseFloat(clean.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return fallback;
  return `${Math.round(num)}%`;
}

export function dataOrNA(value: any, fallback = 'N/A'): string {
  const clean = cleanDataValue(value);
  return clean !== null ? clean : fallback;
}

type ReportDisplayProps = {
  address: Address;
  reportData: ReportResult | null;
  isLoading: boolean;
  onReset: () => void;
  onBack?: () => void;
  backLabel?: string;
  onNewHomePack?: () => void;
};

function SchoolsDisplay({ schools, coordinates, address }: { schools: School[] | undefined, coordinates: { lat: number, lng: number } | undefined, address: string }) {
  if (!coordinates) return <DataItem label="Location Map" value="Coordinates not available" />;

  let primaryCount = 0;
  let secondaryCount = 0;
  const labeledSchools = (schools || []).map((school) => {
    const isPrimary = school.type === 'Primary';
    const label = isPrimary ? `P${++primaryCount}` : `S${++secondaryCount}`;
    return { ...school, isPrimary, label };
  });

  return (
    <div className="space-y-6">
      <PropertyMap 
        propertyLocation={coordinates} 
        schools={schools || []} 
        address={address} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {labeledSchools.map((school, idx) => {
          const isOutstanding = school.ofstedRating.toLowerCase().includes('outstanding');
          const isGood = school.ofstedRating.toLowerCase().includes('good');

          return (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/40 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Marker Identifier Pin Pill matching the map */}
                <div className="flex flex-col items-center shrink-0">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    school.isPrimary ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {school.label}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{school.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1 shrink-0">
                      {school.isPrimary ? <GraduationCap className="h-3.5 w-3.5 text-blue-600" /> : <SchoolIcon className="h-3.5 w-3.5 text-purple-600" />}
                      <span>{school.type} School</span>
                    </span>
                    <span>•</span>
                    <span className="font-medium text-foreground/80 shrink-0">{formatSchoolDistance(school.distance)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge className={`
                  ${isOutstanding ? 'bg-emerald-600 text-white' : 
                    isGood ? 'bg-blue-600 text-white' : 
                    school.ofstedRating.toLowerCase().includes('improvement') ? 'bg-amber-500 text-white' : 
                    'bg-slate-600 text-white'} border-none text-[10px] h-5 px-2 font-semibold shadow-2xs whitespace-nowrap
                `}>
                  {school.ofstedRating}
                </Badge>
              </div>
            </div>
          );
        })}
        {labeledSchools.length === 0 && (
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

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-border/70 space-y-2.5">
                <div className="flex justify-between items-center font-serif font-bold text-[#1e3a8a] dark:text-blue-400">
                    <div className="flex items-center gap-2">
                        <span className="text-base">Current Energy Band: {epcData.rating}</span>
                        {isExpired && (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">EXPIRED</Badge>
                        )}
                    </div>
                    <span className="text-sm font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                      Potential: Band {epcData.potentialRating}
                    </span>
                </div>
                <Progress value={epcValue} className="h-3.5 rounded-full" />
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                    <span className="text-red-500">G (Very Inefficient)</span>
                    <span className="text-emerald-600">A (Highly Efficient)</span>
                </div>
                {epcData.expiryDate && (
                    <div className={`text-xs mt-1 ${isExpired ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        Certificate Expiry: {new Date(epcData.expiryDate).toLocaleDateString('en-GB')}
                    </div>
                )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-card border border-border/80 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Current Score</span>
                <span className="text-lg font-bold text-foreground">{dataOrNA(epcData.currentEnergyEfficiency)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/80 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Potential Score</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{dataOrNA(epcData.potentialEnergyEfficiency)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/80 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Est. Heating / yr</span>
                <span className="text-lg font-bold text-foreground">{formatAnnualCost(epcData.heatingCostCurrent)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-border/80 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">CO₂ Emissions</span>
                <span className="text-lg font-bold text-foreground">{formatCo2Tonnes(epcData.co2EmissionsCurrent)}</span>
              </div>
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
                          <DataItem label="Total Floor Area" value={epcData.totalFloorArea ? `${dataOrNA(epcData.totalFloorArea)} m²` : 'N/A'} tooltip={DATA_TOOLTIPS.totalFloorArea} />
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
                          <DataItem label="CO₂ Emissions (Current)" value={formatCo2Tonnes(epcData.co2EmissionsCurrent)} tooltip={DATA_TOOLTIPS.co2EmissionsCurrent} />
                          <DataItem label="CO₂ Emissions (Potential)" value={formatCo2Tonnes(epcData.co2EmissionsPotential)} tooltip={DATA_TOOLTIPS.co2EmissionsPotential} />
                          <DataItem label="Environment Impact (Current)" value={dataOrNA(epcData.environmentImpactCurrent)} tooltip={DATA_TOOLTIPS.environmentImpactCurrent} />
                          <DataItem label="Environment Impact (Potential)" value={dataOrNA(epcData.environmentImpactPotential)} tooltip={DATA_TOOLTIPS.environmentImpactPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Energy Consumption (Current)" value={formatKwhYear(epcData.energyConsumptionCurrent)} tooltip={DATA_TOOLTIPS.energyConsumptionCurrent} />
                          <DataItem label="Energy Consumption (Potential)" value={formatKwhYear(epcData.energyConsumptionPotential)} tooltip={DATA_TOOLTIPS.energyConsumptionPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Heating Cost (Current)" value={formatAnnualCost(epcData.heatingCostCurrent)} tooltip={DATA_TOOLTIPS.heatingCostCurrent} />
                          <DataItem label="Heating Cost (Potential)" value={formatAnnualCost(epcData.heatingCostPotential)} tooltip={DATA_TOOLTIPS.heatingCostPotential} />
                          <DataItem label="Hot Water Cost (Current)" value={formatAnnualCost(epcData.hotWaterCostCurrent)} tooltip={DATA_TOOLTIPS.hotWaterCostCurrent} />
                          <DataItem label="Hot Water Cost (Potential)" value={formatAnnualCost(epcData.hotWaterCostPotential)} tooltip={DATA_TOOLTIPS.hotWaterCostPotential} />
                          <DataItem label="Lighting Cost (Current)" value={formatAnnualCost(epcData.lightingCostCurrent)} tooltip={DATA_TOOLTIPS.lightingCostCurrent} />
                          <DataItem label="Lighting Cost (Potential)" value={formatAnnualCost(epcData.lightingCostPotential)} tooltip={DATA_TOOLTIPS.lightingCostPotential} />
                          <Separator className="md:col-span-2" />
                          <DataItem label="Glazing Type" value={dataOrNA(epcData.glazedType)} tooltip={DATA_TOOLTIPS.glazedType} />
                          <DataItem label="Glazed Area" value={dataOrNA(epcData.glazedArea)} tooltip={DATA_TOOLTIPS.glazedArea} />
                          <DataItem label="Multi-glaze Proportion" value={formatPercentVal(epcData.multiGlazeProportion)} tooltip={DATA_TOOLTIPS.multiGlazeProportion} />
                          <DataItem label="Low Energy Lighting" value={formatPercentVal(epcData.lowEnergyLighting)} tooltip={DATA_TOOLTIPS.lowEnergyLighting} />
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
        </div>
    );
}

function FloodRiskDisplay({ floodRiskData, logs, isAdmin }: { floodRiskData: FloodRiskData, logs: string[], isAdmin: boolean }) {
    const floodLogs = logs.filter(log => log.startsWith('[FLOOD'));

    const isNullOrEmpty = (value: string | undefined | null) => value === null || value === undefined || value.trim() === '' || value.toLowerCase() === 'null';

    if (!floodRiskData) {
        return (
            <div className="space-y-4">
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
            </div>
        );
    }

    const getFloodRiskBadge = (level: string) => {
      const l = (level || '').toLowerCase();
      if (l.includes('high')) return { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900', label: level };
      if (l.includes('medium')) return { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900', label: level };
      if (l.includes('low') && !l.includes('very')) return { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900', label: level };
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900', label: level || 'Very Low' };
    };
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                <Search className="h-2.5 w-2.5 mr-1" /> Environment Agency Grounded
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Rivers & Sea', val: floodRiskData.riskOfFloodingFromRiversAndSea },
                { title: 'Surface Water', val: floodRiskData.riskOfFloodingFromSurfaceWater },
                { title: 'Groundwater', val: floodRiskData.riskOfFloodingFromGroundwater },
                { title: 'Reservoirs', val: floodRiskData.riskOfFloodingFromReservoirs },
              ].map((item, idx) => {
                const badge = getFloodRiskBadge(item.val);
                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2 shadow-2xs">
                    <span className="text-xs font-semibold text-muted-foreground block">{item.title}</span>
                    <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${badge.bg}`}>
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 text-xs">
                <Waves className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-blue-950 dark:text-blue-200 leading-snug">
                    <span className="font-semibold">Live EA Flood Status:</span>{' '}
                    <span className="font-medium">{floodRiskData.activeWarnings}</span>
                </p>
            </div>

            <Accordion className="w-full" data-pdf-ignore>
                <AccordionItem value="technical-details">
                    <AccordionTrigger className="text-xs text-primary hover:underline py-2">
                        View Technical Spatial Identifiers
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            <DataItem label="Data Suitability" value={isNullOrEmpty(floodRiskData.suitability) ? ' - ' : floodRiskData.suitability} tooltip={DATA_TOOLTIPS.SUITABILITY} />
                            <DataItem label="Publication Date" value={isNullOrEmpty(floodRiskData.publishDate) ? ' - ' : new Date(floodRiskData.publishDate).toLocaleDateString('en-GB')} tooltip={DATA_TOOLTIPS.PUB_DATE} />
                            <DataItem label="Easting" value={floodRiskData.easting} tooltip={DATA_TOOLTIPS.easting} />
                            <DataItem label="Northing" value={floodRiskData.northing} tooltip={DATA_TOOLTIPS.northing} />
                            <DataItem label="Latitude" value={floodRiskData.latitude} tooltip={DATA_TOOLTIPS.latitude} />
                            <DataItem label="Longitude" value={floodRiskData.longitude} tooltip={DATA_TOOLTIPS.longitude} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {isAdmin && floodLogs.length > 0 && (
                    <AccordionItem value="log">
                        <AccordionTrigger className="text-xs text-primary hover:underline py-2">
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
              <Search className="h-2.5 w-2.5 mr-1" /> VOA Billing Grounded
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-amber-50 text-amber-800 border-amber-200 font-medium">
              <Info className="h-2.5 w-2.5 mr-1" /> Estimated Banding
            </Badge>
          )}
        </div>
        <a 
          href={govUkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          data-pdf-ignore
        >
          Check on GOV.UK <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Hero Highlight Card */}
      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Banding & Annual Rate</span>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-serif font-bold text-[#1e3a8a] dark:text-blue-400">Band {data.band}</span>
            <span className="text-lg font-bold text-foreground">{data.annualAmount || 'Recorded'}</span>
          </div>
        </div>
        <div className="text-left sm:text-right space-y-0.5">
          <span className="text-xs text-muted-foreground block">Billing Authority:</span>
          <span className="text-sm font-semibold text-foreground block">{data.authority || 'Local Council'}</span>
          <span className="text-[11px] text-muted-foreground">Tax Year: {data.year || 'Current'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <DataItem label="Valuation Band" value={data.band} tooltip={DATA_TOOLTIPS.band} />
        <DataItem label="Annual Charge" value={data.annualAmount} tooltip={DATA_TOOLTIPS.annualAmount} />
        <DataItem label="Local Authority" value={data.authority} tooltip={DATA_TOOLTIPS.authority} />
        <DataItem label="Tax Year" value={data.year} />
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        Source: Valuation Office Agency (VOA) / {data.authority}
      </p>
      
      {isAdmin && (
        <Accordion className="w-full mt-2" data-pdf-ignore>
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
                  No grounding logs found for this search.
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
          <Search className="h-2.5 w-2.5 mr-1" /> Geological Records Grounded
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radon Card */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-serif font-bold flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400">
                <Mountain className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Radon Gas Assessment</span>
              </h4>
              <Badge variant={radon?.riskLevel === 'Low' ? 'outline' : 'destructive'} className="text-[10px] font-semibold shrink-0">
                {radon?.percentage || radon?.riskLevel || 'Low'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {radon?.description || 'Radon data not available.'}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 italic pt-2 border-t border-border/40">
            Source: British Geological Survey (BGS) / UKHSA
          </p>
        </div>

        {/* Coal Mining Card */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-serif font-bold flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Coal Mining & Ground Stability</span>
              </h4>
              <Badge variant={coal?.isHighRiskArea ? 'destructive' : 'outline'} className="text-[10px] font-semibold shrink-0">
                {coal?.isHighRiskArea ? 'High Risk' : 'No Known Risk'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {coal?.description || 'Mining stability records indicate no historical activity.'}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 italic pt-2 border-t border-border/40">
            Source: The Coal Authority Mining Records
          </p>
        </div>
      </div>
    </div>
  );
}

function BroadbandDisplay({ data }: { data: BroadbandData }) {
  if (!data) return <DataItem label="Broadband" value="Not available" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
          <Search className="h-2.5 w-2.5 mr-1" /> Ofcom Fixed Line Coverage
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-1">
          <span className="text-xs text-muted-foreground font-semibold block">Max Download Speed</span>
          <span className="text-xl font-bold text-foreground">{data.maxDownloadSpeed || 'Ultrafast'}</span>
        </div>
        <div className="p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-1">
          <span className="text-xs text-muted-foreground font-semibold block">Max Upload Speed</span>
          <span className="text-xl font-bold text-foreground">{data.maxUploadSpeed || 'High Speed'}</span>
        </div>
      </div>

      {data.results && data.results.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Availability by Connection Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {data.results.map((r, i) => (
              <div key={i} className={`p-3 rounded-xl border ${r.available ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' : 'bg-muted/40 border-border/60'} text-center space-y-1`}>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{r.type}</p>
                <p className={`text-sm font-bold ${r.available ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  {r.available ? r.downloadSpeed : 'Unavailable'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.networks && data.networks.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Physical Networks</p>
          <div className="flex flex-wrap gap-1.5">
            {data.networks.map((n, i) => (
              <Badge key={i} variant="outline" className="text-xs py-0.5 px-2.5 h-6 bg-background font-medium shadow-2xs">{n}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-[10px] text-muted-foreground italic">
        Source: Ofcom Connected Nations & Fixed Broadband Coverage
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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                  <Search className="h-2.5 w-2.5 mr-1" /> Local Planning Register
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {uprn && <span>UPRN: <span className="font-mono font-medium text-foreground">{uprn}</span></span>}
              </div>
            </div>

            {planningHistory.length > 0 ? (
                <div className="space-y-3">
                     {planningHistory.map((item, index) => {
                        const isApproved = item.decision.toLowerCase().includes('approve') || item.decision.toLowerCase().includes('grant');
                        const isRefused = item.decision.toLowerCase().includes('refus') || item.decision.toLowerCase().includes('reject');
                        return (
                          <div key={index} className="p-3.5 rounded-xl border border-border/80 bg-card/70 space-y-2 hover:border-primary/40 transition-colors shadow-2xs">
                              <div className="flex flex-wrap justify-between items-start gap-2">
                                <p className="font-semibold text-sm text-foreground flex-1 leading-snug">{item.application}</p>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${
                                    isApproved 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                                      : isRefused 
                                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' 
                                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {item.decision}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/40 gap-2">
                                  <span>Decided on: <span className="font-medium text-foreground">{item.date}</span></span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-[11px]">Ref: {item.reference}</span>
                                    {item.url && (
                                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium text-xs">
                                          Portal <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                              </div>
                          </div>
                        );
                     })}
                </div>
            ) : (
                <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">No recent planning history recorded</p>
                    <p className="text-xs text-muted-foreground">No major structural planning applications found matching this property's spatial boundaries.</p>
                </div>
            )}

            <div className="flex flex-col gap-2 pt-1" data-pdf-ignore>
                <Accordion className="w-full">
                  {isAdmin && planningLogs.length > 0 && (
                        <AccordionItem value="log">
                            <AccordionTrigger>
                                <span className="text-xs text-primary hover:underline">Show Fetch Log (Admin Only)</span>
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
                  <Button asChild variant="outline" size="sm" className="w-fit text-xs">
                      <Link to="/debug/planning">
                          <Search className="mr-2 h-3.5 w-3.5" />
                          Debug Planning History
                      </Link>
                  </Button>
                )}
            </div>
        </div>
    );
}


export function ReportDisplay({ 
  address, 
  reportData, 
  isLoading, 
  onReset,
  onBack,
  backLabel,
  onNewHomePack 
}: ReportDisplayProps) {
  const { user, profile, isAdmin } = useAuth();
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

      // Ensure the template is visible during capture
      const originalStyle = template.parentElement?.style.cssText || "";
      if (template.parentElement) {
        template.parentElement.style.position = 'static';
        template.parentElement.style.left = '0';
        template.parentElement.style.visibility = 'visible';
        template.parentElement.style.height = 'auto';
        template.parentElement.style.overflow = 'visible';
      }

      // Small delay to allow any pending layout or images to settle
      await new Promise(resolve => setTimeout(resolve, 350));

      try {
        const pageElements = Array.from(template.querySelectorAll<HTMLElement>('[data-pdf-page]'));
        if (pageElements.length === 0) {
          throw new Error('No pages found in report template');
        }

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i];
          toast.loading(`Rendering page ${i + 1} of ${pageElements.length}...`, { id: toastId });

          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              // Aggressive fix for "oklab" / "oklch" unsupported color functions in html2canvas
              const styleTags = clonedDoc.getElementsByTagName('style');
              for (let s = 0; s < styleTags.length; s++) {
                let css = styleTags[s].innerHTML;
                if (css.includes('oklch') || css.includes('oklab')) {
                  css = css.replace(/oklch\([^)]+\)/g, '#64748b');
                  css = css.replace(/oklab\([^)]+\)/g, '#64748b');
                  styleTags[s].innerHTML = css;
                }
              }

              const allElements = clonedDoc.getElementsByTagName('*');
              for (let j = 0; j < allElements.length; j++) {
                const el = allElements[j] as HTMLElement;
                const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
                props.forEach(prop => {
                  try {
                    const style = el.style as any;
                    const val = style?.[prop];
                    if (val && (val.includes('oklch') || val.includes('oklab'))) {
                      style[prop] = '#64748b';
                    }
                  } catch (e) {}
                });
              }
            },
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) {
            pdf.addPage('a4', 'portrait');
          }
          // A4 is 210mm x 297mm
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }

        pdf.save(filename);
        toast.success('HomePack PDF downloaded successfully (9 pages)!', { id: toastId });
      } finally {
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
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Compiling HomePack...</p>
          <p className="text-sm text-muted-foreground">Gathering official HM Land Registry, EPC, and environmental registers</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const { propertyData, summary, logs } = reportData;
  const { landRegistry, epc, floodRisk, planningHistory, councilTax, radonRisk, coalMining, broadband } = propertyData;

  // Real-time resilience: if report was cached without healthcare data, asynchronously load it
  const [liveHealthcare, setLiveHealthcare] = useState<HealthcareAccessData | undefined>(propertyData.healthcare);

  useEffect(() => {
    if (propertyData.healthcare) {
      setLiveHealthcare(propertyData.healthcare);
    } else if (address.postcode) {
      fetch(`/api/healthcare/${encodeURIComponent(address.postcode)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          const fetched = data?.healthcare || data?.result;
          if (fetched) {
            setLiveHealthcare(fetched);
          }
        })
        .catch(err => console.warn('Healthcare lookup notice:', err));
    }
  }, [propertyData.healthcare, address.postcode]);

  const activeHealthcare = liveHealthcare || propertyData.healthcare;
  const mergedPropertyData = {
    ...propertyData,
    healthcare: activeHealthcare
  };
  
  const getPrimaryTransaction = (results: LandRegistryResult[]) => {
     if (!results || results.length === 0) return null;
     return results[0];
  }

  const primaryTransaction = getPrimaryTransaction(landRegistry);
  const isFree = profile?.role === 'free';
  const isBusinessSubscriber = profile?.role === 'subscription' || profile?.role === 'agency' || profile?.role === 'admin';
  const fullAddress = `${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}`.trim();
  const hasPurchasedReport = Boolean(
    profile?.purchasedReports?.includes(fullAddress) ||
    profile?.purchasedReports?.includes(propertyData.address) ||
    (address.postcode && profile?.purchasedReports?.some(p => p.toLowerCase().includes(address.postcode.toLowerCase().trim())))
  );
  const canDownloadPdf = isBusinessSubscriber || hasPurchasedReport;
  const [showB2CPurchaseModal, setShowB2CPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // White-label branding attributes
  const isWhiteLabel = (profile?.role === 'agency' || (profile?.accountType === 'business' && profile?.role !== 'free')) && Boolean(profile?.branding);
  const branding = profile?.branding;
  const brandPrimary = (isWhiteLabel && branding?.primaryColor) || '#2d4a77';
  const brandAccent = (isWhiteLabel && branding?.accentColor) || '#d1e3f8';
  const brandLogo = (isWhiteLabel && branding?.logoUrl) || null;
  const companyName = (isWhiteLabel && (profile?.company || branding?.companyTagline || branding?.agentName)) || 'HomePackAI';

  const handleB2CPurchase = async () => {
    if (!user) {
      toast.error('Please sign in or create an account to unlock your £9.99 report download');
      return;
    }
    setIsPurchasing(true);
    try {
      await purchaseReportForUser(user.uid, fullAddress);
      toast.success('Report purchased! Generating your official 9-page HomePack PDF (£9.99)...');
      setShowB2CPurchaseModal(false);
      setTimeout(() => {
        downloadPdf();
      }, 400);
    } catch (e: any) {
      toast.error(e.message || 'Could not complete report purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              onClick={onBack || onReset} 
              className="-ml-4 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel || "Start New Report"}
            </Button>
          </div>
          <h2 className="text-4xl font-bold font-serif tracking-tight text-[#2d4a77]">{propertyData.address}</h2>
          <p className="text-muted-foreground font-sans mt-1">
            {isWhiteLabel && profile?.company 
              ? `Client due diligence pack prepared by ${profile.company}` 
              : 'Comprehensive property information pack generated by HomePackAI.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto font-medium" 
            onClick={onNewHomePack || onReset}
          >
            <Plus className="mr-2 h-4 w-4" />
            New HomePack
          </Button>

          {canDownloadPdf ? (
            <div className="flex items-center gap-2">
              {hasPurchasedReport && !isBusinessSubscriber && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium px-2.5 py-1 text-xs">
                  B2C Single Pack Unlocked
                </Badge>
              )}
              <Button 
                size="lg" 
                className="w-full sm:w-auto font-medium" 
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
                    <Download className="mr-2 h-4 w-4" />
                    Create PDF Report
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button 
                size="lg" 
                className="w-full sm:w-auto font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => setShowB2CPurchaseModal(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Full PDF (£9.99)
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-xs font-medium"
              >
                <Link to="/pricing">
                  B2B Subscription (£29–£49/mo)
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modular 9-Page PDF Template */}
      <HomePackPdfTemplate
        pdfTemplateRef={pdfTemplateRef}
        propertyData={mergedPropertyData}
        healthcare={activeHealthcare}
        address={address}
        landRegistry={landRegistry}
        epc={epc}
        floodRisk={floodRisk}
        broadband={broadband}
        radonRisk={radonRisk}
        coalMining={coalMining}
        councilTax={councilTax}
        conditionReport={conditionReport}
        planningHistory={planningHistory}
        isWhiteLabel={isWhiteLabel}
        brandLogo={brandLogo}
        brandPrimary={brandPrimary}
        brandAccent={brandAccent}
        branding={branding}
        profile={profile}
        primaryTransaction={primaryTransaction}
      />

      <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-background p-4 rounded-xl">
        <div className="lg:col-span-2 space-y-8">
          <div id="section-summary">
            <AiSummary summary={summary} />
          </div>

          <DataSection id="section-schools" icon={Home} title="Location & Local Schools">
            <SchoolsDisplay 
              schools={propertyData.schools} 
              coordinates={propertyData.coordinates} 
              address={propertyData.address} 
            />
          </DataSection>

          <DataSection id="section-land-registry" icon={Landmark} title="Land Registry & Price History">
            {primaryTransaction ? (
                <div className="space-y-4">
                  {/* Hero Highlight Card */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Official Last Sold Price</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-serif font-bold text-[#1e3a8a] dark:text-blue-400">
                          £{parseInt(primaryTransaction.pricePaid, 10).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs bg-card font-medium">
                          {primaryTransaction.estateType || 'Freehold'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-xs text-muted-foreground block">Completion Date:</span>
                      <span className="text-sm font-semibold text-foreground block">
                        {new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-[11px] text-muted-foreground">HM Land Registry Price Paid Dataset</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-border/70 bg-card/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tenure Type</span>
                      <span className="text-sm font-semibold text-foreground">{primaryTransaction.estateType || 'Freehold'}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border/70 bg-card/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Record Date</span>
                      <span className="text-sm font-semibold text-foreground">{new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border/70 bg-card/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Registry Category</span>
                      <span className="text-sm font-semibold text-foreground">Standard Price Paid</span>
                    </div>
                  </div>
                  
                  {!isFree && landRegistry.length > 1 && (
                    <div className="pt-2">
                      <Separator className="my-3" />
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                        <span>Full Transaction Chronology</span>
                        <span className="text-xs font-normal text-muted-foreground">{landRegistry.length} recorded transfers</span>
                      </h3>
                      <div className="space-y-2">
                        {landRegistry.map((transaction, index) => (
                          <div key={index} className="p-3 rounded-xl border border-border/70 bg-card/50 flex justify-between items-center text-sm hover:bg-muted/40 transition-colors">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-foreground">£{parseInt(transaction.pricePaid, 10).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{transaction.estateType || 'Transfer'}</p>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                              {new Date(transaction.transactionDate).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            ) : (
                <div className="space-y-2">
                  <DataItem label="Title Number" value={"N/A"} />
                  <DataItem label="Tenure" value={"Data not found"} />
                  <DataItem label="Last Sold" value={"No recent sales data recorded in Land Registry index"} />
               </div>
            )}
          </DataSection>

          <DataSection id="section-epc" icon={Zap} title="Energy Performance (EPC)">
              <EpcDisplay epcData={epc} logs={logs} isFree={isFree} isAdmin={isAdmin} />
          </DataSection>

          <DataSection id="section-council-tax" icon={Coins} title="Council Tax">
            <CouncilTaxDisplay data={councilTax} logs={logs} isAdmin={isAdmin} postcode={address.postcode} />
          </DataSection>
          
          <DataSection id="section-flood" icon={Waves} title="Flood Risk">
            <FloodRiskDisplay floodRiskData={floodRisk} logs={logs} isAdmin={isAdmin} />
          </DataSection>

          <DataSection id="section-environmental" icon={ShieldAlert} title="Environmental Hazards">
            <EnvironmentalHazardsDisplay radon={radonRisk} coal={coalMining} />
          </DataSection>

          <DataSection id="section-planning" icon={ClipboardList} title="Planning History">
            <PlanningHistoryDisplay planningHistory={planningHistory} uprn={epc?.uprn || ''} localAuthorityId={epc?.localAuthority} logs={logs} isAdmin={isAdmin} />
          </DataSection>

          <DataSection id="section-broadband" icon={Wifi} title="Broadband & Connectivity">
            <BroadbandDisplay data={broadband} />
          </DataSection>

          <DataSection id="section-mobile" icon={Smartphone} title="Mobile Coverage">
            <MobileDisplay data={propertyData.mobile} summary={propertyData.mobileSummary} />
          </DataSection>

          <DataSection id="section-healthcare" icon={Stethoscope} title="Healthcare & NHS Access">
            <HealthcareDisplay data={activeHealthcare} postcode={address.postcode} />
          </DataSection>

        </div>
        <div className="lg:col-span-1 space-y-6">
          <PropertyQuickNav
            propertyData={mergedPropertyData}
            primaryTransaction={primaryTransaction}
            epc={epc}
            councilTax={councilTax}
            floodRisk={floodRisk}
            broadband={broadband}
            onDownloadPdf={downloadPdf}
            canDownloadPdf={canDownloadPdf}
            isDownloading={isDownloading}
            onUnlockB2C={() => setShowB2CPurchaseModal(true)}
          />

          <div id="section-condition">
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
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* B2C Single Report Download Modal (£9.99) */}
      {showB2CPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-card border shadow-xl p-6 relative">
            <button
              onClick={() => setShowB2CPurchaseModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-semibold"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold">
                Direct-to-Consumer (B2C)
              </Badge>
              <Badge variant="outline" className="text-xs">
                Single-Pack Download
              </Badge>
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground">
              Unlock Full 9-Page Due Diligence PDF
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Instant one-off purchase for <span className="font-semibold text-foreground">{propertyData.address}</span>. No subscription or recurring fees.
            </p>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/80 space-y-3 mb-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-border/60">
                <span className="font-medium text-sm">Official Property Pack PDF</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">£9.99</span>
                  <span className="text-xs text-muted-foreground ml-1">inc. VAT</span>
                </div>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Full 9-page high-resolution PDF download</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>HM Land Registry confirmed sold prices & tenure records</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Official EPC efficiency breakdown & heating cost projections</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Environment Agency flood risk levels & active warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Historical local planning applications & decisions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Nearest schools with verified Ofsted inspection ratings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Ofcom broadband speed test data & 4G/5G mobile coverage</span>
                </li>
              </ul>
            </div>

            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Purchasing as <span className="font-medium text-foreground">{user.email}</span>. This report will be permanently unlocked in your account.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowB2CPurchaseModal(false)}
                    disabled={isPurchasing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    onClick={handleB2CPurchase}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Confirm & Download (£9.99)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  Please sign in or create an account to save and download this report permanently.
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowB2CPurchaseModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link to="/tool">Sign In to Download</Link>
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t text-center text-xs text-muted-foreground">
              Need regular reports?{' '}
              <Link to="/pricing" className="text-primary hover:underline font-medium">
                Switch to B2B Pro (£29/mo) or White-Label (£49/mo)
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
