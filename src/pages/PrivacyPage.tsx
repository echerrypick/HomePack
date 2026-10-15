import { ShieldCheck } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-20 max-w-4xl flex-grow">
        <PageHero eyebrow="Your information, explained" illustration="simple" icon={<ShieldCheck />}><h1 className="site-page-heading">Privacy Policy</h1><p>How we handle account, payment and property-report information.</p></PageHero>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: 26 September 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p>Welcome to UKHomePack.com. We are committed to protecting your personal data and your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Data We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, search for property data, or contact us for support. This may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information (email address)</li>
              <li>Account credentials</li>
              <li>Property search history</li>
              <li>Optional phone number, company, professional profile and agency branding</li>
              <li>Property photos you submit for AI condition observations</li>
              <li>Payment information (processed by third-party providers)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Data</h2>
            <p>We use your data to provide and improve our services, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generating property reports</li>
              <li>Managing your account and search history</li>
              <li>Processing payments</li>
              <li>Communicating with you about your account or our services</li>
              <li>Ensuring the security and integrity of our platform</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Data Sharing</h2>
            <p>We do not sell your personal data to third parties. We may share your information with service providers who assist us in operating our platform, such as payment processors and data hosting services, or when required by law.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You can manage your account information through your profile page or contact us for assistance.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data from unauthorized access, loss, or alteration. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us through our <Link to="/contact" className="text-primary hover:underline">Contact Page</Link>.</p>
          </section>
          <section className="space-y-4"><h2 className="text-2xl font-bold text-foreground">Service providers and AI processing</h2>
            <p>Google Firebase provides account authentication and profile storage. Stripe processes checkout and subscription payments; UKHomePack.com does not receive your full card number. Property queries are sent to relevant data providers. Report content and uploaded photos may be processed by configured AI providers, including Google Gemini, Groq and OpenRouter. Avoid including people, personal documents or unnecessary personal information in uploaded photos.</p>
          </section>
          <section className="space-y-4"><h2 className="text-2xl font-bold text-foreground">Purpose, storage and retention</h2>
            <p>Account, payment, promotional-code redemption and report information is used to provide the service you request. We also use operational records for security, support and resolving billing disputes. We retain account details and purchased property access while your account remains open. You can request deletion by emailing support@ukhomepack.com; records needed for legal, accounting or dispute purposes may need to be retained.</p>
            <p>Completed reports are stored securely in your Firebase account history and can be reopened on another device after signing in. The latest report replaces the previous version for the same property and planning scope. Report bodies are compressed; temporary generation records support troubleshooting and recovery. Authentication uses browser storage. Older reports previously stored only in your browser remain on that device until its storage is cleared. Download PDFs if you need to retain a particular report version.</p>
          </section>
          <section className="space-y-4"><h2 className="text-2xl font-bold text-foreground">Privacy requests and complaints</h2>
            <p>Email support@ukhomepack.com to request access, correction, deletion, restriction or portability of your personal data, or to object to processing. We may need to verify your identity. Where processing relies on consent, you can withdraw it. You can also raise a complaint with the <a className="text-primary underline" href="https://ico.org.uk/make-a-complaint/">Information Commissioner's Office</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
