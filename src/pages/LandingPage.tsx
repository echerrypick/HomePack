import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building2, Check, ChevronDown, Coins, Crown, Database, FileText, Home, Leaf, LockKeyhole, MapPin, Search, Shield, Cloud } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReportPreview } from '@/components/homepack/ReportPreview';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, hasBusinessAccess } from '@/lib/plans';
import './landing.css';

const features = [
  {icon:Home,title:'Property history',text:'Available past sales, recorded tenure and price history.'},
  {icon:Leaf,title:'Energy',text:'EPC ratings, energy efficiency and environmental impact.'},
  {icon:FileText,title:'Planning',text:'Property and same-street planning applications and activity.'},
  {icon:MapPin,title:'Local area',text:'Schools, healthcare, council tax and connectivity information.'},
  {icon:Shield,title:'Crime',text:'Recorded local crime statistics and area comparisons.'},
  {icon:BarChart3,title:'Property insights',text:'Key takeaways to help you make a more informed decision.'},
];
const faqs = [
  ['Where does the data come from?', 'We bring together available public and official records, including HM Land Registry, the EPC Register, planning sources and Police.uk. Coverage and publication dates vary.'],
  ['How quickly do I get the report?', 'Generation starts after verified payment. Follow progress on screen, then read and download your PDF when it is ready. Delivery time depends on the data sources.'],
  ['Is it a subscription?', `No. A retail report is a one-off ${PLANS.report.price} payment for one property, with no recurring fees. Business and Business Plus memberships are available separately.`],
  ['Do I need an account?', 'Yes. Sign in or create an account to choose a property and buy a report. Your purchase is saved to your account.'],
  ['Can I return to a purchased property?', 'Yes. You can generate another report for the same purchased address without paying again. Recent report files are saved in this browser; download a copy to keep.'],
  ['Does this replace a survey or legal searches?', 'No. Reports support initial research. Missing data does not mean there is no risk. Verify significant findings with the relevant source, surveyor or conveyancer.'],
];

