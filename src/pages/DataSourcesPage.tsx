import { Database, ExternalLink, SearchCheck, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';

const sources = [
  ['HM Land Registry Price Paid Data', 'Recorded property sales, tenure and recent street sales where matching records are available.', 'https://www.gov.uk/government/collections/price-paid-data'],
  ['GOV.UK Energy Performance Certificate data', 'Published EPC ratings, certificate details and energy recommendations for matched addresses.', 'https://www.gov.uk/find-energy-certificate'],
  ['Valuation Office Agency and local authorities', 'Official council tax bands and published council charges where an exact match can be established.', 'https://www.gov.uk/council-tax-bands'],
  ['Planning Data and local planning records', 'Planning constraints and applications associated with the property, its street or an enabled business search radius.', 'https://www.planning.data.gov.uk/'],
  ['Environment Agency', 'Available flood-risk datasets and current warning information for locations in England.', 'https://www.gov.uk/check-long-term-flood-risk'],
  ['Police.uk', 'Published, anonymised street-level crime records and category comparisons for the local area.', 'https://www.police.uk/pu/about-police.uk/'],
  ['Department for Education and Ofsted', 'Available school details, distance context and published inspection information.', 'https://www.gov.uk/school-performance-tables'],
  ['Ofcom', 'Published broadband and mobile coverage predictions for the address or surrounding location.', 'https://checker.ofcom.org.uk/'],
] as const;

export default function DataSourcesPage() {
  return <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="site-main flex-grow">
      <div className="container mx-auto px-4">
        <PageHero eyebrow="Data sources and methodology" illustration="simple" icon={<Database />}>
          <h1 className="site-page-heading">How UKHomePack collects and presents property information</h1>
          <p>Understand the principal sources used in a report, how addresses are matched and why coverage can differ between properties.</p>
        </PageHero>

        <section className="mx-auto max-w-5xl pb-12">
          <div className="mb-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border bg-card p-7"><SearchCheck className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">Address and location matching</h2><p className="mt-3 leading-7 text-muted-foreground">Where a source supports address records, UKHomePack looks for the exact house, flat or named property rather than treating a postcode match as proof. Location-based sources use the best confirmed coordinates available for the selected property.</p></article>
            <article className="rounded-2xl border bg-card p-7"><TriangleAlert className="mb-4 h-8 w-8 text-amber-600" /><h2 className="text-xl font-bold">No result is not a clean bill of health</h2><p className="mt-3 leading-7 text-muted-foreground">A source may be unavailable, delayed, geographically limited or unable to match an address. “Not available” means that UKHomePack could not confirm the information from that source; it does not prove that no issue or record exists.</p></article>
          </div>

          <h2 className="mb-5 text-2xl font-bold">Principal sources</h2>
          <div className="grid gap-4">
            {sources.map(([name, use, url]) => <article key={name} className="rounded-2xl border bg-card p-6 md:flex md:items-start md:justify-between md:gap-8"><div><h3 className="font-bold">{name}</h3><p className="mt-2 leading-7 text-muted-foreground">{use}</p></div><a className="mt-3 inline-flex shrink-0 items-center gap-2 font-semibold text-primary md:mt-0" href={url} rel="noopener noreferrer" target="_blank">Official source <ExternalLink className="h-4 w-4" /></a></article>)}
          </div>
        </section>

        <section className="mx-auto mb-16 max-w-5xl rounded-2xl border bg-muted/35 p-8 md:p-10">
          <h2 className="text-2xl font-bold">How to use the results</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Check the source labels, dates, search area and limitations shown in the report. Follow material findings to the original publisher and discuss anything important with an appropriately qualified professional. UKHomePack does not replace a survey, valuation, conveyancing searches or legal advice.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/sample">View a sample report</Link></Button><Button asChild variant="outline"><Link to="/features">See report features</Link></Button></div>
        </section>
      </div>
    </main>
    <Footer />
  </div>;
}
