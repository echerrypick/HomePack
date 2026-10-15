import { PageHero } from '@/components/layout/PageHero';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useAuth } from '@/contexts/AuthContext';
import { billingRequest } from '@/lib/billing-client';
import { PLANS, type PaidPlan, validAddress } from '@/lib/plans';
import type { Address } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestedPlan = params.get('plan') || 'report';
  const plan: PaidPlan = Object.hasOwn(PLANS, requestedPlan) ? requestedPlan as PaidPlan : 'report';
  const [address] = useState<Address | null>(() => {
    try { const saved = JSON.parse(sessionStorage.getItem('homepack_checkout_address') || 'null'); return validAddress(saved) ? saved : null; } catch { return null; }
  });
  const [promoCode] = useState(() => sessionStorage.getItem('homepack_promo_code') || '');
  const [promoDiscount] = useState(() => {
    const value = Number.parseInt(sessionStorage.getItem('homepack_promo_discount') || '0', 10);
    return Number.isInteger(value) && value > 0 && value < 100 ? value : 0;
  });
  const [billingStatus, setBillingStatus] = useState<{
    enabled: boolean;
    available: boolean;
    developmentSimulation: boolean;
    testMode?: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completedAddress, setCompletedAddress] = useState<Address | null>(null);
  const [completedPlan, setCompletedPlan] = useState<PaidPlan | null>(null);
  const sessionId = params.get('session_id');
  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(d => setBillingStatus({
        enabled: d.enabled !== false,
        available: Boolean(d.available),
        developmentSimulation: Boolean(d.developmentSimulation),
        testMode: Boolean(d.testMode),
      }))
      .catch(() => setBillingStatus({ enabled: true, available: false, developmentSimulation: false }));
  }, []);
  const available = billingStatus?.available ?? false;
  const canCheckout = available || Boolean(billingStatus?.developmentSimulation);
  const verify = async () => {
    setBusy(true); setError('');
    try {
      const result = await billingRequest('/api/billing/verify', { sessionId });
      if (!result.paid) { setError('Payment is still pending. Check again once payment is complete.'); return; }
      window.dispatchEvent(new Event('homepack-billing-updated'));
      if (result.address) setCompletedAddress(result.address);
      else setCompletedPlan((result.plan || plan) as PaidPlan);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  useEffect(() => { if (sessionId && user) void verify(); }, [sessionId, user?.uid]);
  const checkout = async () => {
    setBusy(true); setError('');
    try {
      const result = await billingRequest('/api/billing/checkout', { plan, address, ...(plan === 'report' && promoCode ? { promoCode } : {}) });
      if (result.alreadyPurchased) navigate('/tool', { state: { paidAddress: address } });
      else if (result.completed && result.simulated) {
        if (result.address) setCompletedAddress(result.address);
        else setCompletedPlan((result.plan || plan) as PaidPlan);
      }
      else window.location.assign(result.url);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  const finishJourney = () => {
    sessionStorage.removeItem('homepack_checkout_address');
    sessionStorage.removeItem('homepack_promo_code');
    sessionStorage.removeItem('homepack_promo_discount');
    if (completedAddress) navigate('/tool', { replace: true, state: { paidAddress: completedAddress } });
    else navigate('/profile', { replace: true });
  };
  const completed = Boolean(completedAddress || completedPlan);
  return <div className="min-h-screen flex flex-col">
    <Dialog open={completed} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center">Payment complete</DialogTitle>
          <DialogDescription className="text-center">
            {completedAddress
              ? 'This property is now unlocked for your account. You can generate the report without another payment for the same address.'
              : 'Your plan is now active on this account.'}
          </DialogDescription>
        </DialogHeader>
        {completedAddress && <div className="rounded-xl border bg-muted/40 p-4 text-center text-sm font-semibold">{completedAddress.houseNumber} {completedAddress.street}, {completedAddress.town}, {completedAddress.postcode}</div>}
        <DialogFooter>
          <Button className="w-full" onClick={finishJourney}>{completedAddress ? 'Generate property report' : 'Continue to your account'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Header /><main className="site-main container mx-auto px-4 py-16 flex-grow">
    <PageHero eyebrow="Secure checkout" illustration="simple"><h1 className="site-page-heading">{sessionId ? 'Confirming your payment' : 'Your next property decision starts here.'}</h1><p>{sessionId ? 'We verify your payment before unlocking access.' : 'Review your selected report or membership before continuing to payment.'}</p></PageHero>
    <div className="payment-summary-panel max-w-xl mx-auto border rounded-2xl p-8 space-y-6 bg-card">
      <h2 className="text-2xl font-bold">{sessionId ? 'Payment status' : PLANS[plan].name}</h2>
      {!sessionId && <>
        <p className="text-4xl font-bold">
          {plan === 'report' && promoDiscount
            ? `£${(Math.round(PLANS.report.amount * (100 - promoDiscount) / 100) / 100).toFixed(2)}`
            : PLANS[plan].price}
          <span className="text-base font-normal">{plan === 'report' ? ' for one property' : ' / month'}</span>
        </p>
        {plan === 'report' && promoDiscount > 0 && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700">{promoDiscount}% discount code applied. Standard price £9.99.</p>}
        {plan === 'report' ? <><p>Payment unlocks a report for this property only. Each different property requires a separate £9.99 payment before generation. You can return to your purchased property without paying again.</p><p className="font-semibold">{address ? `${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}` : 'Choose a property to continue.'}</p></> : <p>Monthly subscription with unlimited property reports. Renews monthly until cancelled. Manage billing and cancellation from your profile. Existing members can review a plan change in Stripe: upgrades are prorated, downgrades take effect at the next renewal, and cancellation ends renewal while retaining access through the paid period.</p>}
      </>}
      {!sessionId && <p className="text-sm text-muted-foreground leading-relaxed">Your report brings together available public-source records. Coverage varies by property and provider, and incomplete checks are identified. Licensed radon, mining and ground-stability searches are not included.</p>}
      {params.has('cancelled') && <p>Checkout was cancelled. No new report has been generated.</p>}
      {billingStatus?.testMode && !billingStatus.developmentSimulation && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-semibold">Stripe test mode</p><p>No real money is charged. Test purchases and memberships are separate from live access.</p></div>}
      {billingStatus?.developmentSimulation ? (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Local payment simulation</p>
          <p className="mt-1">Stripe is disabled. Continuing will simulate a successful payment and unlock only this property so you can test the complete customer journey.</p>
        </div>
      ) : billingStatus && !billingStatus.available ? (
        <p role="status">Payments are not available yet. Please try again later or <Link className="underline" to="/contact">contact support</Link>.</p>
      ) : null}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {loading ? <p>Loading account…</p> : !user ? <LoginDialog trigger={<Button>Sign in to continue</Button>} /> : sessionId ? <Button disabled={busy || !available} onClick={verify}>{busy ? 'Checking payment…' : 'Check payment again'}</Button> : plan === 'report' && !address ? <Button asChild><Link to="/tool">Choose property</Link></Button> : <Button disabled={busy || !canCheckout} onClick={checkout}>{busy ? 'Processing…' : billingStatus?.developmentSimulation ? 'Simulate successful payment' : 'Continue to secure payment'}</Button>}
      <p className="text-sm text-muted-foreground"><Link className="underline" to="/terms">Terms of service</Link> · <Link className="underline" to="/privacy">Privacy policy</Link></p>
    </div>
  </main><Footer /></div>;
}
