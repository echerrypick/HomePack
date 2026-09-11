import React, { useState, FormEvent } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Smartphone, MapPin, Loader2, Info, ArrowRight, CheckCircle2, XCircle, Signal, SignalHigh, SignalLow, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenerationSignal } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileResult {
  operator: string;
  voice?: string;
  data?: string;
  data4g?: string;
  data5g?: string;
  fiveG?: string;
  indoor?: string;
  outdoor?: string;
  signals?: GenerationSignal[];
  overall?: string;
}

interface MobileData {
  address: string;
  postcode: string;
  mobile: MobileResult[];
  mobileSummary?: string;
}

export default function MobilePage() {
  const [postcode, setPostcode] = useState('');
  const [addresses, setAddresses] = useState<{ id: string; address: string }[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [result, setResult] = useState<MobileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePostcodeSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!postcode) return;

    setLoading(true);
    setError(null);
    setAddresses([]);
    setResult(null);

    try {
      const response = await fetch('/api/broadband/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode }),
      });

      const data = await response.json();
      if (data.error && (!data.addresses || data.addresses.length === 0)) {
        const errorMsg = data.error.includes("Executable doesn't exist") || data.error.includes("playwright")
          ? "The address lookup engine is initialising. Please try searching again in a moment."
          : data.error;
        setError(errorMsg);
      } else {
        setAddresses(data.addresses || []);
        if (data.addresses?.length === 0) {
          setError("No addresses found for this postcode.");
        }
      }
    } catch (err) {
      setError("Failed to fetch addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressLookup = async (addressId: string) => {
    const selectedAddr = addresses.find(a => a.id === addressId);
    setSelectedAddressId(addressId);
    setLookupLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/mobile/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          addressId, 
          postcode,
          addressText: selectedAddr?.address
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(`Coverage Lookup Error: ${data.error}. Please try another property.`);
      } else if (data.result) {
        setResult({
          address: data.result.address,
          postcode: data.result.postcode,
          mobile: data.result.mobile || [],
          mobileSummary: data.result.mobileSummary || ""
        });
      }
    } catch (err) {
      setError("Failed to fetch mobile coverage details. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleReset = () => {
    setPostcode('');
    setAddresses([]);
    setSelectedAddressId('');
    setResult(null);
    setError(null);
  };

  const getSignalIcon = (status: string) => {
    if (status.toLowerCase().includes('good')) return <SignalHigh className="h-5 w-5 text-green-500" />;
    if (status.toLowerCase().includes('variable')) return <Signal className="h-5 w-5 text-yellow-500" />;
    return <SignalLow className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-6 shadow-inner"
            >
              <Smartphone className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-[#2d4a77] mb-4"
            >
              Mobile Coverage Checker
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Check official Ofcom mobile coverage for your property. See 4G, 5G, and voice availability across all major UK networks.
            </motion.p>
          </div>

          <Card className="shadow-2xl border-primary/10 overflow-hidden mb-12 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handlePostcodeSearch} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Enter Postcode (e.g. WD25 7NE)"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      className="pl-12 h-14 text-xl uppercase font-medium bg-background/80 border-2 focus-visible:ring-primary/20"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={loading} className="h-14 px-10 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Find Addresses"}
                  </Button>
                </div>
              </form>

              <AnimatePresence>
                {addresses.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-10 space-y-4"
                  >
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Select your address</label>
                    <Select onValueChange={handleAddressLookup} value={selectedAddressId}>
                      <SelectTrigger className="h-14 text-base md:text-lg bg-background/80 border-2 text-foreground font-medium truncate">
                        <SelectValue placeholder="Choose an address...">
                          {addresses.find(a => a.id === selectedAddressId)?.address || "Choose an address..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id} className="text-base py-2.5">
                            {addr.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-5 bg-destructive/5 border-2 border-destructive/20 rounded-2xl flex items-center gap-4 text-destructive"
                >
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <Info className="h-6 w-6 flex-shrink-0" />
                  </div>
                  <p className="text-lg font-semibold">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {lookupLoading && (
            <div className="text-center py-20 space-y-6">
              <div className="relative inline-block">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <Smartphone className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xl font-medium text-muted-foreground animate-pulse">Retrieving live mobile coverage from Ofcom...</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-10 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-2">{result.address}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-lg font-medium">{result.postcode}</span>
                      </div>
                    </div>
                    {result.mobileSummary ? (
                      <Badge className="bg-primary text-primary-foreground px-6 py-2 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl">
                        Overall: {result.mobileSummary}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white px-4 py-1.5 text-sm font-bold border-primary/20 shadow-sm">
                        Ofcom Verified Results
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {result.mobile.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-bold text-[#2d4a77] group-hover:text-primary transition-colors">
                              {m.operator}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {m.signals ? (
                                <Badge className={m.overall?.toLowerCase().includes('excellent') || m.overall?.toLowerCase().includes('good') ? 'bg-green-600' : 'bg-slate-400'}>
                                  {m.overall}
                                </Badge>
                              ) : (
                                <Badge className={m.fiveG?.includes('Good') || m.fiveG?.includes('Available') ? 'bg-green-600' : 'bg-slate-400'}>
                                  5G: {m.fiveG}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                          {m.signals ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {m.signals.map((sig, sIdx) => (
                                <div key={sIdx} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-lg">{sig.generation}</span>
                                    <span className="text-xs font-mono text-muted-foreground">{sig.signalDbm}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className={`text-sm font-semibold ${sig.quality.toLowerCase().includes('good') ? 'text-green-600' : 'text-muted-foreground'}`}>
                                      {sig.quality}
                                    </span>
                                    {sig.bands.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {sig.bands.map((b, bIdx) => (
                                          <span key={bIdx} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{b}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                  <SignalHigh className="h-4 w-4" />
                                  Voice
                                </div>
                                <div className="flex items-center gap-2">
                                  {getSignalIcon(m.voice || "")}
                                  <span className="text-lg font-semibold">{m.voice}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                  <SignalHigh className="h-4 w-4" />
                                  Data (4G)
                                </div>
                                <div className="flex items-center gap-2">
                                  {getSignalIcon(m.data || m.data4g || "")}
                                  <span className="text-lg font-semibold">{m.data || m.data4g || "Likely"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {(m.indoor || m.outdoor) && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                              <div className="bg-muted/40 p-2.5 rounded-lg text-center">
                                <span className="text-[11px] font-semibold text-muted-foreground block uppercase">Indoor Signal</span>
                                <span className={`text-sm font-bold ${m.indoor === 'Good' ? 'text-green-600' : 'text-amber-600'}`}>
                                  {m.indoor || "Variable"}
                                </span>
                              </div>
                              <div className="bg-muted/40 p-2.5 rounded-lg text-center">
                                <span className="text-[11px] font-semibold text-muted-foreground block uppercase">Outdoor Signal</span>
                                <span className={`text-sm font-bold ${m.outdoor === 'Poor' ? 'text-amber-600' : 'text-green-600'}`}>
                                  {m.outdoor || "Good"}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                              {m.signals ? 'Source: siginfo.uk cell tower telemetry' : 'Outdoor coverage is generally stronger than indoor reception. 5G availability depends on local mast line-of-sight.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {result.mobile.length === 0 && (
                  <Card className="p-12 text-center border-dashed border-2 bg-card/30">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-xl text-muted-foreground font-medium mb-6">No detailed mobile coverage data found for this specific address.</p>
                    <div className="max-w-md mx-auto p-6 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        Sometimes Ofcom's real-time API can't provide detailed results for specific addresses. You can check the official Map Your Mobile tool directly:
                      </p>
                      <a 
                        href="https://checker.ofcom.org.uk/en-gb/mobile-coverage" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-bold"
                      >
                        Open Ofcom Mobile Checker <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </Card>
                )}

                <div className="flex justify-center pt-10">
                  <Button variant="outline" size="lg" onClick={handleReset} className="gap-3 px-8 h-14 text-lg font-bold rounded-xl border-2">
                    <Search className="h-5 w-5" />
                    Start New Search
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-24 p-8 md:p-12 bg-muted/30 rounded-[2rem] border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <SignalHigh className="h-32 w-32" />
            </div>
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#2d4a77] mb-4">About Mobile Coverage Data</h4>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Ofcom's mobile coverage data provides an estimate of the signal strength you can expect at a specific location. These predictions are based on computer models and reflect the best estimates from the mobile network operators.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://www.ofcom.org.uk/mobile-coverage-checker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border rounded-xl text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    Official Ofcom Checker <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
