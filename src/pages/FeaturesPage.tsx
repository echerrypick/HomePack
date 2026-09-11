import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Zap, Shield, ClipboardList, Landmark, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Powerful Features for Property Professionals</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to understand a property's history, value, and risks in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Landmark className="h-8 w-8 text-primary" />}
            title="Land Registry Integration"
            description="Access full sales history, price paid data, and tenure information directly from the official UK Land Registry."
          />
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Energy Performance (EPC)"
            description="View current and potential energy ratings, estimated costs, and recommended improvements for any property."
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
            description="Our advanced AI analyzes all data points to provide a concise, easy-to-read summary of the property's key facts."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Condition Reports"
            description="Upload property photos and get AI-generated condition reports to identify potential maintenance issues."
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
