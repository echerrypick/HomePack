import { PageHero } from '@/components/layout/PageHero';
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, Download, Building2, Sparkles, ShieldCheck, ArrowRight, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSubscriptionPlan } from '../firebase';
import { toast } from 'sonner';
import { PLANS } from '@/lib/plans';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isUpdatingTier, setIsUpdatingTier] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'consumer' | 'business'>('all');

  const handleActivatePlan = async (role: 'free' | 'subscription' | 'agency', accountType: 'consumer' | 'business') => {
    navigate(`/payment?plan=${role === 'free' ? 'report' : role}`);
  };

  const plans = [
    {
      id: "b2c",
      category: "consumer" as const,
      badge: "Retail",
      badgeColor: "bg-emerald-600 hover:bg-emerald-600 text-white",
      title: "Retail",
      price: PLANS.report.price,
      period: "/ property",
      description: "One property report and PDF download. Each different property requires a new £9.99 payment before generation.",
      targetAudience: "Homebuyers, private sellers, and property investors wanting deep due diligence on a specific home.",
      features: [
        "One property per payment — no monthly subscription",
        "Full multi-section due diligence PDF dossier",
        "HM Land Registry price paid history & tenure",
        "Available EPC ratings, estimated costs & CO₂ emissions",
        "Environment Agency flood risk assessment & warnings",
        "Property and same-street planning applications",
        "Nearby schools & available inspection information",
        "Available broadband speed estimates & mobile coverage"
      ],
      buttonText: "Search & Buy Single Report (£9.99)",
      buttonAction: () => navigate('/tool'),
      isPopular: false,
      icon: Download
    },
    {
      id: "b2b_pro",
      category: "business" as const,
      badge: "Business membership",
      badgeColor: "bg-primary/10 text-primary",
      title: "Business",
      price: PLANS.subscription.price,
      period: "/ month",
      description: "Unlimited property reports for estate agents and mortgage brokers using the latest available source data.",
      targetAudience: "Estate agents, mortgage brokers, conveyancers, and surveyors managing active client pipelines.",
      features: [
        "Unlimited property searches & online reports",
        "PDF downloads included",
        "Available Land Registry recorded transactions",
        "Detailed EPC energy breakdown & savings pathway",
        "Optional all-planning search within 0.3 miles",
        "AI photo condition observations (not a structural survey)",
        "Search History Log with instant re-download",
        "Latest available data, subject to source coverage"
      ],
      buttonText: profile?.role === 'subscription' ? 'Current Active Plan' : profile?.stripeSubscriptionId ? 'Downgrade to Business (£49/mo)' : 'Subscribe to Business (£49/mo)',
      buttonAction: () => handleActivatePlan('subscription', 'business'),
      isCurrent: profile?.role === 'subscription',
      isPopular: true,
      icon: Building2
    },
    {
      id: "b2b_agency",
      category: "business" as const,
      badge: "Business Plus membership",
      badgeColor: "bg-primary/10 text-primary",
      title: "Business Plus",
      price: PLANS.agency.price,
      period: "/ month",
      description: "Reports with your agency branding. Upload your agency logo, custom colour palette, and agent bio for client-ready presentation.",
      targetAudience: "Established estate agencies, brokerages, and property firms delivering branded reports to clients.",
      features: [
        "Everything included in Business",
        "Custom agency logo on the PDF cover",
        "Custom Brand Colours (Primary & Accent palette match)",
        "Agent Bio, direct phone, email & website sign-off",
        "Client-facing branded presentation mode",
        "Uses your agency branding on client deliverables",
        "Single account with saved agency branding",
        "Email support"
      ],
      buttonText: profile?.role === 'agency' ? 'Current Active Plan' : profile?.stripeSubscriptionId ? 'Upgrade to Business Plus (£79/mo)' : 'Choose Business Plus (£79/mo)',
      buttonAction: () => handleActivatePlan('agency', 'business'),
      isCurrent: profile?.role === 'agency',
      isPopular: false,
      icon: Palette
    }
  ];

  const filteredPlans = filterType === 'all' 
    ? plans 
    : plans.filter(p => p.category === filterType);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-16 flex-grow">
        {/* Header section */}
        <PageHero eyebrow="Simple pricing. Clear choices." illustration="report">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/20">
            Tailored For Consumers & Businesses
          </Badge>
          <h1 className="site-page-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 font-sans text-primary dark:text-foreground">
            UK property report pricing for buyers and professionals
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose Retail for a one-off property report, Business for unlimited reports, or Business Plus to add your company branding.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-8 bg-muted/60 p-1.5 rounded-xl max-w-md mx-auto border border-border">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all",
                filterType === 'all' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Plans
            </button>
            <button
              onClick={() => setFilterType('consumer')}
              className={cn(
                "flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all",
                filterType === 'consumer' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Retail
            </button>
            <button
              onClick={() => setFilterType('business')}
              className={cn(
                "flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all",
                filterType === 'business' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Business
            </button>
          </div>
        </PageHero>

        <section className="mx-auto mb-8 grid max-w-5xl gap-5 md:grid-cols-2" aria-label="Choose the right property report plan">
          <div className="rounded-2xl border bg-card p-6"><h2 className="text-xl font-bold">Buying or selling one property?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose Retail for one address, one payment and a downloadable report. There is no recurring subscription.</p><button onClick={() => setFilterType('consumer')} className="mt-4 font-semibold text-primary">View the £9.99 Retail report →</button></div>
          <div className="rounded-2xl border bg-card p-6"><h2 className="text-xl font-bold">Researching property for clients?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose Business for regular reports, or Business Plus when client-facing PDFs need your company branding.</p><button onClick={() => setFilterType('business')} className="mt-4 font-semibold text-primary">Compare £49 and £79 business plans →</button></div>
        </section>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Reports bring together available public-source records. Coverage varies by property and provider; incomplete checks are identified. Licensed radon, mining and ground-stability searches are not included.</p>
        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-7xl mx-auto pt-8 pb-12 items-stretch">
          {filteredPlans.map((plan, index) => {
            const Icon = plan.icon;
            const isHighlighted = hoveredIndex === null ? plan.isPopular : hoveredIndex === index;
            const isCurrent = plan.isCurrent;

            return (
              <Card
                key={plan.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "border bg-card flex flex-col relative overflow-visible transition-all duration-300 rounded-2xl",
                  isHighlighted 
                    ? "border-primary ring-2 ring-primary/20 shadow-lg z-20"
                    : "border-border shadow-sm scale-100 z-10"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-primary text-primary-foreground text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md z-30 uppercase tracking-wider">
                    Most Popular for Agents
                  </div>
                )}

                <CardHeader className="pt-6 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn("text-xs font-semibold", plan.badgeColor)}>
                      {plan.badge}
                    </Badge>
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold font-sans text-primary dark:text-foreground mt-2">
                    {plan.title}
                  </CardTitle>
                  
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>

                <div className="px-6 py-2">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Best for: </span>
                    {plan.targetAudience}
                  </div>
                </div>

                <CardContent className="flex-grow pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    What's included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 pb-6">
                  <Button
                    onClick={plan.buttonAction}
                    disabled={isUpdatingTier === plan.id || isCurrent}
                    variant={isHighlighted ? "default" : "outline"}
                    className={cn(
                      "w-full min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold transition-all duration-200 rounded-xl",
                      isHighlighted && "shadow-md",
                      plan.id === 'b2c' && "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"
                    )}
                  >
                    {isUpdatingTier === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : isCurrent ? (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                        Active Plan
                      </>
                    ) : (
                      <>
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* B2B White Label Feature Highlight Card */}
        <div className="max-w-5xl mx-auto mt-6 p-8 bg-[#f8fafc] dark:bg-slate-900/50 border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary font-semibold">Company branding</Badge>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Business Plus · £79/month</span>
              </div>
              <h3 className="text-xl font-bold font-sans text-primary dark:text-foreground">
                Present UK Property HomePack Reports in your agency's branding
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Upload your agency logo, match your firm's exact brand colours, and present your bio and direct contact links across your PDF reports.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button asChild variant="outline" className="border-purple-300 dark:border-purple-800">
                <Link to="/profile">Manage Branding</Link>
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={() => handleActivatePlan('agency', 'business')}
                disabled={profile?.role === 'agency'}
              >
                {profile?.role === 'agency' ? 'Active' : 'Upgrade to Business Plus'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
