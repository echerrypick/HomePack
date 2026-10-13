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
    <Card className="property-address-card shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your Property Info Pack</CardTitle>
        <CardDescription>
          Enter the complete property address. Pay-as-you-go reports cost £9.99 per property; payment is required before generation for each new property.
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
                <label htmlFor="property-houseNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  House Number / Name
                </label>
                <Input placeholder="e.g., 10" id="property-houseNumber" aria-invalid={Boolean(errors.houseNumber)} aria-describedby={errors.houseNumber ? 'property-houseNumber-error' : undefined} {...register('houseNumber')} />
                {errors.houseNumber && <p id="property-houseNumber-error" className="text-sm font-medium text-destructive">{errors.houseNumber.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="property-street" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Street Name
                </label>
                <Input placeholder="e.g., Downing Street" id="property-street" aria-invalid={Boolean(errors.street)} aria-describedby={errors.street ? 'property-street-error' : undefined} {...register('street')} />
                {errors.street && <p id="property-street-error" className="text-sm font-medium text-destructive">{errors.street.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="property-town" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Town/City
                </label>
                <Input placeholder="e.g., London" id="property-town" aria-invalid={Boolean(errors.town)} aria-describedby={errors.town ? 'property-town-error' : undefined} {...register('town')} />
                {errors.town && <p id="property-town-error" className="text-sm font-medium text-destructive">{errors.town.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="property-postcode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Postcode
                </label>
                <Input placeholder="e.g., SW1A 2AA" id="property-postcode" aria-invalid={Boolean(errors.postcode)} aria-describedby={errors.postcode ? 'property-postcode-error' : undefined} {...register('postcode')} />
                {errors.postcode && <p id="property-postcode-error" className="text-sm font-medium text-destructive">{errors.postcode.message}</p>}
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Checking property access…' : 'Continue with this property'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
