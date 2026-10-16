import { FileText } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-20 max-w-4xl flex-grow">
        <PageHero eyebrow="Using UKHomePack" illustration="simple" icon={<FileText />}><h1 className="site-page-heading">Terms of Service</h1><p>Understand report access, payments, subscriptions and the limits of the service.</p></PageHero>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: 17 October 2026</p>
          <section className="space-y-4"><h2 className="text-2xl font-bold text-foreground">Plans, payments and access</h2>
            <p>Retail costs £9.99 for one property report and PDF. Each different property requires a separate payment before generation. Access is tied to the complete address, including any flat or unit identifier. Returning to that purchased property does not require another payment.</p>
            <p>Business costs £49 per month and Business Plus costs £79 per month. Both include unlimited property reports while the subscription is active. Business Plus adds your own report branding for one account; team seats are not included.</p>
            <p>Subscriptions renew monthly until cancelled. Use Manage billing and cancellation in your profile to view invoices, update payment details or cancel. Cancellation stops future renewals; access continues until the paid period ends unless the payment is refunded or reversed.</p>
            <p>Plan changes are confirmed in Stripe before taking effect. Upgrades are prorated; downgrades take effect at the next renewal.</p>
            <p>Offer codes are single use unless expressly stated otherwise and apply only to the products identified with the offer. A complimentary Retail code becomes tied to the complete property address when redeemed. A percentage code for Retail becomes tied to that address when checkout starts. A percentage code for Business or Business Plus applies to the first monthly payment of a new membership; subsequent renewals are charged at the standard monthly price. A code is void once the relevant discounted payment completes. Codes have no cash value and cannot be combined.</p>
            <p>Payments are processed through Stripe. Access is granted only after payment is verified. If report generation fails, you can retry the same purchased property without another charge. Use our <Link to="/contact" className="text-primary hover:underline">Contact Page</Link> about failed delivery, duplicate payments, cancellation or a refund. Your statutory consumer rights are unaffected.</p>
            <p>Newly completed reports are saved to your account and can be reopened on another device after signing in. Regeneration replaces the previously saved version for the same property and planning scope. Download a PDF to retain a specific version. Older reports saved only in your browser remain local to that device. Purchased report access is recorded in your account while it remains open.</p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using UKHomePack.com, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using this site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
            <p>You may download and retain purchased reports for your own property decisions. Business subscribers may use reports in their professional work and share them with clients. Business Plus subscribers may apply their own branding, while retaining source attribution and report limitations. You must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Misrepresent a report as an official title document, valuation or professional survey;</li>
              <li>Resell bulk source datasets or use the service to bypass third-party licensing restrictions;</li>
              <li>Attempt to decompile or reverse engineer any software contained on UKHomePack.com's website;</li>
              <li>Remove source attribution or material limitations from reports; or</li>
              <li>Share account credentials or interfere with the operation of the service.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Disclaimer</h2>
            <p>The materials on UKHomePack.com's website are provided on an 'as is' basis. UKHomePack.com makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Limitations</h2>
            <p>Reports support initial research and do not replace conveyancing searches, a valuation, legal advice or a professional building survey. AI observations can be incomplete or incorrect. Nothing in these terms excludes liability or consumer rights that cannot lawfully be excluded.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Accuracy of Materials</h2>
            <p>Reports use the latest available source records at retrieval time. Publication delays, missing records and geographic differences can limit coverage. A missing result is not evidence that a property has no risk. Check source dates and verify significant findings with the relevant authority or professional. Saved reports do not automatically update.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Links</h2>
            <p>UKHomePack.com has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by UKHomePack.com of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">7. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-bold text-foreground">8. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us through our <Link to="/contact" className="text-primary hover:underline">Contact Page</Link>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
