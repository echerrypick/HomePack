import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Address } from '@/types';

type AddressFormProps = {
  onAddressSubmit: (address: Address) => void;
  isLoading: boolean;
  error: string | null;
};

const addressSchema = z.object({
  houseNumber: z.string().min(1, 'House number or name is required.'),
  street: z.string().min(3, 'Street name is required.'),
  town: z.string().min(2, 'Town/City is required.'),
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i, 'Invalid UK postcode format.'),
});

export function AddressForm({ onAddressSubmit, isLoading, error }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      houseNumber: '',
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  House Number / Name
                </label>
                <Input placeholder="e.g., 10" {...register('houseNumber')} />
                {errors.houseNumber && <p className="text-sm font-medium text-destructive">{errors.houseNumber.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Street Name
                </label>
                <Input placeholder="e.g., Downing Street" {...register('street')} />
                {errors.street && <p className="text-sm font-medium text-destructive">{errors.street.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Town/City
                </label>
                <Input placeholder="e.g., London" {...register('town')} />
                {errors.town && <p className="text-sm font-medium text-destructive">{errors.town.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Postcode
                </label>
                <Input placeholder="e.g., SW1A 2AA" {...register('postcode')} />
                {errors.postcode && <p className="text-sm font-medium text-destructive">{errors.postcode.message}</p>}
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
