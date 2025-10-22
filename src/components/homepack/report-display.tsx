
'use client';

import { useState } from 'react';
import type { Address, PropertyData, LandRegistryResult, EpcData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Landmark, Zap, Waves, ClipboardList, BookCopy } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { epcTooltips } from '@/lib/epc-tooltips';

type ReportDisplayProps = {
  address: Address;
  reportData: { propertyData: PropertyData; summary: string; logs: string[], error?: string } | null;
  isLoading: boolean;
  onReset: () => void;
};

function DebugLogDisplay({ logs }: { logs: string[] }) {
    if (!logs || logs.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="debug-log">
                <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookCopy className="h-4 w-4" />
                        <span>Show Fetch Log</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                        {logs.join('\n')}
                    </pre>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

function EpcDisplay({ epcData, logs }: { epcData: EpcData, logs: string[] }) {
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
                        <DataItem label="Address Line 1" value={dataOrNA(epcData.address1)} tooltip={epcTooltips.address1} />
                        <DataItem label="Address Line 2" value={dataOrNA(epcData.address2)} tooltip={epcTooltips.address2} />
                        <DataItem label="Address Line 3" value={dataOrNA(epcData.address3)} tooltip={epcTooltips.address3} />
                        <DataItem label="Town" value={dataOrNA(epcData.posttown)} tooltip={epcTooltips.posttown} />
                        <DataItem label="Postcode" value={dataOrNA(epcData.postcode)} tooltip={epcTooltips.postcode} />
                        <DataItem label="County" value={dataOrNA(epcData.county)} tooltip={epcTooltips.county} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Lodgement Date" value={epcData.lodgementDate ? new Date(epcData.lodgementDate).toLocaleDateString() : 'N/A'} tooltip={epcTooltips.lodgementDate}/>
                        <DataItem label="Inspection Date" value={epcData.inspectionDate ? new Date(epcData.inspectionDate).toLocaleDateString() : 'N/A'} tooltip={epcTooltips.inspectionDate} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Current Rating" value={dataOrNA(epcData.rating)} tooltip={epcTooltips.rating} />
                        <DataItem label="Potential Rating" value={dataOrNA(epcData.potentialRating)} tooltip={epcTooltips.potentialRating} />
                        <DataItem label="Current Efficiency" value={dataOrNA(epcData.currentEnergyEfficiency)} tooltip={epcTooltips.currentEnergyEfficiency} />
                        <DataItem label="Potential Efficiency" value={dataOrNA(epcData.potentialEnergyEfficiency)} tooltip={epcTooltips.potentialEnergyEfficiency} />
                         <Separator className="md:col-span-2" />
                        <DataItem label="Property Type" value={dataOrNA(epcData.propertyType)} tooltip={epcTooltips.propertyType} />
                        <DataItem label="Built Form" value={dataOrNA(epcData.builtForm)} tooltip={epcTooltips.builtForm} />
                        <DataItem label="Construction Age" value={dataOrNA(epcData.constructionAgeBand)} tooltip={epcTooltips.constructionAgeBand} />
                        <DataItem label="Tenure" value={dataOrNA(epcData.tenure)} tooltip={epcTooltips.tenure} />
                        <DataItem label="UPRN" value={dataOrNA(epcData.uprn)} tooltip={epcTooltips.uprn} />
                        <DataItem label="Building Reference" value={dataOrNA(epcData.buildingReferenceNumber)} tooltip={epcTooltips.buildingReferenceNumber} />
                        <DataItem label="Local Authority" value={dataOrNA(epcData.localAuthorityLabel)} tooltip={epcTooltips.localAuthorityLabel} />
                        <DataItem label="Constituency" value={dataOrNA(epcData.constituencyLabel)} tooltip={epcTooltips.constituencyLabel} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Total Floor Area" value={`${dataOrNA(epcData.totalFloorArea)} m²`} tooltip={epcTooltips.totalFloorArea} />
                        <DataItem label="Habitable Rooms" value={dataOrNA(epcData.numberHabitableRooms)} tooltip={epcTooltips.numberHabitableRooms} />
                        <DataItem label="Heated Rooms" value={dataOrNA(epcData.numberHeatedRooms)} tooltip={epcTooltips.numberHeatedRooms} />
                        <DataItem label="Transaction Type" value={dataOrNA(epcData.transactionType)} tooltip={epcTooltips.transactionType} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Main Heat Source" value={dataOrNA(epcData.mainHeatDescription)} tooltip={epcTooltips.mainHeatDescription} />
                        <DataItem label="Main Heat Controls" value={dataOrNA(epcData.mainheatcontDescription)} tooltip={epcTooltips.mainheatcontDescription} />
                        <DataItem label="Main Fuel" value={dataOrNA(epcData.mainFuel)} tooltip={epcTooltips.mainFuel} />
                        <DataItem label="Secondary Heat" value={dataOrNA(epcData.secondheatDescription)} tooltip={epcTooltips.secondheatDescription} />
                        <DataItem label="Hot Water" value={dataOrNA(epcData.hotwaterDescription)} tooltip={epcTooltips.hotwaterDescription} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Walls" value={dataOrNA(epcData.wallsDescription)} tooltip={epcTooltips.wallsDescription} />
                        <DataItem label="Walls Energy Eff." value={dataOrNA(epcData.wallsEnergyEff)} tooltip={epcTooltips.wallsEnergyEff} />
                        <DataItem label="Roof" value={dataOrNA(epcData.roofDescription)} tooltip={epcTooltips.roofDescription} />
                        <DataItem label="Roof Energy Eff." value={dataOrNA(epcData.roofEnergyEff)} tooltip={epcTooltips.roofEnergyEff} />
                        <DataItem label="Floor" value={dataOrNA(epcData.floorDescription)} tooltip={epcTooltips.floorDescription} />
                        <DataItem label="Windows" value={dataOrNA(epcData.windowsDescription)} tooltip={epcTooltips.windowsDescription} />
                        <DataItem label="Windows Energy Eff." value={dataOrNA(epcData.windowsEnergyEff)} tooltip={epcTooltips.windowsEnergyEff} />
                        <DataItem label="Lighting" value={dataOrNA(epcData.lightingDescription)} tooltip={epcTooltips.lightingDescription} />
                        <DataItem label="Lighting Energy Eff." value={dataOrNA(epcData.lightingEnergyEff)} tooltip={epcTooltips.lightingEnergyEff} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="CO₂ Emissions (Current)" value={`${dataOrNA(epcData.co2EmissionsCurrent)} tonnes/year`} tooltip={epcTooltips.co2EmissionsCurrent} />
                        <DataItem label="CO₂ Emissions (Potential)" value={`${dataOrNA(epcData.co2EmissionsPotential)} tonnes/year`} tooltip={epcTooltips.co2EmissionsPotential} />
                        <DataItem label="Energy Consumption (Current)" value={`${dataOrNA(epcData.energyConsumptionCurrent)} kWh/m² per year`} tooltip={epcTooltips.energyConsumptionCurrent} />
                        <DataItem label="Energy Consumption (Potential)" value={`${dataOrNA(epcData.energyConsumptionPotential)} kWh/m² per year`} tooltip={epcTooltips.energyConsumptionPotential} />
                        <Separator className="md:col-span-2" />
                        <DataItem label="Heating Cost (Current)" value={`£${dataOrNA(epcData.heatingCostCurrent)} / year`} tooltip={epcTooltips.heatingCostCurrent} />
                        <DataItem label="Heating Cost (Potential)" value={`£${dataOrNA(epcData.heatingCostPotential)} / year`} tooltip={epcTooltips.heatingCostPotential} />
                        <DataItem label="Hot Water Cost (Current)" value={`£${dataOrNA(epcData.hotWaterCostCurrent)} / year`} tooltip={epcTooltips.hotWaterCostCurrent} />
                        <DataItem label="Hot Water Cost (Potential)" value={`£${dataOrNA(epcData.hotWaterCostPotential)} / year`} tooltip={epcTooltips.hotWaterCostPotential} />
                        <DataItem label="Lighting Cost (Current)" value={`£${dataOrNA(epcData.lightingCostCurrent)} / year`} tooltip={epcTooltips.lightingCostCurrent} />
                        <DataItem label="Lighting Cost (Potential)" value={`£${dataOrNA(epcData.lightingCostPotential)} / year`} tooltip={epcTooltips.lightingCostPotential} />
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
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
  const { landRegistry, epc } = propertyData;
  

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
                           <p className="font-medium text-primary">£{parseInt(transaction.pricePaid, 10).toLocaleString()}</p>
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
              <EpcDisplay epcData={epc} logs={logs} />
          </DataSection>
          
          <DataSection icon={Waves} title="Flood Risk">
            <DataItem label="Rivers and Sea" value={propertyData.floodRisk.riverAndSea} />
            <DataItem label="Surface Water" value={propertyData.floodRisk.surfaceWater} />
          </DataSection>

          <DataSection icon={ClipboardList} title="Planning History">
            <ul className="space-y-3">
              {propertyData.planningHistory.map((item, index) => (
                <li key={index} className="text-sm border-l-2 border-primary/50 pl-4">
                  <p className="font-semibold">{item.application}</p>
                  <p className="text-muted-foreground">Status: <span className={`font-medium ${item.decision === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>{item.decision}</span> on {new Date(item.date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
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
