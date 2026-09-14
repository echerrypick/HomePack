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

export default function PricingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isUpdatingTier, setIsUpdatingTier] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'consumer' | 'business'>('all');

  const handleActivatePlan = async (role: 'free' | 'subscription' | 'agency', accountType: 'consumer' | 'business') => {
    if (!user) {
      navigate('/tool');
      return;
    }
    setIsUpdatingTier(role);
    try {
      await updateUserSubscriptionPlan(user.uid, role, accountType);
      toast.success(`Plan updated to ${role === 'agency' ? 'B2B White-Label' : role === 'subscription' ? 'B2B Pro' : 'Free Preview'} successfully!`);
      navigate('/profile');
    } catch (e: any) {
      toast.error(e.message || 'Could not update subscription plan');
    } finally {
      setIsUpdatingTier(null);
    }
  };

  const plans = [
    {
      id: "b2c",
      category: "consumer" as const,
      badge: "Direct-to-Consumer (B2C)",
      badgeColor: "bg-emerald-600 hover:bg-emerald-600 text-white",
      title: "Pay-As-You-Go Report",
      price: "£9.99",
      period: "/ report",
      description: "Direct single PDF download via our fast search tool. Ideal for buyers, sellers, and individual property investors.",
      targetAudience: "Homebuyers, private sellers, and property investors wanting deep due diligence on a specific home.",
      features: [
        "Instant one-off download — no monthly subscription",
        "Full 9-page due diligence PDF dossier",
        "HM Land Registry price paid history & tenure",
        "Official EPC efficiency & verified heating/CO2 costs",
        "Environment Agency flood risk assessment & warnings",
        "Local planning applications & historic decisions",
        "Catchment schools & verified Ofsted inspection ratings",
        "Ofcom broadband speed test data & mobile signals"
      ],
      buttonText: "Search & Buy Single Report (£9.99)",
      buttonAction: () => navigate('/tool'),
      isPopular: false,
      icon: Download
    },
    {
      id: "b2b_pro",
      category: "business" as const,
      badge: "B2B Software Subscription",
      badgeColor: "bg-blue-600 hover:bg-blue-600 text-white",
      title: "B2B Pro",
      price: "£29",
      period: "/ month",
      description: "Unlimited searches and instant report generation packaged as an essential tool for estate agents and mortgage brokers.",
      targetAudience: "Estate agents, mortgage brokers, conveyancers, and surveyors managing active client pipelines.",
      features: [
        "Unlimited property searches & online reports",
        "Token-free instant report generation",
        "Full Land Registry historical transaction archive",
        "Detailed EPC energy breakdown & savings pathway",
        "Complete local planning register & decisions",
        "AI Condition & Surveyor structural assessment",
        "Search History Log with instant re-download",
        "Priority live data feeds"
      ],
      buttonText: profile?.role === 'subscription' ? 'Current Active Plan' : 'Subscribe to B2B Pro (£29/mo)',
      buttonAction: () => handleActivatePlan('subscription', 'business'),
      isCurrent: profile?.role === 'subscription',
      isPopular: true,
      icon: Building2
    },
    {
      id: "b2b_agency",
      category: "business" as const,
      badge: "White-Labelling Enterprise",
      badgeColor: "bg-purple-600 hover:bg-purple-600 text-white",
      title: "Agency White-Label",
      price: "£49",
      period: "/ month",
      description: "Full white-label SaaS suite. Upload your agency logo, custom color palette, and agent bio for client-ready presentation.",
      targetAudience: "Established estate agencies, brokerages, and property firms delivering branded reports to clients.",
      features: [
        "Everything included in B2B Pro tier",
        "Custom Agency Logo on cover & all 9 PDF pages",
        "Custom Brand Colors (Primary & Accent palette match)",
        "Agent Bio, direct phone, email & website sign-off",
        "Client-facing branded presentation mode",
        "Removes HomePackAI watermarks on client deliverables",
        "Team multi-seat access (up to 5 agents)",
        "Dedicated phone & onboarding support"
      ],
      buttonText: profile?.role === 'agency' ? 'Current Active Plan' : 'Activate White-Label (£49/mo)',
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
      <main className="container mx-auto px-4 py-16 flex-grow">
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30">
            Tailored For Consumers & Businesses
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 font-serif text-[#2d4a77] dark:text-foreground">
            Clear, Transparent Property Intelligence
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you need a single deep-dive due diligence report on your dream home or a white-labelled SaaS subscription for your agency, we have the right tier for you.
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
              Regular Customers (B2C)
            </button>
            <button
              onClick={() => setFilterType('business')}
              className={cn(
                "flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all",
                filterType === 'business' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Businesses & Agents (B2B)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-6 pb-12 items-stretch">
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
                  "border bg-card flex flex-col relative transition-all duration-300 rounded-2xl",
                  isHighlighted 
                    ? "border-primary ring-2 ring-primary/20 shadow-xl scale-[1.02] z-20" 
                    : "border-border shadow-sm scale-100 z-10"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md z-30 uppercase tracking-wider">
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

                  <CardTitle className="text-2xl font-bold font-serif text-[#2d4a77] dark:text-foreground mt-2">
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
                      "w-full h-11 text-sm font-semibold transition-all duration-200 rounded-xl",
                      isHighlighted && "shadow-md",
                      plan.id === 'b2c' && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
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
        <div className="max-w-5xl mx-auto mt-6 p-8 bg-[#f8fafc] dark:bg-slate-900/50 border border-purple-200 dark:border-purple-900/40 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-600 text-white font-semibold">White-Label Feature</Badge>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">£49/month SaaS</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-[#2d4a77] dark:text-foreground">
                Turn HomePackAI into your firm's own bespoke property tool
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Upload your agency logo, match your firm's exact brand colors, and present your bio and direct contact links across all 9 pages of official PDF reports.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild variant="outline" className="border-purple-300 dark:border-purple-800">
                <Link to="/profile">Manage Branding</Link>
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                onClick={() => handleActivatePlan('agency', 'business')}
                disabled={profile?.role === 'agency'}
              >
                {profile?.role === 'agency' ? 'Active' : 'Upgrade to White-Label'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
