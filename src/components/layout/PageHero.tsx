import type { ReactNode } from 'react';
import { Building2, FileText, ShieldCheck } from 'lucide-react';
import { ReportPreview } from '@/components/homepack/ReportPreview';

export function PageHero({ children, eyebrow, illustration = 'property', icon }: { children: ReactNode; eyebrow: string; illustration?: 'property' | 'report' | 'simple'; icon?: ReactNode }) {
  return <section className={`page-hero page-hero-${illustration}`}>
    <div className="page-hero-copy"><p className="page-hero-eyebrow">{eyebrow}</p>{children}</div>
    <div className="page-hero-visual" aria-hidden="true"><span className="page-hero-orb" />{illustration === 'report' ? <><ReportPreview variant="energy" className="page-hero-report-back" /><ReportPreview className="page-hero-report-front" /><span className="page-hero-caption">Illustrative report layout</span></> : <><span className="page-hero-symbol">{icon || <Building2 />}</span><span className="page-hero-mini page-hero-mini-one"><FileText />Property information</span><span className="page-hero-mini page-hero-mini-two"><ShieldCheck />Clear source context</span></>}</div>
  </section>;
}
