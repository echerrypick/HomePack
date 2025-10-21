
'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getDebugInfo, type Address } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AddressForm } from '@/components/homepack/address-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type DebugInfo = {
    query: string;
    response?: any;
    error?: string;
}

function DebugView({ debugInfo }: { debugInfo: DebugInfo }) {
  const hasResults = debugInfo.response?.results?.bindings?.length > 0;
  const hasError = !!debugInfo.error || debugInfo.response?.results?.bindings?.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {hasResults ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            SPARQL Query Result
          </CardTitle>
          <span className={`text-sm font-semibold ${hasResults ? 'text-green-600' : 'text-destructive'}`}>
            {hasResults ? `${debugInfo.response.results.bindings.length} results found` : (debugInfo.error || 'No results')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="query">
            <AccordionTrigger>View SPARQL Query</AccordionTrigger>
            <AccordionContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                {debugInfo.query}
              </pre>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="response">
            <AccordionTrigger>View Raw API Response</AccordionTrigger>
            <AccordionContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                {JSON.stringify(debugInfo.response || { error: debugInfo.error }, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  const handleAddressSubmit = async (address: Address) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setIsSearching(false);
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
                <CardTitle>Land Registry SPARQL Debugger</CardTitle>
                <CardDescription>
                  Enter an address to see the exact SPARQL query and the raw API response.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <AddressForm onAddressSubmit={handleAddressSubmit} isLoading={isLoading} error={error} />
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Running debug query...</p>
            </div>
          ) : (
            <>
              {debugInfo && (
                <div className="animate-fade-in space-y-6">
                   <div className='flex justify-between items-start'>
                        <div>
                            <h2 className="text-2xl font-bold">Debug Information</h2>
                            <p className="text-muted-foreground">Results from the Land Registry SPARQL query.</p>
                        </div>
                        <Button variant="outline" onClick={handleReset}>Search Again</Button>
                    </div>

                  {error && (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                  <DebugView debugInfo={debugInfo} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