function ReportLink({ light = false, children = 'Get my property report' }: {light?:boolean;children?: ReactNode}) {
  return <Link className={`hp-button ${light?'hp-button-light':''}`} to="/tool" state={{startNewHomePack:true}}>{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

export default function LandingPage() {
  const {profile}=useAuth();
  const moreFaqs = useRef<HTMLDetailsElement>(null);
  return <div className="hp-home"><Header /><main>
    <section className="hp-hero"><div className="hp-wrap hp-hero-grid">
      <div className="hp-hero-copy"><p className="hp-eyebrow">Property information for buyers & sellers</p><h1>Know more about the property <span>before you commit.</span></h1><p className="hp-intro">Sale history, energy performance, planning activity, local crime and other useful property information, brought together in one easy-to-read report.</p>
        <p className="hp-price">Your complete property report — <strong>{PLANS.report.price}</strong></p>
        <ul className="hp-benefits">{['One-off payment','PDF included','No subscription'].map(t=><li key={t}><Check aria-hidden="true" />{t}</li>)}</ul>
        {hasBusinessAccess(profile)&&<p className="hp-member-note">Reports are included in your active membership.</p>}
        <div className="hp-actions"><ReportLink /><a href="#whats-included" className="hp-button hp-button-secondary">See what's included</a></div>
        <ul className="hp-assurances"><li><LockKeyhole />Secure payment</li><li><Cloud />Purchase saved to your account</li><li><FileText />Downloadable PDF</li></ul>
        <p className="hp-value"><Coins />A {PLANS.report.price} check before a major property decision.</p>
      </div>
      <div className="hp-report-stage" role="img" aria-label="Illustrative HomePack report pages showing property information, energy ratings and local context"><div className="hp-report-orb" /><ReportPreview variant="history" className="hp-hero-back" /><ReportPreview variant="energy" className="hp-hero-side" /><ReportPreview className="hp-hero-front" /><p className="hp-handwritten">A clear, easy<br />to read report<svg viewBox="0 0 50 65"><path d="M40 5 Q45 35 12 52 M12 52 L16 39 M12 52 L26 53" fill="none" stroke="currentColor" strokeWidth="2" /></svg></p><p className="hp-illustration-label">Illustrative report layout · View the actual sample below</p></div>
    </div></section>

    <section className="hp-sources"><div className="hp-wrap"><div className="hp-section-heading"><h2>Built using trusted UK property data</h2><p>We bring together public and official records to help you make more informed property decisions.</p></div><div className="hp-source-grid">
      <div className="hp-source-card"><span className="hp-land-mark" aria-hidden="true">{Array.from({length:19},(_,i)=><i key={i}/>)}</span><div><h3>HM Land Registry</h3><p>Recorded sales & tenure</p></div></div>
      <div className="hp-source-card"><Crown className="hp-crown" aria-hidden="true" /><div><h3>GOV.UK EPC Register</h3><p>Energy performance</p></div></div>
      <div className="hp-source-card"><FileText aria-hidden="true" /><div><h3>Planning data</h3><p>Local planning information</p></div></div>
      <div className="hp-source-card"><span className="hp-police-mark" aria-hidden="true"/><div><h3>Police.uk</h3><p>Local crime statistics</p></div></div>
    </div><p className="hp-source-note">UKHomePack is an independent service. Coverage and update frequency vary by source. Source names do not imply endorsement.</p></div></section>

    <section id="whats-included" className="hp-included"><div className="hp-wrap"><div className="hp-section-heading"><h2>What's inside your HomePack</h2><p>A detailed overview of the property and surrounding area, all in one report.</p></div><div className="hp-feature-grid">{features.map(({icon:Icon,title,text})=><article className="hp-feature" key={title}><span className={`hp-feature-icon ${title==='Energy'?'hp-feature-green':''}`}><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

    <section className="hp-sample-section"><div className="hp-wrap"><div className="hp-sample-banner"><div className="hp-sample-copy"><h2>See what your report looks like</h2><p>Take a look at a sample report to see the level of detail and how the information is presented.</p><Link to="/sample" className="hp-button">View sample report<ArrowRight size={18} /></Link></div><div className="hp-sample-pages" aria-hidden="true"><ReportPreview className="hp-sample-first"/><ReportPreview variant="area" className="hp-sample-second"/><ReportPreview variant="history" className="hp-sample-third"/></div></div></div></section>

    <section className="hp-how"><div className="hp-wrap"><div className="hp-section-heading"><h2>How it works</h2><p>Get your property report in three simple steps.</p></div><ol className="hp-steps">{[
      {icon:Search,title:'Sign in & enter the address',text:"Choose the exact house or flat you're interested in."},
      {icon:Database,title:'Pay once; we gather the data',text:`Pay ${PLANS.report.price}. We collect the available records and bring them together.`},
      {icon:FileText,title:'View and download your report',text:'Follow generation progress, then read your report and download a PDF.'},
    ].map(({icon:Icon,title,text},i)=><li key={title}><span className="hp-step-number">{i+1}</span><span className="hp-step-icon"><Icon /></span><div><h3>{title}</h3><p>{text}</p></div>{i<2&&<ArrowRight className="hp-step-arrow" aria-hidden="true"/>}</li>)}</ol></div></section>

    <section className="hp-final-cta"><div className="hp-wrap"><div className="hp-cta-panel"><div><h2>Ready to check a property?</h2><p>Get a clear, detailed report for just <strong>{PLANS.report.price}</strong> and make a more informed property decision.</p></div><ul className="hp-benefits">{['One-off payment','PDF report included','No subscription'].map(t=><li key={t}><Check />{t}</li>)}</ul><ReportLink light /></div></div></section>

    <section id="faqs" className="hp-faq"><div className="hp-wrap"><div className="hp-faq-heading"><div><h2>Frequently asked questions</h2><p>Quick answers to common questions about our property reports.</p></div><a href="#more-faqs" onClick={() => { if (moreFaqs.current) moreFaqs.current.open = true; }} className="hp-text-link">View all FAQs<ArrowRight size={15}/></a></div><div className="hp-faq-grid">{faqs.slice(0,3).map(([q,a])=><details open key={q}><summary>{q}<ChevronDown size={15}/></summary><p>{a}</p></details>)}</div><details ref={moreFaqs} id="more-faqs" className="hp-more-faqs"><summary>More about purchases and report coverage<ChevronDown size={15}/></summary><div className="hp-faq-grid">{faqs.slice(3).map(([q,a])=><details key={q}><summary>{q}<ChevronDown size={15}/></summary><p>{a}</p></details>)}</div></details><p className="hp-professional-note">Need reports regularly? <Link to="/pricing">Explore Pro ({PLANS.subscription.price}/month) and Agency ({PLANS.agency.price}/month) memberships <ArrowRight size={14}/></Link></p></div></section>
  </main><Footer /></div>;
}
