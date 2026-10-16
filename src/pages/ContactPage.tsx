import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  'Report support',
  'Billing and payments',
  'Account access',
  'Business plans',
  'Data correction',
  'Privacy request',
  'Other',
];

const emptyForm = { name: '', email: '', category: categories[0], title: '', description: '', reference: '', website: '' };

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setSent(false);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Your enquiry could not be sent. Please try again.');
      setSent(true);
      setForm(emptyForm);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Your enquiry could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return <div className="min-h-screen flex flex-col"><Header /><main className="site-main container mx-auto px-4 py-20 flex-grow max-w-3xl">
    <PageHero eyebrow="Here to help" illustration="simple" icon={<Mail />}><h1 className="site-page-heading">Contact UKHomePack</h1><p>Send an enquiry about a report, payment, account, business plan, data correction or privacy request.</p></PageHero>
    <section className="contact-support-panel site-panel border rounded-2xl p-6 sm:p-8">
      <div className="mb-7 space-y-2"><h2 className="text-2xl font-semibold">Send us an enquiry</h2><p className="text-muted-foreground">Complete the form below and we will reply to the email address you provide. Please do not include passwords or card details.</p></div>
      {sent && <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Your enquiry has been sent.</p><p className="text-sm">Thank you. We will respond using the contact details you supplied.</p></div></div>}
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="contact-name">Full name</Label><Input id="contact-name" autoComplete="name" value={form.name} onChange={event => update('name', event.target.value)} maxLength={100} required /></div>
        <div className="space-y-2"><Label htmlFor="contact-email">Email address</Label><Input id="contact-email" type="email" autoComplete="email" value={form.email} onChange={event => update('email', event.target.value)} maxLength={254} required /></div>
        <div className="space-y-2"><Label htmlFor="contact-category">Category of enquiry</Label><select id="contact-category" value={form.category} onChange={event => update('category', event.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" required>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="contact-reference">Report, property or payment reference <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="contact-reference" value={form.reference} onChange={event => update('reference', event.target.value)} maxLength={200} placeholder="Do not enter card details" /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-title">Enquiry title</Label><Input id="contact-title" value={form.title} onChange={event => update('title', event.target.value)} maxLength={140} required /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-description">Description</Label><Textarea id="contact-description" value={form.description} onChange={event => update('description', event.target.value)} minLength={10} maxLength={4000} rows={8} placeholder="Tell us what happened and what help you need." required /><p className="text-right text-xs text-muted-foreground">{form.description.length}/4000</p></div>
        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><Label htmlFor="contact-website">Website</Label><Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => update('website', event.target.value)} /></div>
        <div className="space-y-4 sm:col-span-2"><p className="text-sm text-muted-foreground">We use the information you submit to respond to your enquiry. See our <Link to="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.</p><Button type="submit" size="lg" disabled={sending} className="min-w-44">{sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : 'Send enquiry'}</Button></div>
      </form>
    </section>
  </main><Footer /></div>;
}
