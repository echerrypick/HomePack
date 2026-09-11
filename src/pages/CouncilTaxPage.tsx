/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Search, Home, MapPin, Loader2, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Council Tax Band Checker
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter property details to find the UK Council Tax band.
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
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 sm:text-sm"
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
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 sm:text-sm"
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
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 sm:text-sm uppercase"
                    placeholder="e.g. SW1A 2AA"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    <p className="text-xs text-slate-600 mb-2">We found several properties in this postcode. Please select yours or refine your search.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {result.results.map((r: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                          <span className="text-xs text-slate-700 font-medium truncate mr-2">{r.address}</span>
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Band {r.band}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Property Found</h3>
                    <p className="text-sm text-slate-700 font-medium">{result.address}</p>
                    <div className="mt-4 inline-block">
                      <span className="text-4xl font-black text-blue-600 block">Band {result.band}</span>
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
        
        <p className="mt-8 text-xs text-slate-400 text-center max-w-xs">
          Data sourced from GOV.UK. This tool is for informational purposes only.
        </p>
      </main>

      <Footer />
    </div>
  );
}
