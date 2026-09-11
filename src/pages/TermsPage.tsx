import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-20 max-w-4xl flex-grow">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">Last updated: April 1, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using HomePack UK, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using this site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on HomePack UK's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on HomePack UK's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Disclaimer</h2>
            <p>The materials on HomePack UK's website are provided on an 'as is' basis. HomePack UK makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Limitations</h2>
            <p>In no event shall HomePack UK or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HomePack UK's website, even if HomePack UK or a HomePack UK authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Accuracy of Materials</h2>
            <p>The materials appearing on HomePack UK's website could include technical, typographical, or photographic errors. HomePack UK does not warrant that any of the materials on its website are accurate, complete or current. HomePack UK may make changes to the materials contained on its website at any time without notice. However HomePack UK does not make any commitment to update the materials.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Links</h2>
            <p>HomePack UK has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by HomePack UK of the site. Use of any such linked website is at the user's own risk.</p>
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
