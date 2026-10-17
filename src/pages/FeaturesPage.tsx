import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Zap, Shield, ClipboardList, Landmark, Waves, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const features = [
  { icon: Landmark, title: 'Sold prices & tenure', what: 'Available recorded transactions, prices and tenure information from HM Land Registry Price Paid Data.', why: 'Compare the property with its recorded history and recent sales on the same street.', consider: 'Price Paid Data covers England and Wales, can be revised and does not include every type of transaction.' },
  { icon: Zap, title: 'Energy performance (EPC)', what: 'Current and potential energy ratings, estimated costs and recommended improvements where a certificate is available.', why: 'Understand the recorded energy profile and questions to raise about running costs or improvements.', consider: 'A certificate is a dated assessment, not a guarantee of current condition or future bills.' },
  { icon: Landmark, title: 'Council tax', what: 'An exact official VOA valuation band and the published standard annual charge where both can be confirmed.', why: 'Check a significant household cost before making a commitment.', consider: 'The checker currently uses the VOA service for England and Wales. Discounts, exemptions, parish charges and account adjustments can change the bill.' },
  { icon: ClipboardList, title: 'Planning applications', what: 'Matching applications from connected planning sources at the property, on the street and—when enabled for business users—within 0.3 miles.', why: 'Spot nearby proposals or earlier works that may deserve closer investigation.', consider: 'This is not a complete local-authority planning search. Follow the source link and check the council portal.' },
  { icon: Waves, title: 'Flood information', what: 'Available river, sea, surface-water and live warning information from connected Environment Agency datasets.', why: 'Identify environmental questions to discuss with an insurer, surveyor or conveyancer.', consider: 'Map results and warnings are screening information, not a property-specific commercial flood search.' },
  { icon: Shield, title: 'Crime & local context', what: 'Published Police.uk incidents, nearby schools and available inspection information, plus NHS directory entries.', why: 'Build a broader picture of the area around the address.', consider: 'Police locations are anonymised and approximate. Admissions, inspection status and NHS registration must be confirmed directly.' },
  { icon: Zap, title: 'Broadband & mobile', what: 'Available Ofcom broadband estimates and voice, 4G and 5G coverage predictions.', why: 'Research whether the property is likely to suit home-working and everyday connectivity needs.', consider: 'Predictions are not guarantees. Building materials, provider, network load and installation can affect service.' },
  { icon: Search, title: 'Report summary', what: 'A concise summary brings the returned records and important limitations together.', why: 'Use it as a starting point for questions when speaking to the seller or your property professionals.', consider: 'AI-generated wording can be wrong and never replaces the underlying source records or professional advice.' },
  { icon: Shield, title: 'Photo observations', what: 'Business members can upload property photos for AI-generated observations about visible features.', why: 'Create a consistent list of visible items to inspect or discuss.', consider: 'Photo observations are not a condition survey, structural survey, diagnosis or valuation.' },
];

export default function FeaturesPage() {
  return <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="site-main container mx-auto px-4 py-20 flex-grow">
      <PageHero eyebrow="Inside a UKHomePack report" illustration="report">
        <h1 className="site-page-heading text-4xl font-extrabold tracking-tight mb-4">What’s included in a UK property report</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Understand what each property check shows, why it may matter and what still needs independent verification.</p>
      </PageHero>
      <div className="page-feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{features.map(feature => <FeatureCard key={feature.title} {...feature} />)}</div>
      <section className="mt-14 rounded-2xl border bg-muted/20 p-6 md:p-8" aria-labelledby="coverage-heading">
        <div className="flex items-start gap-3"><AlertCircle className="mt-1 h-6 w-6 shrink-0 text-primary" /><div><h2 id="coverage-heading" className="text-2xl font-bold">Data coverage and important gaps</h2><p className="mt-2 text-muted-foreground">UKHomePack reports the latest records returned by the connected sources at the time of generation. “Not available” means we could not confirm the record; it does not mean the issue or feature does not exist.</p></div></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Coverage title="England and Wales" text="HM Land Registry Price Paid Data and the VOA council tax checker used by UKHomePack cover England and Wales." />
          <Coverage title="Source-specific limitations" text="Planning coverage varies by council and connected provider. Police.uk locations are approximate. Ofcom connectivity data is predictive." />
          <Coverage title="Records can lag" text="Completed sales, planning decisions, EPCs and other public records may appear after the real-world event or later be corrected." />
          <Coverage title="Professional checks still matter" text="A report is not a survey, valuation, conveyancing search, title check, environmental search, insurance decision or legal advice." />
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/sample" className="inline-flex items-center gap-2 font-semibold text-primary">View the sample report <ArrowRight className="h-4 w-4" /></Link><Link to="/tool" className="inline-flex items-center gap-2 font-semibold text-primary">Research an address <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </main><Footer />
  </div>;
}

function FeatureCard({ icon: Icon, title, what, why, consider }: { icon: React.ComponentType<{ className?: string }>, title: string, what: string, why: string, consider: string }) {
  return <Card className="border-border bg-card hover:shadow-lg transition-shadow h-full"><CardHeader><div className="page-feature-icon"><Icon className="h-8 w-8 text-primary" /></div><CardTitle className="text-xl">{title}</CardTitle></CardHeader><CardContent className="space-y-4 text-sm leading-relaxed"><div><h3 className="font-semibold">What the report shows</h3><p className="mt-1 text-muted-foreground">{what}</p></div><div><h3 className="font-semibold">Why it may matter</h3><p className="mt-1 text-muted-foreground">{why}</p></div><div className="rounded-lg bg-muted/50 p-3"><h3 className="font-semibold">What to consider</h3><p className="mt-1 text-muted-foreground">{consider}</p></div></CardContent></Card>;
}

function Coverage({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border bg-background p-4"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}
