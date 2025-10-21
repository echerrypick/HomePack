
'use client';

import { useState } from 'react';
import type { Address, PropertyData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { Landmark, Zap, Waves, ClipboardList } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type ReportDisplayProps = {
  address: Address;
  reportData: { propertyData: PropertyData; summary: string; error?: string } | null;
  isLoading: boolean;
  onReset: () => void;
};

export function ReportDisplay({ address, reportData, isLoading, onReset }: ReportDisplayProps) {
  const [conditionReport, setConditionReport] = useState<string | null>(null);
  const [isConditionReportLoading, setIsConditionReportLoading] = useState(false);

  // Debug log for incoming data
  console.log('[CLIENT] Report Data in UI:', reportData);

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

  const { propertyData, summary } = reportData;
  const landRegistry = propertyData.landRegistry;
  
  const epcValue = (7 - (propertyData.epc.rating.charCodeAt(0) - 'A'.charCodeAt(0))) * (100/7);

  // Display logic for last sold data
  const lastSoldDate = landRegistry.date && landRegistry.date !== 'N/A' && !isNaN(new Date(landRegistry.date).getTime())
    ? new Date(landRegistry.date).toLocaleDateString('en-GB')
    : null;
    
  const lastSoldText = landRegistry.pricePaid.startsWith('£') && lastSoldDate
    ? `${landRegistry.pricePaid} on ${lastSoldDate}`
    : landRegistry.pricePaid; // This will now show the price, or the error message.


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
            <DataItem label="Title Number" value={landRegistry.titleNumber} />
            <DataItem label="Tenure" value={landRegistry.tenure || 'No tenure data available'} />
            <DataItem label="Last Sold" value={lastSoldText} />
          </DataSection>

          <DataSection icon={Zap} title="Energy Performance (EPC)">
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                    <span>Current Rating: {propertyData.epc.rating}</span>
                    <span>Potential: {propertyData.epc.potentialRating}</span>
                </div>
                <Progress value={epcValue} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>G (Worst)</span>
                    <span>A (Best)</span>
                </div>
              </div>
            <DataItem label="Valid Until" value={new Date(propertyData.epc.validUntil).toLocaleDateString()} />
            <DataItem label="Estimated Energy Use" value={`${propertyData.epc.energyUse} kWh/m²/yr`} />
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
