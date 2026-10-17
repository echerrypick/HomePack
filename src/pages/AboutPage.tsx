import { Building2, Compass, FileCheck2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="site-main flex-grow">
      <div className="container mx-auto px-4">
        <PageHero eyebrow="About UKHomePack" illustration="simple" icon={<Building2 />}>
          <h1 className="site-page-heading">Clearer property research before you commit</h1>
          <p>UKHomePack is an independent UK property-information service created to make early-stage property research easier to understand.</p>
        </PageHero>

        <section className="mx-auto grid max-w-5xl gap-6 pb-12 md:grid-cols-3">
          <article className="rounded-2xl border bg-card p-7"><Compass className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">Why it exists</h2><p className="mt-3 leading-7 text-muted-foreground">Important property information is spread across different public services. UKHomePack brings available records into one readable report so buyers, sellers and professionals can see what deserves closer investigation.</p></article>
          <article className="rounded-2xl border bg-card p-7"><FileCheck2 className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">What it does</h2><p className="mt-3 leading-7 text-muted-foreground">The service checks available records for an exact address and its local area, presents source context and highlights useful questions to raise with an estate agent, surveyor or conveyancer.</p></article>
          <article className="rounded-2xl border bg-card p-7"><ShieldCheck className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">What it does not do</h2><p className="mt-3 leading-7 text-muted-foreground">A UKHomePack report is a research aid. It is not a valuation, survey, legal search, conveyancing service or guarantee that every relevant record is available.</p></article>
        </section>

        <section className="mx-auto mb-16 max-w-5xl rounded-2xl border bg-muted/35 p-8 md:p-10">
          <h2 className="text-2xl font-bold">Independent and source-conscious</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">UKHomePack is not affiliated with the public bodies and data providers named in its reports. Source names identify where information originated; they do not imply endorsement. We aim to describe coverage and limitations plainly and do not replace missing official information with invented values.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/data-sources">Read our data sources and methodology</Link></Button><Button asChild variant="outline"><Link to="/contact">Contact UKHomePack</Link></Button></div>
        </section>
      </div>
    </main>
    <Footer />
  </div>;
}
