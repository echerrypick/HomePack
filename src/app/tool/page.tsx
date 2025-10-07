'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { AddressForm } from '@/components/homepack/address-form';
import { PropertySelector } from '@/components/homepack/property-selector';
import { ReportDisplay } from '@/components/homepack/report-display';
import type { Address, PropertyData } from '@/lib/mock-data';
import { postcodeSearchOrGetReport } from '@/app/actions';

type Step = 'address' | 'select' | 'report';

export default function ToolPage() {
  const [step, setStep] = useState<Step>('address');
  const [postcode, setPostcode] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<{ propertyData: PropertyData, summary: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressSearch = async (postcode: string) => {
    setIsLoading(true);
    setError(null);
    setPostcode(postcode); // Save postcode for later
    try {
      const result = await postcodeSearchOrGetReport({ postcode });
      if (result.status === 'address_selection') {
        setAddresses(result.addresses);
        setStep('select');
      } else if (result.status === 'report_ready') {
        setSelectedAddress(result.address);
        setReportData(result.report);
        setStep('report');
      }
    } catch (e: any) {
      setError(e.message || "Failed to process postcode. Please try again later.");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = async (address: Address) => {
    setIsLoading(true);
    setError(null);
    setStep('report'); // Change step immediately for better UX
    try {
      const result = await postcodeSearchOrGetReport({ postcode, selectedAddressId: address.id });
      if (result.status === 'report_ready') {
        setSelectedAddress(result.address);
        setReportData(result.report);
      } else {
        // This case should not happen if we provide an address ID
         throw new Error("An unexpected error occurred while fetching the report.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate property report. Please try again later.");
      // Reset to a safe state on failure
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('address');
    setPostcode('');
    setAddresses([]);
    setSelectedAddress(null);
    setReportData(null);
    setError(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePackHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {step === 'address' && (
             <AddressForm onSearch={handleAddressSearch} isLoading={isLoading} error={error} />
          )}

          {step === 'select' && !isLoading && (
            <PropertySelector
              addresses={addresses}
              onSelect={handleAddressSelect}
              onBack={handleReset}
            />
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
