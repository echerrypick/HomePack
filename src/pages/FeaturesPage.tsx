import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Zap, Shield, ClipboardList, Landmark, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-20 flex-grow">
        <PageHero eyebrow="Inside your HomePack" illustration="report">
          <h1 className="site-page-heading text-4xl font-extrabold tracking-tight mb-4">Property information for buyers, sellers and professionals</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Explore available property records, local services and potential risks in one place. Coverage varies by location and data source.</p>
        </PageHero>

        <div className="page-feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={<Landmark className="h-8 w-8 text-primary" />} title="Council Tax" description="Available valuation bands and annual charges, with source and tax-year information." />
          <FeatureCard icon={<Search className="h-8 w-8 text-primary" />} title="Schools & Healthcare" description="Nearby schools and available inspection records, plus NHS provider information. Confirm school admissions and patient registration directly." />
          <FeatureCard icon={<Zap className="h-8 w-8 text-primary" />} title="Broadband & Mobile" description="Available broadband speed estimates and mobile coverage predictions. Actual availability and performance may differ." />
          <FeatureCard icon={<Shield className="h-8 w-8 text-primary" />} title="Crime & Environment" description="Published Police.uk records and available radon and coal-mining information, with missing data clearly identified." />
          <FeatureCard 
            icon={<Landmark className="h-8 w-8 text-primary" />}
            title="Land Registry Integration"
            description="Explore available recorded transactions, prices and tenure information from HM Land Registry."
          />
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Energy Performance (EPC)"
            description="View current and potential energy ratings, estimated costs, and recommended improvements where a certificate is available."
          />
          <FeatureCard 
            icon={<Waves className="h-8 w-8 text-primary" />}
            title="Flood Risk Assessment"
            description="Get detailed flood risk data from rivers, sea, and surface water to understand environmental vulnerabilities."
          />
          <FeatureCard 
            icon={<ClipboardList className="h-8 w-8 text-primary" />}
            title="Planning History"
            description="Track past planning applications, decisions, and references to see how a property has evolved over time."
          />
          <FeatureCard 
            icon={<Search className="h-8 w-8 text-primary" />}
            title="AI-Powered Summaries"
            description="Our advanced AI analyses all data points to provide a concise, easy-to-read summary of the property's key facts."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Condition Reports"
            description="Upload property photos and get AI-generated condition reports to identify potential maintenance issues."
          />
        </div>
        <p className="mt-10 text-muted-foreground">Reports use the latest available records, which may lag current conditions. Source coverage varies across the UK. AI photo observations are available to business subscribers and do not replace a professional survey. Agency White-Label adds custom report branding.</p>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <div className="page-feature-icon">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
