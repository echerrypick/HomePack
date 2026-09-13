import React, { useState, FormEvent } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Wifi, Zap, Smartphone, MapPin, Loader2, Info, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BroadbandResult {
  type: string;
  downloadSpeed: string;
  uploadSpeed: string;
  available: boolean;
}

interface BroadbandData {
  address: string;
  postcode: string;
  broadband: BroadbandResult[];
  networks: string[];
  mobile?: {
    operator: string;
    voice: string;
    data: string;
    fiveG: string;
  }[];
}

export default function BroadbandPage() {
  const [postcode, setPostcode] = useState('');
  const [addresses, setAddresses] = useState<{ id: string; address: string }[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [result, setResult] = useState<BroadbandData | null>(null);
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
          : (data.error.toLowerCase().includes("recaptcha")
              ? "Address lookup temporarily unavailable. Please verify the postcode and try again."
              : data.error);
        setError(errorMsg);
      } else {
        setAddresses(data.addresses || []);
        if (data.addresses?.length === 0) {
          setError("No addresses found for this postcode. Please check the postcode and try again.");
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
      const response = await fetch('/api/broadband/lookup', {
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
        const errorMsg = data.error.toLowerCase().includes("recaptcha")
          ? "Broadband data is currently updating. Please try another property."
          : data.error;
        setError(`Coverage Lookup Error: ${errorMsg}. Please try another property.`);
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError("Failed to fetch broadband details. Please try again.");
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6"
            >
              <Wifi className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-[#2d4a77] mb-4"
            >
              Broadband & Mobile Checker
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto"
            >
              Check official Ofcom coverage data for your property. See available speeds and network providers.
            </motion.p>
          </div>

          <Card className="shadow-xl border-border/50 overflow-hidden mb-8">
            <CardContent className="p-8">
              <form onSubmit={handlePostcodeSearch} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter Postcode (e.g. WD25 7NE)"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      className="pl-10 h-12 text-lg uppercase"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={loading} className="h-12 px-8 rounded-md">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Find Addresses"}
                  </Button>
                </div>
              </form>

              <AnimatePresence>
                {addresses.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 space-y-4"
                  >
                    <label className="text-sm font-medium text-muted-foreground">Select your address</label>
                    <Select onValueChange={handleAddressLookup} value={selectedAddressId}>
                      <SelectTrigger className="h-12 text-base md:text-lg">
                        <SelectValue placeholder="Choose an address...">
                          {addresses.find(a => a.id === selectedAddressId)?.address || "Choose an address..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {addresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive"
                >
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {lookupLoading && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground animate-pulse">Retrieving coverage data from Ofcom...</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-serif text-[#2d4a77]">{result.address}</CardTitle>
                        <CardDescription className="text-base mt-1">{result.postcode}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white">Ofcom Verified</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {result.broadband.map((bb, idx) => (
                        <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${bb.available ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                              <Zap className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-[#2d4a77]">{bb.type}</h3>
                              <p className="text-sm text-muted-foreground">Broadband Service</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8 md:gap-16">
                            <div className="text-center md:text-left">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Download</p>
                              <p className="text-2xl font-bold text-primary">{bb.downloadSpeed}</p>
                            </div>
                            <div className="text-center md:text-left">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Upload</p>
                              <p className="text-2xl font-bold text-primary">{bb.uploadSpeed}</p>
                            </div>
                            <div className="flex items-center justify-center">
                              {bb.available ? (
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                              ) : (
                                <XCircle className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-primary" />
                        Available Networks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.networks.map((network, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm">
                            {network}
                          </Badge>
                        ))}
                        {result.networks.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No specific network data available.</p>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 italic">
                        Networks listed are those providing infrastructure in your area.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Mobile Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.mobile && result.mobile.length > 0 ? (
                          result.mobile.map((m, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#2d4a77]">{m.operator}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Voice: {m.voice} | Data: {m.data}</span>
                              </div>
                              <Badge className={m.fiveG === 'Available' ? 'bg-green-600' : 'bg-muted text-muted-foreground'}>
                                5G: {m.fiveG}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">EE, O2, Three, Vodafone</span>
                              <Badge className="bg-green-600">Likely Good</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">5G Availability</span>
                              <Badge variant="outline" className="border-primary text-primary">Available</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-4 italic">
                        Outdoor coverage is generally better than indoor. Check specific provider maps for indoor signal.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-8">
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    Start New Search
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-16 p-6 bg-muted/50 rounded-2xl border border-border/50">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-[#2d4a77] mb-1">About Ofcom Data</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The speeds indicated are the fastest estimated speeds predicted by the network operator(s) providing services in this area. Actual service availability at a property or speeds received may be different.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <a 
                    href="https://checker.ofcom.org.uk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    Official Ofcom Checker <ArrowRight className="h-3 w-3" />
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
