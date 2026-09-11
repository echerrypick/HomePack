import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plans = [
    {
      title: "Free",
      price: "£0",
      description: "Perfect for individual homebuyers.",
      features: [
        "Basic Summary Property Data",
        "1 property on account per year",
        "Current EPC rating",
        "Flood risk summary"
      ],
      buttonText: "Get Started",
      buttonLink: "/tool"
    },
    {
      title: "Subscription",
      price: "£29",
      period: "/ month",
      description: "Ideal for active property seekers.",
      features: [
        "Detail property data",
        "5 properties on account per year",
        "Full Land Registry history",
        "Detailed EPC reports",
        "Full planning history",
        "AI Condition Reports"
      ],
      buttonText: "Subscribe Now",
      buttonLink: "/tool",
      isPopular: true
    },
    {
      title: "Agency",
      price: "£149",
      period: "/ month",
      description: "For professional real estate agencies.",
      features: [
        "All data",
        "Unlimited properties on account per year",
        "Everything in Subscription",
        "Team access (up to 5 users)",
        "White-label PDF reports"
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the plan that's right for you. From free basic reports to full agency solutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto pt-24 pb-12 overflow-visible">
          {plans.map((plan, index) => (
            <PricingCard 
              key={index}
              {...plan}
              isHighlighted={hoveredIndex === null ? plan.isPopular : hoveredIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  period = "", 
  description, 
  features, 
  buttonText, 
  buttonLink,
  isPopular = false,
  isHighlighted = false,
  onHover,
  onLeave
}: { 
  title: string, 
  price: string, 
  period?: string, 
  description: string, 
  features: string[], 
  buttonText: string, 
  buttonLink: string,
  isPopular?: boolean,
  isHighlighted?: boolean,
  onHover: () => void,
  onLeave: () => void
}) {
  return (
    <Card 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "border-border bg-card flex flex-col relative transition-all duration-300 overflow-visible",
        isHighlighted 
          ? "border-primary ring-2 ring-primary/20 scale-105 z-20 shadow-xl" 
          : "scale-100 z-10 opacity-90 grayscale-[0.2]"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md z-40 whitespace-nowrap">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground text-sm">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          variant={isHighlighted ? "default" : "outline"} 
          className={cn(
            "w-full h-11 text-base transition-all duration-300",
            isHighlighted && "shadow-md"
          )}
        >
          <Link to={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
