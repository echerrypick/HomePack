'use client';

import { useState, useEffect } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getAddressSuggestions, Address } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';

type AddressFormProps = {
  onAddressSelect: (address: Address) => void;
  isLoading: boolean;
  error: string | null;
};

export function AddressForm({ onAddressSelect, isLoading, error }: AddressFormProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchAddresses = async () => {
      if (debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsFetching(true);
      try {
        const results = await getAddressSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
        setSuggestions([]); // Optionally, you could set an error state here
      } finally {
        setIsFetching(false);
      }
    };

    searchAddresses();
  }, [debouncedQuery]);


  const handleInputChange = (value: string) => {
    setQuery(value);
  };
  
  const handleSelect = (addressString: string) => {
    const selected = suggestions.find(s => s.address === addressString);
    if(selected) {
        onAddressSelect(selected);
    }
  };

  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create your Property Info Pack</CardTitle>
        <CardDescription>
          Start by typing an address or postcode to find the property.
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
          <Command shouldFilter={false} className="overflow-visible">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
              <CommandInput
                placeholder="Start typing an address or postcode..."
                className="text-lg h-12 pl-10"
                value={query}
                onValueChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <CommandList>
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <CommandItem
                    key={suggestion.id}
                    value={suggestion.address}
                    onSelect={handleSelect}
                    >
                    {suggestion.address}
                    </CommandItem>
                  ))
                ) : (
                  query.length > 2 && !isFetching && <CommandEmpty>No results found.</CommandEmpty>
                )}
            </CommandList>
          </Command>
        </div>
      </CardContent>
    </Card>
  );
}
