
'use client';

import { useState } from 'react';
import { HomePackHeader } from '@/components/homepack/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { getDebugInfo, type DebugInfo } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DebugPage() {
  const [query, setQuery] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setDebugInfo(null);
    const result = await getDebugInfo(query);
    setDebugInfo(result);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePackHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Land Registry Debug Tool</CardTitle>
              <CardDescription>
                Enter an address to see the raw data returned by the Land Registry API for the corresponding postcode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Enter an address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                  <span className="ml-2 hidden sm:inline">Search</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-muted-foreground">Fetching debug info...</p>
            </div>
          )}

          {debugInfo && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
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
        </div>
      </main>
    </div>
  );
}
