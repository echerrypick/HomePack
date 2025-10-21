
'use client';

import { useState } from 'react';
import type { Address, PropertyData, LandRegistryResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Landmark, Zap, Waves, ClipboardList, BookCopy } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { ImageUploader } from './image-uploader';
import { AiConditionReport } from './ai-condition-report';
import { DataSection, DataItem } from './data-section';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

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
                    <div className="flex items-center gap-2 text-sm">
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

  const { propertyData, summary, logs } = reportData;
  const { landRegistry } = propertyData;
  
  const epcValue = (7 - (propertyData.epc.rating.charCodeAt(0) - 'A'.charCodeAt(0))) * (100/7);

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
                  <DataItem label="Title Number" value={"N/A"} />
                  <DataItem label="Tenure" value={primaryTransaction.estateType} />
                  <Separator className="my-4" />
                  <h3 className="text-md font-semibold text-foreground mb-2">Sales History</h3>
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
            <DebugLogDisplay logs={logs} />
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
