





'use client';

import { useState } from 'react';
import type { Address, PropertyData, LandRegistryResult, EpcData, FloodRiskData, PlanningHistoryItem } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Landmark, Zap, Waves, ClipboardList, ExternalLink, Search } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { dataTooltips } from '@/lib/data-tooltips';
import Link from 'next/link';


type ReportDisplayProps = {
  address: Address;
  reportData: { propertyData: PropertyData; summary: string; logs: string[], error?: string } | null;
  isLoading: boolean;
  onReset: () => void;
};


function EpcDisplay({ epcData }: { epcData: EpcData }) {
    if (!epcData) {
        return (
            <>
                <DataItem label="EPC Details" value="Not available" />
            </>
        );
    }

    const epcValue = (7 - (epcData.rating.charCodeAt(0) - 'A'.charCodeAt(0))) * (100/7);

    const dataOrNA = (value: string | number | undefined | null) => {
        return value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
    }

    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between font-medium">
                    <span>Current Rating: {epcData.rating}</span>
                    <span>Potential: {epcData.potentialRating}</span>
                </div>
                <Progress value={epcValue} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>G (Worst)</span>
                    <span>A (Best)</span>
                </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="epc-details">
                <AccordionTrigger>
                    <span className="text-sm text-primary hover:underline">View EPC Details</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <DataItem label="Address Line 1" value={dataOrNA(epcData.address1)} tooltip={dataTooltips.address1} />
                        <DataItem label="Address Line 2" value={dataOrNA(epcData.address2)} tooltip={dataTooltips.address2} />
                        <DataItem label="Address Line 3" value={dataOrNA(epcData.address3)} tooltip={dataTooltips.address3} />
                        <DataItem label="Town" value={dataOrNA(epcData.posttown)} tooltip={dataTooltips.posttown} />
                        <DataItem label="Postcode" value={dataOrNA(epcData.postcode)} tooltip={dataTooltips.postcode} />
                        <DataItem label="County" value={dataOrNA(epcData.county)} tooltip={dataTooltips.county} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Lodgement Date" value={epcData.lodgementDate ? new Date(epcData.lodgementDate).toLocaleDateString() : 'N/A'} tooltip={dataTooltips.lodgementDate}/>
                        <DataItem label="Inspection Date" value={epcData.inspectionDate ? new Date(epcData.inspectionDate).toLocaleDateString() : 'N/A'} tooltip={dataTooltips.inspectionDate} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Current Rating" value={dataOrNA(epcData.rating)} tooltip={dataTooltips.rating} />
                        <DataItem label="Potential Rating" value={dataOrNA(epcData.potentialRating)} tooltip={dataTooltips.potentialRating} />
                        <DataItem label="Current Efficiency" value={dataOrNA(epcData.currentEnergyEfficiency)} tooltip={dataTooltips.currentEnergyEfficiency} />
                        <DataItem label="Potential Efficiency" value={dataOrNA(epcData.potentialEnergyEfficiency)} tooltip={dataTooltips.potentialEnergyEfficiency} />
                         <Separator className="md:col-span-2" />
                        <DataItem label="Property Type" value={dataOrNA(epcData.propertyType)} tooltip={dataTooltips.propertyType} />
                        <DataItem label="Built Form" value={dataOrNA(epcData.builtForm)} tooltip={dataTooltips.builtForm} />
                        <DataItem label="Construction Age" value={dataOrNA(epcData.constructionAgeBand)} tooltip={dataTooltips.constructionAgeBand} />
                        <DataItem label="Tenure" value={dataOrNA(epcData.tenure)} tooltip={dataTooltips.tenure} />
                        <DataItem label="UPRN" value={dataOrNA(epcData.uprn)} tooltip={dataTooltips.uprn} />
                        <DataItem label="Building Reference" value={dataOrNA(epcData.buildingReferenceNumber)} tooltip={dataTooltips.buildingReferenceNumber} />
                        <DataItem label="Local Authority" value={dataOrNA(epcData.localAuthorityLabel)} tooltip={dataTooltips.localAuthorityLabel} />
                        <DataItem label="Constituency" value={dataOrNA(epcData.constituencyLabel)} tooltip={dataTooltips.constituencyLabel} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Total Floor Area" value={`${dataOrNA(epcData.totalFloorArea)} m²`} tooltip={dataTooltips.totalFloorArea} />
                        <DataItem label="Habitable Rooms" value={dataOrNA(epcData.numberHabitableRooms)} tooltip={dataTooltips.numberHabitableRooms} />
                        <DataItem label="Heated Rooms" value={dataOrNA(epcData.numberHeatedRooms)} tooltip={dataTooltips.numberHeatedRooms} />
                        <DataItem label="Transaction Type" value={dataOrNA(epcData.transactionType)} tooltip={dataTooltips.transactionType} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Main Heat Source" value={dataOrNA(epcData.mainHeatDescription)} tooltip={dataTooltips.mainHeatDescription} />
                        <DataItem label="Main Heat Controls" value={dataOrNA(epcData.mainheatcontDescription)} tooltip={dataTooltips.mainheatcontDescription} />
                        <DataItem label="Main Fuel" value={dataOrNA(epcData.mainFuel)} tooltip={dataTooltips.mainFuel} />
                        <DataItem label="Secondary Heat" value={dataOrNA(epcData.secondheatDescription)} tooltip={dataTooltips.secondheatDescription} />
                        <DataItem label="Hot Water" value={dataOrNA(epcData.hotwaterDescription)} tooltip={dataTooltips.hotwaterDescription} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Walls" value={dataOrNA(epcData.wallsDescription)} tooltip={dataTooltips.wallsDescription} />
                        <DataItem label="Walls Energy Eff." value={dataOrNA(epcData.wallsEnergyEff)} tooltip={dataTooltips.wallsEnergyEff} />
                        <DataItem label="Roof" value={dataOrNA(epcData.roofDescription)} tooltip={dataTooltips.roofDescription} />
                        <DataItem label="Roof Energy Eff." value={dataOrNA(epcData.roofEnergyEff)} tooltip={dataTooltips.roofEnergyEff} />
                        <DataItem label="Floor" value={dataOrNA(epcData.floorDescription)} tooltip={dataTooltips.floorDescription} />
                        <DataItem label="Windows" value={dataOrNA(epcData.windowsDescription)} tooltip={dataTooltips.windowsDescription} />
                        <DataItem label="Windows Energy Eff." value={dataOrNA(epcData.windowsEnergyEff)} tooltip={dataTooltips.windowsEnergyEff} />
                        <DataItem label="Lighting" value={dataOrNA(epcData.lightingDescription)} tooltip={dataTooltips.lightingDescription} />
                        <DataItem label="Lighting Energy Eff." value={dataOrNA(epcData.lightingEnergyEff)} tooltip={dataTooltips.lightingEnergyEff} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="CO₂ Emissions (Current)" value={`${dataOrNA(epcData.co2EmissionsCurrent)} tonnes/year`} tooltip={dataTooltips.co2EmissionsCurrent} />
                        <DataItem label="CO₂ Emissions (Potential)" value={`${dataOrNA(epcData.co2EmissionsPotential)} tonnes/year`} tooltip={dataTooltips.co2EmissionsPotential} />
                        <DataItem label="Energy Consumption (Current)" value={`${dataOrNA(epcData.energyConsumptionCurrent)} kWh/m² per year`} tooltip={dataTooltips.energyConsumptionCurrent} />
                        <DataItem label="Energy Consumption (Potential)" value={`${dataOrNA(epcData.energyConsumptionPotential)} kWh/m² per year`} tooltip={dataTooltips.energyConsumptionPotential} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Heating Cost (Current)" value={`£${dataOrNA(epcData.heatingCostCurrent)} / year`} tooltip={dataTooltips.heatingCostCurrent} />
                        <DataItem label="Heating Cost (Potential)" value={`£${dataOrNA(epcData.heatingCostPotential)} / year`} tooltip={dataTooltips.heatingCostPotential} />
                        <DataItem label="Hot Water Cost (Current)" value={`£${dataOrNA(epcData.hotWaterCostCurrent)} / year`} tooltip={dataTooltips.hotWaterCostCurrent} />
                        <DataItem label="Hot Water Cost (Potential)" value={`£${dataOrNA(epcData.hotWaterCostPotential)} / year`} tooltip={dataTooltips.hotWaterCostPotential} />
                        <DataItem label="Lighting Cost (Current)" value={`£${dataOrNA(epcData.lightingCostCurrent)} / year`} tooltip={dataTooltips.lightingCostCurrent} />
                        <DataItem label="Lighting Cost (Potential)" value={`£${dataOrNA(epcData.lightingCostPotential)} / year`} tooltip={dataTooltips.lightingCostPotential} />
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
        </>
    );
}

