import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AddressForm } from '@/components/homepack/address-form';
import { ReportDisplay } from '@/components/homepack/report-display';
import { Address, ReportResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileText, Info, Loader2, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type Step = 'address' | 'report';

export default function ToolPage() {
  const { user, profile, loading } = useAuth();
  const { activeJob, openModal, startJob, recentReports, loadReport } = useHomePackJob();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromHistory, setIsFromHistory] = useState(false);

  // Check if routed from a notification or history with preloaded report
  useEffect(() => {
    if (location.state?.report && location.state?.address) {
      setReportData(location.state.report);
      setSelectedAddress(location.state.address);
      setStep('report');
      setIsFromHistory(Boolean(location.state.fromHistory));
      // Clear location state to avoid sticky reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // When activeJob completes, if the user is on ToolPage, automatically show the report
  useEffect(() => {
    if (activeJob?.status === 'completed' && activeJob.result) {
      setReportData(activeJob.result);
      setSelectedAddress(activeJob.address);
      setStep('report');
      setIsFromHistory(false);
    } else if (activeJob?.status === 'failed') {
      setError(activeJob.error || 'HomePack generation encountered an issue. Please try again.');
    }
  }, [activeJob?.status, activeJob?.result, activeJob?.address, activeJob?.error]);

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
    setIsStarting(true);
    setError(null);
    
    try {
      // Start async background job
      await startJob(address);

      // Update user search count and history in Firestore
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
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.UPDATE, path);
      }
    } catch (e: any) {
      console.error("[CLIENT] Error starting report generation:", e);
      setError(e.message || "Failed to start property report generation. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleReset = () => {
    setIsFromHistory(false);
    setStep('address');
    setSelectedAddress(null);
    setReportData(null);
    setError(null);
  };

  const handleBack = () => {
    if (isFromHistory) {
      navigate('/history');
    } else {
      handleReset();
    }
  };

  const handleNewHomePack = () => {
    setIsFromHistory(false);
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

  const isJobProcessing = activeJob?.status === 'processing';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {step === 'address' && (
            <div className="space-y-10">
              {/* Active Job In-Progress Banner (if running in background) */}
              {isJobProcessing && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">Compiling HomePack in Background</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {activeJob.progress}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activeJob.address.houseNumber} {activeJob.address.street}, {activeJob.address.town} ({activeJob.address.postcode})
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={openModal}
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold shrink-0"
                  >
                    View Live Checklist
                  </Button>
                </div>
              )}

              <AddressForm 
                onAddressSubmit={handleAddressSelect} 
                isLoading={isStarting || isJobProcessing} 
                error={error} 
              />

              {/* Recently Completed HomePacks Quick List */}
              {recentReports.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Recently Completed HomePacks
                    </h3>
                    <Link to="/history" className="text-xs text-primary hover:underline font-medium">
                      View all in History
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentReports.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedAddress(item.address);
                          setReportData(item.result);
                          setStep('report');
                          setIsFromHistory(false);
                        }}
                        className="group flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-sm font-semibold text-foreground truncate">
                              {item.address.houseNumber} {item.address.street}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.address.town}, {item.address.postcode}
                          </p>
                        </div>
                        <div className="shrink-0 p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
               
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
              isLoading={isStarting && !reportData}
              onReset={handleReset}
              onBack={handleBack}
              backLabel={isFromHistory ? "Back to History" : "Back to Search"}
              onNewHomePack={handleNewHomePack}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
