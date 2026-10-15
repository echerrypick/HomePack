import { PageHero } from '@/components/layout/PageHero';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AddressForm } from '@/components/homepack/address-form';
import { ReportDisplay } from '@/components/homepack/report-display';
import { Address, ReportResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileText, Info, Loader2, CheckCircle2, ArrowRight, Clock, TicketPercent } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authenticatedFetch, billingRequest } from '@/lib/billing-client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Step = 'address' | 'report';

export default function ToolPage() {
  const { user, profile, loading } = useAuth();
  const { activeJob, openModal, startJob, recentReports, loadReport, openSavedReport, dismissActiveJob } = useHomePackJob();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromHistory, setIsFromHistory] = useState(false);
  const [paymentPromptAddress, setPaymentPromptAddress] = useState<Address | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false);

  // Check if routed from a notification or history with preloaded report
  useEffect(() => {
    if (location.state?.startNewHomePack) {
      dismissActiveJob();
      setIsFromHistory(false);
      setStep('address');
      setSelectedAddress(null);
      setReportData(null);
      setError(null);
      window.history.replaceState({}, document.title);
    } else if (location.state?.report && location.state?.address) {
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
    if (location.state?.startNewHomePack || location.state?.report) return;
    if (activeJob?.status === 'completed' && activeJob.result) {
      setReportData(activeJob.result);
      setSelectedAddress(activeJob.address);
      setStep('report');
      setIsFromHistory(false);
    } else if (activeJob?.status === 'failed') {
      setError(activeJob.error || 'Property report generation encountered an issue. Please try again.');
    }
  }, [activeJob?.status, activeJob?.result, activeJob?.address, activeJob?.error]);

  useEffect(() => {
    if (user && location.state?.paidAddress) {
      const address = location.state.paidAddress;
      navigate('/tool', { replace: true, state: {} });
      void handleAddressSelect(address);
    }
  }, [user?.uid, location.state?.paidAddress]);

  const beginReport = async (address: Address) => {
    setSelectedAddress(address);
    await startJob(address);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { searchCount: increment(1) });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.UPDATE, path);
      }
    }
  };

  const handleAddressSelect = async (address: Address) => {
    if (!user) {
      setError("Please login to search for properties.");
      return;
    }

    setSelectedAddress(address);
    setIsStarting(true);
    setError(null);
    try {
      const access = await authenticatedFetch('/api/billing/access', { method: 'POST', body: JSON.stringify(address) });
      if (access.status === 402) {
        sessionStorage.setItem('homepack_checkout_address', JSON.stringify(address));
        setPaymentPromptAddress(address);
        return;
      }
      if (!access.ok) throw new Error((await access.json()).error || 'Unable to check property access.');
      await beginReport(address);
    } catch (e: any) {
      console.error("[CLIENT] Error starting report generation:", e);
      setError(e.message || "Failed to start property report generation. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handlePromoRedeem = async () => {
    if (!paymentPromptAddress || !promoCode.trim()) return;
    setIsRedeemingPromo(true);
    setPromoError('');
    try {
      const result = await billingRequest('/api/promo-codes/redeem', { code: promoCode, plan: 'report', address: paymentPromptAddress });
      if (result.requiresPayment) {
        sessionStorage.setItem('homepack_promo_code', result.code);
        sessionStorage.setItem('homepack_promo_discount', String(result.discountPercent));
        sessionStorage.setItem('homepack_promo_plan', 'report');
        navigate('/payment?plan=report&discount=1');
        return;
      }
      sessionStorage.removeItem('homepack_checkout_address');
      window.dispatchEvent(new Event('homepack-billing-updated'));
      const unlockedAddress = paymentPromptAddress;
      setPaymentPromptAddress(null);
      setPromoCode('');
      await beginReport(unlockedAddress);
    } catch (promoFailure: any) {
      setPromoError(promoFailure.message || 'Unable to redeem this code.');
    } finally {
      setIsRedeemingPromo(false);
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
        <main className="site-main flex-grow container mx-auto px-4 py-20">
          <PageHero eyebrow="Your property workspace"><h1 className="site-page-heading">A clearer picture starts here.</h1><p>Sign in to choose a property, purchase your report and keep track of your searches.</p><LoginDialog trigger={<Button size="lg" className="mt-5">Sign In to Continue</Button>} /></PageHero>
        </main>
        <Footer />
      </div>
    );
  }

  const isJobProcessing = activeJob?.status === 'processing';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Dialog open={Boolean(paymentPromptAddress)} onOpenChange={(open) => { if (!open) { setPaymentPromptAddress(null); setPromoCode(''); setPromoError(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment required for this property</DialogTitle>
            <DialogDescription>
              Retail access covers one property. A separate £9.99 payment is required before generating a report for a different address.
            </DialogDescription>
          </DialogHeader>
          {paymentPromptAddress && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm font-semibold">
              {paymentPromptAddress.houseNumber} {paymentPromptAddress.street}, {paymentPromptAddress.town}, {paymentPromptAddress.postcode}
            </div>
          )}
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2">
              <TicketPercent className="h-4 w-4 text-primary" />
              <p className="font-semibold">Have a complimentary or discount code?</p>
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="Complimentary or discount code"
                value={promoCode}
                onChange={event => setPromoCode(event.target.value.toUpperCase())}
                placeholder="Enter code"
                autoComplete="off"
              />
              <Button variant="outline" disabled={!promoCode.trim() || isRedeemingPromo} onClick={handlePromoRedeem}>
                {isRedeemingPromo ? 'Checking…' : 'Apply'}
              </Button>
            </div>
            {promoError && <p role="alert" className="text-sm text-destructive">{promoError}</p>}
            <p className="text-xs text-muted-foreground">Free-report codes unlock this property now. Percentage codes apply the reduced price at checkout.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPaymentPromptAddress(null)}>Cancel</Button>
            <Button onClick={() => { sessionStorage.removeItem('homepack_promo_code'); sessionStorage.removeItem('homepack_promo_discount'); navigate('/payment?plan=report'); }}>Continue to payment — £9.99</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Header />
      <main className="site-main flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {step === 'address' && (
            <div className="space-y-10">
              <PageHero eyebrow="Your property workspace"><h1 className="site-page-heading">A clearer picture of your next property.</h1><p>Choose an address, explore the available records and keep a report for your next conversation.</p></PageHero>
              {/* Active Job In-Progress Banner (if running in background) */}
              {isJobProcessing && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">Compiling UK Property Report</span>
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
                          void openSavedReport(item);
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
                        <div className="shrink-0 p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colours">
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
                    <p className="text-sm text-muted-foreground mb-4">Maximise your property's value and prepare for a smooth sale process.</p>
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
