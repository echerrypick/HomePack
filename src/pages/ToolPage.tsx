import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AddressForm } from '@/components/homepack/address-form';
import { ReportDisplay } from '@/components/homepack/report-display';
import { Address, ReportResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileText, Info } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Link } from 'react-router-dom';

type Step = 'address' | 'report';

export default function ToolPage() {
  const { user, profile, loading } = useAuth();
  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSearchLimit = () => {
    if (!profile) return false;
    const { role, searchCount } = profile;
    if (role === 'admin' || role === 'agency') return true;
    if (role === 'subscription' && searchCount < 5) return true;
    if (role === 'free' && searchCount < 1) return true;
    return false;
  };

  const handleAddressSelect = async (address: Address) => {
    if (!user) {
      setError("Please login to search for properties.");
      return;
    }

    if (!checkSearchLimit()) {
      setError(`You have reached your search limit for your ${profile?.role} account. Please upgrade to search more addresses.`);
      return;
    }

    setSelectedAddress(address);
    setIsLoading(true);
    setError(null);
    setStep('report');
    
    try {
      const response = await fetch('/api/get-property-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      
      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to generate report');
      }
      
      const report = await response.json();
      
      // Update user search count and history
      const addressStr = `${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}`;
      const sanitizedAddress = addressStr.replace(/\./g, '_');
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          searchCount: increment(1),
          searchedAddresses: arrayUnion(addressStr),
          searchHistory: arrayUnion({
            address: addressStr,
            timestamp: new Date().toISOString()
          }),
          [`propertyReportCounts.${sanitizedAddress}`]: increment(1)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }

      setSelectedAddress(address);
      setReportData(report);
      if (report.error) {
        setError(report.error);
      }
    } catch (e: any) {
      if (e.message.includes('Firestore Error')) {
        setError("Failed to update search history. Please check your connection.");
      } else {
        console.error("[CLIENT] Error during report generation:", e);
        setError(e.message || "Failed to generate property report. Please try again later.");
      }
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
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 shadow-xl border-border/50">
            <CardHeader>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Login Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-10">Please sign in with your account to access the HomePack generator and view your history.</p>
              <LoginDialog trigger={<Button size="lg" className="w-full h-12 text-base rounded-full">Sign In to Continue</Button>} />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {step === 'address' && (
             <div className="space-y-12">
               <AddressForm onAddressSubmit={handleAddressSelect} isLoading={isLoading} error={error} />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="border-border bg-card hover:shadow-md transition-shadow">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <FileText className="h-5 w-5 text-primary" />
                       Buyer's Guide
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">Checklists, tips, and the latest TA6 form guidance for prospective buyers.</p>
                     <Button asChild variant="outline" size="sm" className="w-full">
                       <Link to="/buyer-guide">View Buyer Guide</Link>
                     </Button>
                   </CardContent>
                 </Card>

                 <Card className="border-border bg-card hover:shadow-md transition-shadow">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <Info className="h-5 w-5 text-primary" />
                       Seller's Guide
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">Maximize your property's value and prepare for a smooth sale process.</p>
                     <Button asChild variant="outline" size="sm" className="w-full">
                       <Link to="/seller-guide">View Seller Guide</Link>
                     </Button>
                   </CardContent>
                 </Card>
               </div>
             </div>
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
      <Footer />
    </div>
  );
}
