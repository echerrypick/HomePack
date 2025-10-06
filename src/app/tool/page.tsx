'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { AddressForm } from '@/components/homepack/address-form';
import { PropertySelector } from '@/components/homepack/property-selector';
import { ReportDisplay } from '@/components/homepack/report-display';
import type { Address, PropertyData } from '@/lib/mock-data';
import { searchAddress, getPropertyData } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';

type Step = 'address' | 'select' | 'report';

export default function ToolPage() {
  const [step, setStep] = useState<Step>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<{ propertyData: PropertyData, summary: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressSearch = async (postcode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchAddress(postcode);
      if (result.length === 0) {
        setError("No addresses found for this postcode. Please try again.");
        setAddresses([]);
      } else if (result.length === 1) {
        // Automatically select if only one address is found
        await handleAddressSelect(result[0]);
      } else {
        setAddresses(result);
        setStep('select');
      }
    } catch (e) {
      setError("Failed to fetch addresses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = async (address: Address) => {
    setIsLoading(true);
    setError(null);
    setStep('report'); // Change step immediately for better UX
    setSelectedAddress(address);
    try {
      const data = await getPropertyData(address.id);
      setReportData(data);
    } catch (e) {
      setError("Failed to generate property report. Please try again later.");
      // Reset to a safe state on failure
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('address');
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
              onBack={() => setStep('address')}
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
