# UKHomePack monthly operating-cost estimate

Prepared 13 October 2026. This is a planning model based on the repository and public provider prices, not measured production invoices or a capacity guarantee. All model amounts are GBP. USD conversion uses an explicit budgeting assumption of $1 = £0.80, not a live exchange-rate quote.

## Scope and assumptions

- Current customer prices: PAYG £9.99/property, Pro £49/month, Agency £79/month. One successful payment per PAYG order and one renewal per subscriber/month. All payments use standard UK cards and GBP settlement; upgrades/prorations are excluded.
- Average subscriber activity: 20 reports/month for Pro; 40 for Agency. Add 20% report generations for repeat requests/retries. Actual subscriber activity is unbounded under the present unlimited offer.
- Every generation, including free re-generation of an owned property, incurs compute/provider work. Reopening a cached report and downloading a PDF in the browser do not themselves require another AI generation.
- Budget £0.05 AI per generation; sensitivity £0.02–£0.20. This includes a blended allowance for several short text calls, occasional photo analysis and fallback work. It is an assumption, not a measured price per report. The separate 20% generation uplift models repeated whole runs, while per-generation allowance covers calls inside a run.
- Reference: Groq GPT-OSS-120B is $0.15/million input tokens and $0.60/million output tokens. At 20,000 input and 8,000 output tokens total, pure token cost is $0.0078 (about £0.0062). The 5p budget deliberately leaves room for reasoning, other models, images and retries. These token volumes have not been measured.
- Existing routing attempts OpenRouter free models first, with Groq and Gemini fallbacks. Free-provider quotas are not assumed to sustain production. Photo analysis needs a configured Gemini key and a supported model ID; that flow is not currently proven.
- Base deployment: managed Node hosting, durable report jobs, database/object storage and backups, business email, monitoring and domain. Durable jobs/storage are planned improvements, not already implemented. Hosting allocations are spend allowances, not tested instance recommendations.
- Traffic: monthly visits shown below, about 2 MB delivered per visit with caching; roughly 1 MB structured report per generation retained for 12 months, about two report retrievals per generation. Raw photos/PDF files are not retained in this baseline. This yields about 16.6 GB steady-state structured storage in Growth and 331 GB in Busy, before indexes, backup copies and provider storage overhead. Bandwidth and storage allocations require measurement.
- Standalone public lookup traffic is assumed modest (roughly one lookup per ten visits); automated/bulk traffic and extensive photo uploading are excluded.
- Existing official/public endpoints and current Ofcom subscriptions are provisionally allocated £0 in data licence fees. No supplier account contracts, commercial rights, or API tiers have been verified. Any commercial licence is additional; this model does not assume official title-document purchases or paid conveyancing searches.
- Add a conservative supplier-tax allowance of 20% of non-Stripe technical costs, plus a separate 25% contingency on the same subtotal. This is a budget cushion, not a determination that every supplier charges VAT. Owner confirms the business is not VAT registered; taxes actually charged by suppliers still affect cash costs.
- Reserve 2% of customer receipts for refunds/losses. It is a cash reserve, not a provider invoice, and may not cover chargebacks or poor delivery rates.

## Usage scenarios

| Scenario | Visits | PAYG purchases | Pro members | Agency members | Generations incl. repeats | Gross customer receipts |
|---|---:|---:|---:|---:|---:|---:|
| Pilot | 500 | 10 | 0 | 0 | 12 | £99.90 |
| Launch | 2,000 | 50 | 5 | 2 | 276 | £902.50 |
| Growth | 10,000 | 250 | 25 | 10 | 1,380 | £4,512.50 |
| Established | 50,000 | 1,000 | 100 | 40 | 5,520 | £18,050.00 |
| Busy | 200,000 | 5,000 | 500 | 200 | 27,600 | £90,250.00 |

## Monthly technical costs and reserves

These estimates cover the assumed stack and traffic, excluding owner/staff time, marketing, business overhead and any newly required commercial data licences.

