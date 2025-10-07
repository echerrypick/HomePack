
'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getDebugInfo, type DebugInfo, type Address } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AddressForm } from '@/components/homepack/address-form';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  const handleAddressSelect = async (address: Address) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setIsSearching(false); // Hide the form and show loading spinner
    try {
        const result = await getDebugInfo(address);
        setDebugInfo(result);
    } catch(e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSearching(true);
    setDebugInfo(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePackHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {isSearching ? (
            <Card>
              <CardHeader>
                <CardTitle>Land Registry Debug Tool</CardTitle>
                <CardDescription>
                  Enter an address to see the raw data returned by the Land Registry API for the corresponding postcode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <AddressForm onAddressSelect={handleAddressSelect} isLoading={isLoading} error={error} />
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Fetching debug info...</p>
            </div>
          ) : (
            <>
              {debugInfo && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                        <div>
                            <CardTitle>Debug Information</CardTitle>
                            <CardDescription>Raw data returned from the Land Registry API.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleReset}>Search Again</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono text-sm">
                    {debugInfo.error && (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{debugInfo.error}</AlertDescription>
                        </Alert>
                    )}
                    <div>
                      <h3 className="font-semibold text-base mb-1">Full Address Used:</h3>
                      <p className="p-2 bg-muted rounded-md break-words">{debugInfo.fullAddressUsed}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">Postcode Extracted:</h3>
                      <p className="p-2 bg-muted rounded-md">{debugInfo.postcode}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">Land Registry URL Queried:</h3>
                      <p className="p-2 bg-muted rounded-md break-all">{debugInfo.landRegistryUrl}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">Raw API Response:</h3>
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                        {JSON.stringify(debugInfo.landRegistryRawResponse, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
