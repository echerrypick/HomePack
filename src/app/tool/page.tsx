'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { AddressForm } from '@/components/homepack/address-form';
import { ReportDisplay } from '@/components/homepack/report-display';
import type { Address, PropertyData } from '@/app/actions';
import { getPropertyReport } from '@/app/actions';

type Step = 'address' | 'report';

type ReportResult = {
  propertyData: PropertyData;
  summary: string;
  error?: string;
};


export default function ToolPage() {
  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressSelect = async (address: Address) => {
    setIsLoading(true);
    setError(null);
    setStep('report'); // Change step immediately for better UX
    console.log('[CLIENT] Address selected:', address);
    try {
      const report = await getPropertyReport(address);
      console.log('[CLIENT] Received report result from server action:', report);
      setSelectedAddress(address);
      setReportData(report);
      if (report.error) {
        setError(report.error);
      }
    } catch (e: any) {
      console.error("[CLIENT] Error during report generation:", e);
      setError(e.message || "Failed to generate property report. Please try again later.");
      // Reset to a safe state on failure
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('address');
    setSelectedAddress(null);
    setReportData(null);
    setError(null);
    console.log('[CLIENT] State reset.');
  };
  
  console.log(`[CLIENT] Rendering page. Current step: ${step}`);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePackHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {step === 'address' && (
             <AddressForm onAddressSubmit={handleAddressSelect} isLoading={isLoading} error={error} />
          )}
          
          {step === 'report' && (
             <ReportDisplay
                address={selectedAddress!}
                reportData={reportData}
                isLoading={isLoading && !reportData}
                onReset={handleReset}
              />
          )}
        </div>
      </main>
    </div>
  );
}
