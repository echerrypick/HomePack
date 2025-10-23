
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HomePackHeader } from '@/components/homepack/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getPlanningDebugInfo } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type DebugInfo = {
  url: string;
  response?: any;
  error?: string;
}

type StepByStepDebugInfo = {
  uprnResult: DebugInfo;
  livenessResult: DebugInfo;
  knownGoodResult: DebugInfo;
}

function DebugStepView({ step, title, description, debugInfo }: { step: number; title:string; description: string; debugInfo: DebugInfo }) {
  const hasResults = debugInfo.response?.entities?.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {hasResults ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Step {step}: {title}
            </CardTitle>
            <CardDescription className="pt-1 pl-7">{description}</CardDescription>
          </div>
          <span className={`text-sm font-semibold ${hasResults ? 'text-green-600' : 'text-destructive'}`}>
            {hasResults ? `${debugInfo.response.entities.length} results found` : (debugInfo.error || 'No results')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="query">
            <AccordionTrigger>View API URL</AccordionTrigger>
            <AccordionContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                {debugInfo.url}
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

export default function PlanningDebugPage() {
  const [debugInfo, setDebugInfo] = useState<StepByStepDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedUprn, setSubmittedUprn] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      uprn: '',
    },
  });

  const handleUprnSubmit = async (values: { uprn: string }) => {
    if (!values.uprn) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setSubmittedUprn(values.uprn);
    try {
        const result = await getPlanningDebugInfo(values.uprn);
        setDebugInfo(result);
    } catch(e: any) {
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDebugInfo(null);
    setError(null);
    setSubmittedUprn(null);
    form.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePackHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {!submittedUprn ? (
            <Card>
              <CardHeader>
                <CardTitle>Planning History API Step-by-Step Debugger</CardTitle>
                <CardDescription>
                  Enter a UPRN to see the results of a 3-step API query to find the exact point of failure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUprnSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="uprn"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>UPRN</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., 100080000001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Running Debug Queries...' : 'Run Debug'}
                        </Button>
                    </form>
                </Form>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Running debug queries for Planning History...</p>
            </div>
          ) : (
            <>
              {debugInfo && (
                <div className="animate-fade-in space-y-6">
                   <div className='flex justify-between items-start'>
                        <div>
                            <h2 className="text-2xl font-bold">Planning History Debug Information</h2>
                            {submittedUprn && (
                               <p className="text-muted-foreground">
                                Showing results for UPRN: {submittedUprn}
                               </p>
                            )}
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
                  <div className="space-y-4">
                    <DebugStepView 
                      step={1} 
                      title="UPRN Search" 
                      description="Tests if any applications are linked to the provided UPRN."
                      debugInfo={debugInfo.uprnResult} 
                    />
                    <DebugStepView 
                      step={2} 
                      title="API Liveness Check"
                      description="Fetches the 5 most recent applications to confirm the API is responsive."
                      debugInfo={debugInfo.livenessResult} 
                    />
                    <DebugStepView 
                      step={3} 
                      title="Known Good Query" 
                      description="Tests a query with a reference known to return a result (23/00002/FUL)."
                      debugInfo={debugInfo.knownGoodResult} 
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
