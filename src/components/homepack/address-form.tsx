'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Address } from '@/app/actions';

type AddressFormProps = {
  onAddressSubmit: (address: Address) => void;
  isLoading: boolean;
  error: string | null;
};

const addressSchema = z.object({
  street: z.string().min(3, 'Street address is required.'),
  town: z.string().min(2, 'Town/City is required.'),
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i, 'Invalid UK postcode format.'),
});

export function AddressForm({ onAddressSubmit, isLoading, error }: AddressFormProps) {
  const form = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      town: '',
      postcode: '',
    },
  });

  function onSubmit(values: Address) {
    onAddressSubmit(values);
  }

  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create your Property Info Pack</CardTitle>
        <CardDescription>
          Enter the property address to generate your report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address (e.g., 10 Downing Street)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 Downing Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town/City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SW1A 2AA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Generating Report...' : 'Generate Report'}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
