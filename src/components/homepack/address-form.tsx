'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  postcode: z.string().min(5, { message: 'Please enter a valid UK postcode.' }).max(8),
});

type AddressFormProps = {
  onSearch: (postcode: string) => void;
  isLoading: boolean;
  error: string | null;
};

export function AddressForm({ onSearch, isLoading, error }: AddressFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postcode: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSearch(values.postcode);
  }

  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create your Property Info Pack</CardTitle>
        <CardDescription>
          Start by entering a UK postcode to find the property and fetch publicly available data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                       <Input placeholder="e.g., SW1A 2AA" {...field} className="text-lg pr-28 h-12" />
                       <Button type="submit" disabled={isLoading} className="absolute top-0 right-0 h-full rounded-l-none px-6">
                         {isLoading ? (
                           <Loader2 className="animate-spin" />
                         ) : (
                           <><Search className="mr-2 h-4 w-4" /> Search</>
                         )}
                       </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