| Item | Pilot | Launch | Growth | Established | Busy |
|---|---:|---:|---:|---:|---:|
| Infrastructure/domain/email | £21.00 | £30.00 | £65.00 | £150.00 | £450.00 |
| AI generation | £0.60 | £13.80 | £69.00 | £276.00 | £1,380.00 |
| Stripe Payments + Billing | £3.50 | £27.76 | £138.79 | £555.17 | £2,775.85 |
| Supplier tax + technical contingency | £9.72 | £19.71 | £60.30 | £191.70 | £823.50 |
| Refund/loss reserve | £2.00 | £18.05 | £90.25 | £361.00 | £1,805.00 |
| TOTAL monthly budget | £36.82 | £109.32 | £423.34 | £1,533.87 | £7,234.35 |

Infrastructure allocations before tax/contingency:

| Item | Pilot | Launch | Growth | Established | Busy |
|---|---:|---:|---:|---:|---:|
| App hosting / worker compute | £12 | £12 | £40 | £90 | £280 |
| Database / object storage / backups | £1 | £3 | £8 | £25 | £90 |
| Business email / transactional email | £5 | £8 | £10 | £20 | £35 |
| Domain annual renewal, monthly allocation | £3 | £3 | £3 | £3 | £3 |
| Monitoring / bandwidth / other | £0 | £4 | £4 | £12 | £42 |

The £3/month domain allocation means £36/year; replace with the actual names.co.uk renewal invoice. Email allowances are placeholders, not quotes from a selected email supplier. Render currently advertises $7/month for its smallest paid web service; a separate worker is another service. These allocations do not prove that 512 MB is sufficient. At higher traffic, add instances or larger plans after load tests. Render's new Hobby workspace includes only 5 GB bandwidth; excess is $0.15/GB. 200,000 visits at 2 MB/visit alone is about 400 GB, approximately £47.40 in excess bandwidth before report traffic, tax and other allowances. Busy monitoring/bandwidth allocation is intentionally backed by the separate contingency, but a higher-throughput plan/CDN may be preferable.

## AI sensitivity

Holding all other assumptions fixed (these are not complete worst-case ranges):

| Scenario | 2p/generation | 5p/generation baseline | 20p/generation |
|---|---:|---:|---:|
| Pilot | £36.29 | £36.82 | £39.43 |
| Launch | £97.31 | £109.32 | £169.35 |
| Growth | £363.31 | £423.34 | £723.49 |
| Established | £1,293.75 | £1,533.87 | £2,734.47 |
| Busy | £6,033.75 | £7,234.35 | £13,237.35 |

## Payment fees

Stripe standard UK cards: 1.5% + £0.20/payment. Stripe Billing PAYG pricing: an additional 0.7% of subscription billing volume. No Billing fee is applied to the one-off payment-mode PAYG purchases in this model. Estimated fees per charge: PAYG £0.35, Pro £1.28, Agency £1.94. These are before any tax on relevant Stripe services, premium/foreign-card uplift, disputes or additional paid Stripe features. The supplier-tax allowance does not include Stripe: confirm the tax treatment of the account's invoiced Billing fees and add any applicable amount. A 20% tax on the 0.7% Billing component would add about £0.56 Launch, £2.82 Growth, £11.28 Established and £56.42 Busy.

Formula: Stripe = 0.015 × gross customer receipts + 0.20 × (PAYG + Pro + Agency payments) + 0.007 × (49 × Pro + 79 × Agency).

Payment fees are generally retained on refunds; the original charge's fees are already included in the model. Disputes can add material fees/losses. Do not treat the 2% reserve as a guaranteed loss ceiling. EU/premium/international cards cost more, and subscriptions changed mid-month can create additional payments.

## Subscriber usage sensitivity

At 5p per generation with 20% repeat allowance:

| Reports per member/month | AI before supplier tax/contingency | AI incl. 45% allowances |
|---|---:|---:|
| 20 | £1.20 | £1.74 |
| 100 | £6.00 | £8.70 |
| 500 | £30.00 | £43.50 |
| 1,000 | £60.00 | £87.00 |

