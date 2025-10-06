import type { Address } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';

type PropertySelectorProps = {
  addresses: Address[];
  onSelect: (address: Address) => void;
  onBack: () => void;
};

export function PropertySelector({ addresses, onSelect, onBack }: PropertySelectorProps) {
  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader>
        <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <CardTitle className="text-2xl font-headline pt-10 text-center">Select a Property</CardTitle>
        <CardDescription className="text-center">
          We found multiple properties. Please choose the correct one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => onSelect(address)}
              className="w-full text-left p-4 border rounded-lg hover:bg-accent/50 hover:border-accent transition-all flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Home className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{address.line1}</p>
                <p className="text-sm text-muted-foreground">
                  {address.town}, {address.postcode}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
