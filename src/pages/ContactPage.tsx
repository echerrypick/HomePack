import { PageHero } from '@/components/layout/PageHero';
import { Mail } from 'lucide-react';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return <div className="min-h-screen flex flex-col"><Header /><main className="site-main container mx-auto px-4 py-20 flex-grow max-w-3xl">
    <PageHero eyebrow="Here to help" illustration="simple" icon={<Mail />}><h1 className="site-page-heading">Contact UKHomePack.com</h1><p>For help with a report, billing, your account or a data correction, email our support team.</p></PageHero>
    <div className="contact-support-panel site-panel border rounded-2xl p-8 space-y-5">
      <h2 className="text-2xl font-semibold">Email support</h2>
      <a className="text-primary underline" href="mailto:support@ukhomepack.com">support@ukhomepack.com</a>
      <p>Include the report reference or property address if relevant. For billing questions, include your payment reference. Please do not send passwords or card details.</p>
      <Button asChild><a href="mailto:support@ukhomepack.com?subject=UKHomePack.com%20support">Open your email app</a></Button>
      <p className="text-sm text-muted-foreground">This opens a draft in your email app. Review and send it there. You can also copy the email address above.</p>
    </div>
  </main><Footer /></div>;
}
