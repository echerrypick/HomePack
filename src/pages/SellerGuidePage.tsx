import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, FileText, Info, Lightbulb, ListChecks, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="site-main container mx-auto px-4 py-12 max-w-4xl flex-grow">
        <PageHero eyebrow="Prepare for your next chapter" illustration="property" icon={<Home />}>
          <h1 className="site-page-heading text-4xl font-extrabold tracking-tight mb-4">Preparing your house for sale: a practical UK checklist</h1>
          <p className="text-xl text-muted-foreground">A practical UK home seller guide to the TA6 form, EPC, supporting documents, conveyancing and preparing for buyer questions.</p>
        </PageHero>

        {/* TA6 Form Section */}
        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-6 w-6" />
              TA6 Property Information Form (6th Edition, 2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              As a seller, the <strong>TA6 Property Information Form</strong> is one of the most important documents you will complete. It provides the buyer with detailed information about your property, ensuring transparency and reducing the risk of the sale falling through later.
            </p>
            <div className="bg-background/80 p-4 rounded-lg border border-primary/10">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                TA6 guidance for new instructions
              </h4>
              <p className="text-sm text-muted-foreground">
                The TA6 (6th edition, 2025) is required for Conveyancing Quality Scheme (CQS) firms on new transactions where the solicitor is instructed on or after <strong>30 March 2026</strong>. Earlier transactions that already used an older edition may continue with it. Ask your conveyancer which documents apply to your sale.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild variant="default">
                <a
                  href="https://www.lawsociety.org.uk/topics/property/transaction-forms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Read current TA6 guidance
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Seller Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Seller's Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Choose an estate agent or online platform",
                  "Get an up-to-date EPC (Energy Performance Certificate)",
                  "Gather all property documents (Title deeds, Guarantees)",
                  "Complete the TA6 and TA10 (Fittings & Contents) forms",
                  "Instruct a conveyancing solicitor early",
                  "Declutter and 'stage' your home for photos",
                  "Fix minor repairs (leaky taps, cracked tiles)",
                  "Identify your next move (buying or renting)",
                  "Review and negotiate offers",
                  "Prepare for the buyer's structural survey"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Top Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Top Tips for Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="space-y-1">
                  <p className="font-semibold text-sm">First impressions count</p>
                  <p className="text-xs text-muted-foreground">The 'kerb appeal' is vital. Ensure the front garden is tidy and the front door looks fresh.</p>
                </li>
                <li className="space-y-1">
                  <p className="font-semibold text-sm">Be honest on the TA6</p>
                  <p className="text-xs text-muted-foreground">Disclose everything. Hiding issues can lead to legal claims or the sale collapsing at the last minute.</p>
                </li>
                <li className="space-y-1">
                  <p className="font-semibold text-sm">Neutralize your space</p>
                  <p className="text-xs text-muted-foreground">Buyers need to imagine themselves living there. Remove excess personal items and bold decor.</p>
                </li>
                <li className="space-y-1">
                  <p className="font-semibold text-sm">Provide a UK Property HomePack Report</p>
                  <p className="text-xs text-muted-foreground">Giving buyers upfront information (like our reports) builds trust and speeds up the process.</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        {/* Useful Resources */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Useful Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResourceLink
              title="GOV.UK: Selling a Home"
              url="https://www.gov.uk/sell-residential-property"
              description="Official government guidance on the legal steps to selling."
            />
            <ResourceLink
              title="The Law Society: Selling a House"
              url="https://www.lawsociety.org.uk/public/for-public-visitors/common-legal-issues/selling-a-house"
              description="Legal advice and what to expect from your solicitor."
            />
            <ResourceLink
              title="HomeOwners Alliance: Selling"
              url="https://hoa.org.uk/advice/guides-for-homeowners/for-sellers/"
              description="Independent advice on agents, valuations, and costs."
            />
            <ResourceLink
              title="EPC Register"
              url="https://www.gov.uk/find-energy-certificate"
              description="Check if you have a valid EPC or find an assessor."
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ResourceLink({ title, url, description }: { title: string, url: string, description: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colours">{title}</h3>
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </a>
  );
}
