import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-20 max-w-4xl flex-grow">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: April 1, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p>Welcome to HomePack UK. We are committed to protecting your personal data and your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Data We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, search for property data, or contact us for support. This may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information (email address)</li>
              <li>Account credentials</li>
              <li>Property search history</li>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
