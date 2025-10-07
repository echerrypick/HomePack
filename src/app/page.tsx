'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ListChecks } from 'lucide-react';

function Header() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              HomePack
            </Link>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <Link
              href="#"
              className="font-medium text-primary-foreground/80 hover:text-primary-foreground"
            >
              About
            </Link>
            <Link
              href="#"
              className="font-medium text-primary-foreground/80 hover:text-primary-foreground"
            >
              Contact
            </Link>
            <Link
              href="/debug"
              className="font-medium text-primary-foreground/80 hover:text-primary-foreground"
            >
              Debug
            </Link>
          </nav>
          <div className="flex items-center">
            <Button asChild variant="default" className="hidden md:block bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/tool">Get started</Link>
            </Button>
            <Button asChild size="sm" variant="default" className="md:hidden bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/tool">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Complete property information packs
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Get instant access to detailed and trustworthy information
                  about any property in the UK
                </p>
                <div className="w-full max-w-sm">
                   <Button asChild size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/tool">Get started</Link>
                  </Button>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-contain sm:w-full"
                height="310"
                src="https://picsum.photos/seed/house/550/310"
                data-ai-hint="house illustration"
                width="550"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 md:grid-cols-2 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle>Property Info Pack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Land Registry data
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      EPC rating
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Flood & planning
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/tool">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Property Info Pack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                     <ListChecks className="h-8 w-8 text-primary" />
                    <span>AI-generated property summary</span>
                  </div>
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/tool">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} HomePack. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