At 500 reports/month a £49 Pro account has about £43.50 of modelled AI cost plus £1.28 payment fees, leaving little for hosting, support and losses. At 20p/generation this becomes uneconomic much sooner. Implement agreed fair-use/rate/concurrency controls and alerting; changing an advertised unlimited offer needs a product decision and clear customer terms.

## Costs outside the technical model

Planning allowances only; obtain quotes and count existing subscriptions once:

- Owner-operated support/operations: Pilot 2 hours, Launch 5, Growth 15, Established 40, Busy 120 hours/month. Valued at an illustrative £20/hour: £40 / £100 / £300 / £800 / £2,400. This does not cover substantial feature development or dedicated incident cover.
- Outsourced maintenance: allow £100–£500/month initially if required; heavier traffic/availability commitments may cost more. Avoid adding this on top of owner time for the same work.
- Bookkeeping/accountancy: illustrative £20–£100/month initially; depends on business structure and VAT/payroll obligations.
- Professional/cyber insurance: illustrative £15–£60/month initially, subject to underwriting and coverage; this is not a quote.
- Paid marketing: optional £0 organic, £100–£300 experimental, £500+ growth. No customer-acquisition cost or return is established.
- Existing Codex/ChatGPT subscription used for development: allocate your actual incremental business cost if applicable. It does not pay for the app's Groq/Gemini/OpenRouter API usage.
- One-off launch work, legal review, testing, data-licensing diligence, hosting setup and development are excluded from recurring estimates.

Owner-run Launch illustration: £109 technical cash budget + £20–£100 bookkeeping + £15–£60 insurance = £144–£269/month before marketing and paid maintenance. Add £100–£300 advertising for £244–£569 cash/month, then about £100 imputed owner time if desired. These optional business allowances need quotes; the site can be operated without paid advertising.

## Uncertainties and cost controls

- No production token, memory, latency, bandwidth or failure-rate measurements exist yet. Run 50–100 representative reports, including photo jobs, and log provider usage/cost, source requests, retries and peak resource usage before committing to capacity.
- The app uses a named Firestore database. Only the first database created in a project receives free quota, regardless of its name. Confirm this database's eligibility and region rather than assuming all reads/storage are free.
- Free AI availability and provider rate limits can fail under burst load. Current code has multiple fallbacks and no universal output-token limit; set explicit budgets and caps. Cache source results when licensing permits, deduplicate simultaneous jobs and save durable reports.
- Public lookup endpoints can trigger upstream work before a purchase. Add rate limits, quotas and abuse protection. Usage-based providers may exceed budgets if unrestricted; alerts alone do not stop spend.
- Pricing assumes current public-data sources remain usable at no direct charge under the intended commercial use. Reserve separately for any required paid address, planning, Ofcom or other licence. A new £0.50/report data fee would add £138/month at Launch and £690/month at Growth, before taxes/contingency; a fixed licence adds its full monthly price.
- If retaining 10 photos of 1 MB per generated report for 12 months, Launch adds about 33 GB and Busy adds about 3.3 TB before backups. This is not included; use retention limits and cost the chosen storage region/egress.
- The high receipts scenarios are not profit forecasts. VAT registration currently becomes mandatory above £90,000 taxable turnover in a rolling 12 months, or when the next-30-days rule applies. Revisit customer pricing and net receipts well before reaching that scale. Supplier taxes in this model are separate from VAT collected on sales.

## Sources checked 13 October 2026

- Render compute: https://render.com/pricing
- Render workspace/bandwidth change: https://render.com/docs/new-workspace-plans
- Stripe UK payments and Billing: https://stripe.com/gb/pricing
- Groq model rates: https://console.groq.com/docs/model/openai/gpt-oss-120b
- Gemini token/image-input rates: https://ai.google.dev/gemini-api/docs/pricing
- OpenRouter free-plan limits: https://openrouter.ai/pricing/
- Firebase database billing/quota: https://firebase.google.com/docs/firestore/pricing
- Names.co.uk actual renewal lookup: https://www.names.co.uk/support/articles/how-can-i-find-my-domain-renewal-price/
- UK VAT registration: https://www.gov.uk/register-for-vat
