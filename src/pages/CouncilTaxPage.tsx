import { PageHero } from '@/components/layout/PageHero';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Search, Home, MapPin, Loader2, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function CouncilTaxPage() {
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/check-band', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseNumber, street, postcode }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.result) {
        setResult(data.result);
      } else if (data.results && data.results.length > 0) {
        setResult({ results: data.results });
      } else {
        setError('No results found for this address. Please try with more details.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="site-main flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <PageHero eyebrow="Understand the running costs" icon={<Home />}><h1 className="site-page-heading">Council tax band checker by address</h1><p>Check the official VOA council tax band for an exact property address in England or Wales, with available local authority charges and source details.</p></PageHero>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-border"
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Check a property address</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter the complete address to check the official VOA Council Tax band. No estimated band will be substituted.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSearch}>
            <div className="space-y-4">
              <div>
                <label htmlFor="houseNumber" className="block text-sm font-medium text-slate-700 mb-1">
                  House Number / Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="houseNumber"
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary text-slate-900 sm:text-sm"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-slate-700 mb-1">
                  Street Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary text-slate-900 sm:text-sm"
                    placeholder="e.g. Downing Street"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-slate-700 mb-1">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="postcode"
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary text-slate-900 sm:text-sm uppercase"
                    placeholder="e.g. SW1A 2AA"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Check Band'
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3"
              >
                <span className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">
                  <Info className="h-5 w-5" />
                </span>
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-xl"
              >
                {result.results ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Multiple Results Found</h3>
                    <p className="text-xs text-slate-600 mb-2">The official lookup returned several properties. Refine the house number and street so an exact match can be confirmed.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {result.results.map((r: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                          <span className="text-xs text-slate-700 font-medium truncate mr-2">{r.address}</span>
                          <span className="text-sm font-bold text-primary bg-blue-50 px-2 py-1 rounded">Band {r.band}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Property Found</h3>
                    <p className="text-sm text-slate-700 font-medium">{result.address}</p>
                    <div className="mt-4 inline-block">
                      <span className="text-4xl font-black text-primary block">Band {result.band}</span>
                    </div>
                    <div className="mt-4 border-t border-blue-100 pt-4 text-sm text-slate-700">
                      <p><span className="font-semibold">Annual standard charge:</span> {result.annualAmount || 'Not available'}</p>
                      <p><span className="font-semibold">Billing authority:</span> {result.authority || 'Not confirmed'}</p>
                      <p><span className="font-semibold">Tax year:</span> {result.year || 'Not recorded'}</p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setResult(null)}
                  className="mt-6 w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
                >
                  New Search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <section className="mt-12 w-full max-w-5xl" aria-labelledby="council-tax-explained">
          <h2 id="council-tax-explained" className="text-3xl font-bold text-center">How council tax bands and charges work</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-muted-foreground">The valuation band and the amount billed are related, but they are not the same record. UKHomePack does not substitute a guessed band when an exact official match is unavailable.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <Explainer title="1. Confirm the band" text="The Valuation Office Agency maintains council tax bands for domestic properties in England and Wales. Enter the complete address so the exact official property can be matched." />
            <Explainer title="2. Match the annual charge" text="The billing authority publishes a standard charge for each band and financial year. The figure shown is the published standard amount where it can be matched." />
            <Explainer title="3. Check your actual bill" text="Discounts, exemptions, support, parish or local precepts and account adjustments can change what a household pays. Confirm the final amount with the council." />
          </div>
          <div className="mt-8 rounded-2xl border bg-muted/20 p-6">
            <h2 className="text-xl font-bold">Council tax questions</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <details className="rounded-xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Why might a charge be unavailable?</summary><p className="mt-2 text-sm text-muted-foreground">The band may be confirmed while the current authority, parish or published charge table cannot be matched reliably. We show “Not available” rather than an estimate.</p></details>
              <details className="rounded-xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Can a council tax band change?</summary><p className="mt-2 text-sm text-muted-foreground">Yes. Bands can be reviewed in specific circumstances. Use the official service to understand checks and challenges before taking action.</p></details>
              <details className="rounded-xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Does this checker cover Scotland or Northern Ireland?</summary><p className="mt-2 text-sm text-muted-foreground">No. This checker uses the VOA service for England and Wales. Scotland has its own valuation system, while Northern Ireland uses domestic rates.</p></details>
              <details className="rounded-xl border bg-background p-4"><summary className="cursor-pointer font-semibold">Is the displayed amount my final bill?</summary><p className="mt-2 text-sm text-muted-foreground">Not necessarily. It is the available standard annual charge before any household-specific discounts, exemptions, relief or account adjustments.</p></details>
            </div>
            <a href="https://www.gov.uk/council-tax-bands" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">Check official council tax guidance <ExternalLink className="h-4 w-4" /></a>
          </div>
        </section>
        <p className="mt-8 text-xs text-slate-400 text-center max-w-xl">Official band information is sourced from the VOA service. Published charge availability varies. This tool is for informational purposes only.</p>
      </main>

      <Footer />
    </div>
  );
}

function Explainer({ title, text }: { title: string; text: string }) {
  return <article className="rounded-2xl border bg-card p-5"><CheckCircle2 className="h-6 w-6 text-primary" /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></article>;
}