function FloodRiskDisplay({ floodRiskData, logs }: { floodRiskData: FloodRiskData, logs: string[] }) {
    const floodLogs = logs.filter(log => log.startsWith('[FLOOD'));

    const isNullOrEmpty = (value: string | undefined | null) => value === null || value === undefined || value.trim() === '' || value.toLowerCase() === 'null';

    if (!floodRiskData) {
        return (
            <>
                <DataItem label="Flood Risk" value="Data not available" />
                {floodLogs.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="log">
                            <AccordionTrigger className="text-sm text-primary hover:underline">
                                Show Fetch Log
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
        <>
            <DataItem label="Risk from Rivers and Sea" value={floodRiskData.riskOfFloodingFromRiversAndSea} tooltip={dataTooltips.PROB_4BAND} />
            <DataItem label="Data Suitability" value={isNullOrEmpty(floodRiskData.suitability) ? ' - ' : floodRiskData.suitability} tooltip={dataTooltips.SUITABILITY} />
            <DataItem label="Publication Date" value={isNullOrEmpty(floodRiskData.publishDate) ? ' - ' : new Date(floodRiskData.publishDate).toLocaleDateString()} tooltip={dataTooltips.PUB_DATE} />
             <Separator className="my-2" />
             <DataItem label="Easting" value={floodRiskData.easting} tooltip={dataTooltips.easting} />
            <DataItem label="Northing" value={floodRiskData.northing} tooltip={dataTooltips.northing} />
            <DataItem label="Latitude" value={floodRiskData.latitude} tooltip={dataTooltips.latitude} />
            <DataItem label="Longitude" value={floodRiskData.longitude} tooltip={dataTooltips.longitude} />

            {floodLogs.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="log">
                        <AccordionTrigger className="text-sm text-primary hover:underline">
                            Show Fetch Log
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

function PlanningHistoryDisplay({ planningHistory, logs }: { planningHistory: PlanningHistoryItem[], logs: string[] }) {
    const planningLogs = logs.filter(log => log.startsWith('[PLANNING'));

    const display = (
        <>
            {planningHistory.length > 0 ? (
                <ul className="space-y-4">
                    {planningHistory.map((item, index) => (
                        <li key={index} className="text-sm border-l-2 border-primary/50 pl-4 py-1">
                            <p className="font-semibold">{item.application}</p>
                            <p className="text-muted-foreground">
                                Status: <span className={`font-medium ${item.decision.toLowerCase().includes('approve') ? 'text-green-600' : 'text-red-600'}`}>{item.decision}</span> on {item.date}
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
             <div className="mt-4 flex flex-col gap-2">
                <Accordion type="single" collapsible className="w-full">
                    {planningLogs.length > 0 && (
                        <AccordionItem value="log">
                            <AccordionTrigger className="text-sm text-primary hover:underline">
                                Show Fetch Log
                            </AccordionTrigger>
                            <AccordionContent>
                                <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                                    {planningLogs.join('\n')}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
                 <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/debug/planning">
                        <Search className="mr-2 h-4 w-4" />
                        Debug Planning History
                    </Link>
                </Button>
            </div>
        </>
    );
}


export function ReportDisplay({ address, reportData, isLoading, onReset }: ReportDisplayProps) {
  const [conditionReport, setConditionReport] = useState<string | null>(null);
  const [isConditionReportLoading, setIsConditionReportLoading] = useState(false);

  // Debug log for incoming data
  // console.log('[CLIENT] Report Data in UI:', reportData);

  if (isLoading) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Generating Your HomePack...</h2>
        <p className="text-muted-foreground">Fetching data and creating your AI summary.</p>
      </div>
    );
  }

  if (!reportData) return null;

  const { propertyData, summary, logs } = reportData;
  const { landRegistry, epc, floodRisk, planningHistory } = propertyData;
  

  const getPrimaryTransaction = (results: LandRegistryResult[]) => {
     if (!results || results.length === 0) return null;
     // The API returns results sorted by date, so the first one is the most recent.
     return results[0];
  }

  const primaryTransaction = getPrimaryTransaction(landRegistry);


  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onReset} className="mb-2 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start New Report
          </Button>
          <h2 className="text-3xl font-bold font-headline tracking-tight">{propertyData.address}</h2>
          <p className="text-muted-foreground">Your comprehensive property information pack.</p>
        </div>
        <Button size="lg" className="w-full md:w-auto">
          <Download className="mr-2" />
          Download PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AiSummary summary={summary} />

          <DataSection icon={Landmark} title="Land Registry">
            {primaryTransaction ? (
                <>
                  <DataItem label="Last Sold Price" value={`£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()}`} />
                  <DataItem label="Last Sold Date" value={new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')} />
                  <DataItem label="Tenure" value={primaryTransaction.estateType} />
                  <Separator className="my-4" />
                  <h3 className="text-md font-semibold text-foreground mb-2">Full Sales History</h3>
                  <div className="space-y-3">
                    {landRegistry.map((transaction, index) => (
                      <div key={index} className="p-2 rounded-md even:bg-muted/50">
                        <div className="flex justify-between items-center text-sm">
                           <p className="font-medium text-primary">£${parseInt(transaction.pricePaid, 10).toLocaleString()}</p>
                           <p className="text-muted-foreground">{new Date(transaction.transactionDate).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
              <EpcDisplay epcData={epc} />
          </DataSection>
          
          <DataSection icon={Waves} title="Flood Risk">
            <FloodRiskDisplay floodRiskData={floodRisk} logs={logs} />
          </DataSection>

          <DataSection icon={ClipboardList} title="Planning History">
            <PlanningHistoryDisplay planningHistory={planningHistory} logs={logs} />
          </DataSection>

        </div>
        <div className="lg:col-span-1 space-y-8">
          <ImageUploader onReportGenerated={setConditionReport} setIsLoading={setIsConditionReportLoading} />
          <AiConditionReport report={conditionReport} isLoading={isConditionReportLoading} />
        </div>
      </div>
    </div>
  );
}
