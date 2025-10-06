import { Building2 } from 'lucide-react';
import Link from 'next/link';

export function HomePackHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-md">
              <Building2 className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              HomePack
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
