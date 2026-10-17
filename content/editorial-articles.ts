import type { ArticleInput } from '../src/lib/articles';

const SITE = 'https://ukhomepack.com';
const IMAGE = `${SITE}/images/articles`;

export const editorialArticles: ArticleInput[] = [
  {
    slug: 'things-to-check-before-buying-a-house-uk',
    title: '12 Things to Check Before Buying a House in the UK',
    excerpt: 'A practical checklist for researching a property, its running costs and the surrounding area before you commit to buying a home.',
    category: 'Buying a property',
    tags: ['buying a house', 'homebuyer checklist', 'property checks', 'moving home'],
    imageUrl: `${IMAGE}/checks-before-buying-house.jpg`,
    imageAlt: 'A prospective buyer inspecting a British terraced house with a clipboard',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: '12 Things to Check Before Buying a House in the UK',
    seoDescription: 'Use this practical 12-point checklist to research a house, its costs and local area before making an offer or exchanging contracts.',
    status: 'draft', featured: true,
    content: `Buying a house calls for more than a good viewing and a mortgage agreement in principle. Before you commit, check the property itself, the available public records and the practical details that will shape daily life there. The aim is not to find a flawless home. It is to understand what you are buying and know which questions still need professional answers.

This checklist is written for buyers in England and Wales. Scotland and Northern Ireland have different legal processes and public services.

## 1. Confirm the exact property and tenure

Start with the full postal address, including the flat or unit number where relevant. Ask whether the property is freehold or leasehold. If it is leasehold, find out the remaining lease term, service charge, ground rent provisions, planned major works and how the building is managed. Your conveyancer will confirm the legal title; an online record is only an early research aid.

## 2. Review sold-price history

Look at recorded sales for the property and recent transactions on the same street. This can provide useful context for your offer, but it is not a valuation. Two neighbouring homes may differ in size, condition, tenure, plot or extensions. HM Land Registry says its Price Paid Data covers sales for value in England and Wales that have been lodged for registration, and that recent records can be updated later.

Read our guide to [understanding a property's sold-price history](/articles/what-property-sold-price-history-can-tell-you).

## 3. Read the Energy Performance Certificate

An EPC records the home's energy-efficiency rating, relevant property features and suggested improvements. Check the inspection date, current score, potential score, floor area, heating and insulation entries. The estimated costs use standard assumptions, so they are not a prediction of your personal bills. A valid EPC can be up to ten years old; compare it with what you see during the viewing.

## 4. Check the council tax band and likely charge

Confirm the official band for the exact address, then find the current standard charge published by the billing authority. Discounts, exemptions, council tax support and parish precepts can affect the final bill. UKHomePack does not substitute an estimated band when an exact official VOA match cannot be found. You can use our [council tax band checker](/council-tax) as a starting point.

## 5. Search planning applications

Check applications at the property, on the street and around the immediate area. Look at the application address, proposal, status, decision documents and plans rather than relying on a short description alone. An approved extension may be useful context; a pending development nearby may affect your plans or view of the area. Always confirm material findings on the council's planning register.

## 6. Investigate flood risk

Check long-term risk from rivers and the sea, surface water, reservoirs and groundwater where data is available. Area-level mapping does not tell you whether an individual building will flood, and it will not cover every possible source such as a blocked drain or burst pipe. Ask the seller about any history, discuss insurance early and let your conveyancer advise on an appropriate environmental or flood search.

## 7. Look at local crime data carefully

Use several months of data and compare categories rather than reacting to one figure. Police.uk locations are deliberately anonymised and approximate, while reporting patterns and local geography affect comparisons. Visit the street at different times and consider lighting, routes home, parking and how the immediate surroundings feel to you.

## 8. Research schools and admissions

Distance is not the same as eligibility. Check the local authority's current admissions rules, published priority areas, previous allocation information and the school's own website. Read the latest inspection material and performance data in context, then visit if possible. Admissions can change from year to year, so never treat a nearby school as a guaranteed place.

## 9. Check broadband availability

If reliable internet matters, check the exact address rather than the postcode alone. Compare the predicted technology and speed with packages actually offered by providers. Ask what connection is installed and, during a second viewing, consider testing the current service with the seller's permission. Ofcom notes that actual availability and speeds may differ from predictions.

## 10. Test mobile coverage

Check each network you rely on and distinguish indoor from outdoor predictions. Building materials, trees, terrain, network load and even the room you are standing in can affect reception. Test calls and data on your own phone during the viewing where possible.

## 11. Visit the area more than once

Return on a weekday, at rush hour and in the evening. Listen for road, rail, aircraft, hospitality or industrial noise. Check parking pressure, public transport, walking routes, local shops, green space and the journey to work or school. A ten-minute visit at midday rarely gives the whole picture.

## 12. Arrange the right searches and survey

A property report supports early research; it is not a survey or conveyancing search. After an offer is accepted, your conveyancer usually arranges local authority, water and drainage, and environmental searches, with specialist searches where appropriate. A qualified surveyor physically inspects the property's condition. Your lender's valuation is primarily for the lender and is not a substitute for your own survey.

## A sensible order for these checks

Do quick address, price, EPC, council tax, planning, flood and connectivity research before or soon after viewing. If you remain interested, revisit the area and prepare focused questions. Once your offer is accepted, instruct your conveyancer promptly and choose a survey suitable for the property's age, construction and condition.

You can [view a sample UKHomePack report](/sample) before ordering, or [research an address](/tool) when you have a property in mind.

## Frequently asked questions

### What should I check before making an offer?

At minimum, confirm the tenure, broad running costs, sold-price context, EPC, obvious condition, planning activity, flood information and whether the location works for you. Leave legal title, formal searches and building condition to the appropriate professionals.

### Is a mortgage valuation enough?

No. A mortgage valuation is for the lender. It may be brief and does not provide the same condition assessment as a survey commissioned for you.

### Can online checks replace a conveyancer or surveyor?

No. They help you ask better questions and decide where to investigate, but they do not replace legal searches, title enquiries, a physical survey or professional advice.

## Sources and further reading

- [GOV.UK: buying a home](https://www.gov.uk/buying-a-home)
- [GOV.UK: making an offer, searches and surveys](https://www.gov.uk/buying-a-home/making-an-offer)
- [HM Land Registry Price Paid Data](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads)
- [RICS home surveys](https://www.rics.org/consumer-guides/house-surveys-uk-the-costs-types-and-benefits-of-an-rics-home-survey)`,
  },
  {
    slug: 'how-to-research-an-area-before-moving-home',
    title: 'How to Research an Area Before Moving Home',
    excerpt: 'A practical method for comparing neighbourhoods, checking everyday journeys and spotting issues that a short property viewing can miss.',
    category: 'Property research',
    tags: ['research an area', 'moving home', 'neighbourhood research', 'local area'],
    imageUrl: `${IMAGE}/research-area-before-moving.jpg`,
    imageAlt: 'A couple exploring shops, transport and green space in a British neighbourhood',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Research an Area Before Moving Home',
    seoDescription: 'Research a neighbourhood before moving: compare journeys, schools, planning, crime, noise, connectivity and everyday amenities.',
    status: 'draft', featured: false,
    content: `The right home in the wrong place can become an expensive compromise. Before moving, research the neighbourhood with the same care you give the property. Online records will narrow the questions; repeated visits show how the area actually works for you.

## Define what matters before you search

Write down your non-negotiables and preferences. Include journey times, schools, outdoor space, parking, shops, healthcare, noise, broadband, mobile reception and access to family. Give each one a priority. This prevents an attractive kitchen or optimistic estate-agent description from crowding out the practical decision.

## Test real journeys

Map the commute at the time you would normally travel. Check walking routes to stations and stops, the last service home, interchange time and how often buses or trains are cancelled. If you drive, consider school traffic, parking restrictions, charging and alternative routes.

Walk the route yourself where possible. A journey that looks simple on a map may involve an unlit path, busy crossing or steep hill.

## Visit at different times

Make at least one weekday and one evening visit. If weekends matter, visit then too. Listen for road, rail, aircraft, hospitality, deliveries, schools, sports grounds and industrial activity. Look at parking pressure, street lighting and pedestrian activity.

Bad weather is useful research. It can reveal standing water, traffic problems and how exposed a route feels. Do not trespass or disturb residents; observe from public places.

## Check planning and development

Search current and recent [planning applications near the property](/articles/how-to-check-planning-applications-near-property). A new development may bring homes, traffic or useful facilities. Read the council documents and distinguish an early proposal from approved work.

Also look for the local plan and major transport or regeneration proposals. These can shape an area even where no detailed planning application has been submitted.

## Put crime figures in context

Review several months and separate crime categories. Police.uk locations are approximate and anonymised, so a map point is not an incident at a specific house. Compare similar areas over the same period and look at the character of nearby land uses.

Use the data to prompt sensible observations about routes, lighting, storage and building access. Our guide explains [how to check crime rates before buying](/articles/how-to-check-crime-rates-before-buying-house) without turning one headline figure into a verdict.

## Research schools properly

If schools matter, check admissions rather than proximity alone. Contact the local authority about current criteria, deadlines and previous allocation information. Read recent inspection material and performance data in context, then visit. A nearby school is not a guaranteed place.

## Check everyday services

Look beyond a list of pins. Ask whether a GP practice is accepting patients, whether the nearest supermarket fits your normal routine and whether childcare hours work with your commute. Check pharmacies, dentists, green space, leisure facilities and deliveries that you actually use.

For rural or edge-of-town locations, consider winter access, fuel options, septic tanks, private roads and the distance to emergency or routine services where relevant.

## Test broadband and mobile reception

Check the exact address with Ofcom and providers. Predictions are useful, but actual service can differ. If connectivity is important, test your mobile inside the property and ask about the installed broadband connection. Read our guides to [broadband availability](/articles/how-to-check-broadband-availability-before-moving) and [mobile signal](/articles/how-to-check-mobile-signal-at-new-address).

## Consider running costs and environmental information

Confirm the council tax band and published charge, while allowing for household-specific adjustments. Review the EPC for energy characteristics and check official flood information. If environmental concerns arise, ask your conveyancer which formal searches or specialist reports are appropriate.

## Compare areas consistently

Create the same one-page scorecard for every shortlist:

- door-to-door journeys at relevant times;
- housing cost and likely running costs;
- school and childcare position;
- broadband and mobile results;
- planning and flood questions;
- crime categories over a consistent period;
- parking, noise and local facilities;
- what you observed on each visit;
- unresolved questions and who can answer them.

A scorecard will not make the choice for you, but it exposes trade-offs that are easy to overlook.

## Frequently asked questions

### How many times should I visit an area before buying?

There is no fixed rule, but one daytime visit is rarely enough. Visit at different times and make at least one journey you expect to use regularly.

### Can online area guides be trusted?

Use them for ideas, then verify important claims with original sources and your own visits. Commercial rankings may use broad areas or methods that do not reflect your priorities.

### Should I speak to neighbours?

A polite general conversation can be useful, but respect privacy and treat individual opinions as personal experience rather than objective fact.

## Useful next steps

See what local records are brought together in a [sample UKHomePack report](/sample), then [research the exact property address](/tool) when you have a shortlist.

## Sources and further reading

- [GOV.UK: how to buy a home](https://www.gov.uk/government/publications/how-to-buy-a-home)
- [Ofcom mobile and broadband checker](https://checker.ofcom.org.uk/)
- [Police.uk: about published crime data](https://data.police.uk/about/)`,
  },
  {
    slug: 'what-does-council-tax-band-c-mean',
    title: 'What Does Council Tax Band C Mean?',
    excerpt: 'Understand how Band C is set in England and Wales, why the charge varies by council and what can change the amount on your bill.',
    category: 'Council tax',
    tags: ['council tax band C', 'council tax', 'moving home', 'property costs'],
    imageUrl: `${IMAGE}/council-tax-band-c.jpg`,
    imageAlt: 'A homeowner reviewing council tax paperwork beside house keys and a calculator',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'Council Tax Band C Explained: Charges and Checks',
    seoDescription: 'Find out what Council Tax Band C means, how bands are assessed in England and Wales and why the annual charge varies by address.',
    status: 'draft', featured: false,
    content: `Council Tax Band C is a property valuation band used by local authorities when calculating council tax. It does not have one national price. The annual Band C charge depends on the billing authority, financial year and any local precepts, while discounts or exemptions can change the household's final bill.

## Band C in England

In England, council tax bands are based on the value a domestic property would have had on 1 April 1991. Band C covers the 1991 value range from £52,001 to £68,000. That is not the property's present market value and it should not be compared directly with today's asking price.

## Band C in Wales

Wales uses a different valuation date and ranges. Band C covers values from £65,001 to £91,000 as at 1 April 2003. Wales also has Band I, while England runs from Band A to Band H.

The Valuation Office Agency maintains bands in England and Wales. Scotland has its own council tax valuation system, and Northern Ireland uses domestic rates rather than council tax.

## How the annual charge is calculated

Each council sets a Band D amount for the year. Charges for the other bands are calculated as proportions of Band D. In England, Band C is normally eight-ninths of Band D. The bill can include amounts for the billing authority and other bodies such as county, police, fire or parish authorities.

Because those amounts vary locally, a Band C property in one council area can have a different standard charge from a Band C property elsewhere.

Use the [UKHomePack council tax checker](/council-tax) to look for the exact official band and available published charge for an address. If an exact band cannot be confirmed, the checker does not replace it with a guess.

## Why your bill may differ from the standard charge

The published band charge is not always the amount a household pays. The final bill may be affected by:

- the number and circumstances of adult residents;
- a single-person discount;
- exemptions or disregarded residents;
- council tax reduction or support;
- disability-related reductions;
- empty-home or second-home rules;
- parish or local precepts;
- part-year occupation, moving dates and account adjustments.

Ask the council about your circumstances. Do not assume the seller's payment will be the same as yours.

## Can a band change?

Yes, in defined circumstances. The VOA may review a band after a property change or challenge. Alterations made by an owner do not always change the band immediately; a review may occur after a later sale. Splitting or combining dwellings can also affect banding.

Before challenging a band, read the official eligibility and evidence requirements. A review can result in the band staying the same, decreasing or increasing. Be cautious of firms that demand large advance payments or guarantee a reduction.

## What buyers should check

1. Confirm the band against the exact address, including the flat number.
2. Check the current tax year and billing authority.
3. Note whether the amount includes a parish or other local precept.
4. Budget using the standard charge unless the council confirms your eligibility for a reduction.
5. Ask about any proposed rebanding or completion notice where the property is new or altered.

Council tax is one of several running costs to consider alongside energy, insurance, service charges, broadband and maintenance. A [UKHomePack property report](/tool) brings the available band and other records together for early research.

## Frequently asked questions

### Is Band C expensive?

It sits below Band D in the band structure, but “expensive” depends on the council's charge and your budget. Compare the actual annual figure for the address rather than the letter alone.

### Does Band C mean the home is worth £52,001 to £68,000 now?

No. In England, that range relates to the property's notional value on 1 April 1991. Wales uses different 2003 ranges.

### Is the council tax band shown in an estate-agent listing reliable?

Verify it against the official record for the exact address. Listings can contain errors or omit complications involving flats, annexes or new homes.

### Who should I contact about my bill?

Contact the local council about payments, discounts and liability. Contact the VOA about the valuation band in England and Wales.

## Sources and further reading

- [GOV.UK: how domestic properties are assessed for council tax](https://www.gov.uk/guidance/understand-how-council-tax-bands-are-assessed)
- [GOV.UK: council tax bands and challenges](https://www.gov.uk/council-tax-bands)
- [Check a council tax band by address](/council-tax)`,
  },
  {
    slug: 'how-to-check-broadband-availability-before-moving',
    title: 'How to Check Broadband Availability Before Moving',
    excerpt: 'Check broadband at an exact address, understand predicted speeds and confirm the service you can actually order before moving home.',
    category: 'Connectivity',
    tags: ['broadband availability', 'moving home', 'internet speed', 'Ofcom checker'],
    imageUrl: `${IMAGE}/check-broadband-availability.jpg`,
    imageAlt: 'A homebuyer testing broadband equipment and a laptop among moving boxes',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Broadband Availability Before Moving',
    seoDescription: 'Check broadband at a new address, interpret predicted speeds and confirm which services and packages can actually be ordered.',
    status: 'draft', featured: false,
    content: `Broadband can vary between neighbouring properties, so check the exact address before moving—not just the postcode or an area's advertised maximum. Use independent coverage information to understand the likely technology, then confirm what providers will actually sell to that property.

## Start with an address-level check

Enter the full address into the Ofcom checker and note the predicted broadband types, maximum download and upload speeds, and whether availability is widespread or limited. Ofcom explains that these are the fastest estimated speeds predicted by network operators; actual availability and speeds can be different.

A [UKHomePack property report](/tool) presents available Ofcom connectivity information with the property's other records. Treat it as a research snapshot, then confirm the current packages directly.

## Understand the speed categories

Ofcom groups fixed broadband into categories. Standard broadband is below 30 Mbps download, superfast is 30 to 300 Mbps, and ultrafast is above 300 Mbps. The label alone does not tell you the upload speed, latency, reliability or price.

Think about your household's simultaneous use. Video calls, cloud backups, gaming and large uploads can make upload speed and latency as important as headline download speed.

## Check which technology reaches the property

Common connections include copper-based ADSL, fibre to the cabinet, full fibre to the premises, cable, fixed wireless, mobile broadband and satellite. “Fibre” in marketing does not always mean fibre enters the home.

Ask the seller or agent:

- which provider and package is currently used;
- where the line or fibre enters the property;
- whether an optical network terminal is installed;
- whether there have been faults or installation difficulties;
- whether any equipment must remain after completion.

Their experience is useful but does not guarantee that the same package will remain available to you.

## Confirm with providers

Run checks with several providers using the exact address. Look for a package you can order, its estimated speed range, minimum guaranteed speed where stated, setup cost, contract term and installation date.

If a provider only recognises the postcode, contact it before relying on the result. New-builds, flats, conversions and named properties are more likely to have address-matching or installation complications.

## Test the existing service where possible

With the seller's permission, run a wired or Wi-Fi speed test during a second viewing and ask where the router is placed. A Wi-Fi test reflects both the incoming service and the in-home network, so a poor result may be caused by thick walls, distance or old equipment rather than the external line.

Large or unusual homes may need access points, mesh equipment or cabling. Budget for that separately from the broadband package.

## Plan for the move date

Contact the chosen provider early. Installation may require an engineer, wayleave, landlord or managing-agent permission, especially in flats. Do not assume an active connection will transfer automatically or that the previous occupier's provider can start your service immediately.

If you work from home, plan a fallback such as tethering or temporary mobile broadband—but first [check mobile coverage at the address](/articles/how-to-check-mobile-signal-at-new-address).

## Questions for home workers

- What is the predicted upload speed?
- Is full fibre actually orderable at this address?
- Is there a minimum guaranteed speed for the chosen package?
- Where is the router or network terminal located?
- Does the likely workspace have reliable wired or Wi-Fi coverage?
- How long will activation or installation take?
- What backup will you use if installation is delayed?

## Frequently asked questions

### Is the advertised “up to” speed what I will receive?

Not necessarily. Check the provider's address-specific estimate and contractual information. Line conditions, network management and the home network can affect performance.

### Can two houses on the same street have different broadband?

Yes. They may connect to different infrastructure, have different installed lines or face different provider availability.

### Does an Ofcom result guarantee service?

No. It is independent coverage information based on operator predictions. Confirm availability, price and installation with the provider.

## Sources and further reading

- [Ofcom mobile and broadband checker](https://checker.ofcom.org.uk/)
- [UKHomePack broadband checker](/broadband)
- [Research the wider area before moving](/articles/how-to-research-an-area-before-moving-home)`,
  },
  {
    slug: 'how-to-check-mobile-signal-at-new-address',
    title: 'How to Check Mobile Signal Coverage at a New Address',
    excerpt: 'Compare voice, 4G and 5G predictions by network, then test indoor coverage before relying on a mobile signal at your new home.',
    category: 'Connectivity',
    tags: ['mobile coverage', 'mobile signal', 'moving home', '5G coverage'],
    imageUrl: `${IMAGE}/check-mobile-signal.jpg`,
    imageAlt: 'A homebuyer testing mobile signal beside a bay window in an empty British house',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Mobile Signal at a New Address',
    seoDescription: 'Compare voice, 4G and 5G coverage predictions by network and test indoor mobile reception before moving home.',
    status: 'draft', featured: false,
    content: `A mobile signal can change from one network to another, between the front and back of a house, and from outdoors to indoors. Before moving, compare independent predictions for each network you use and test your own phone inside the property where possible.

## Check the exact location

Use Ofcom's mobile checker with the postcode or map location. Compare voice and data results for each major network, paying attention to indoor and outdoor predictions. A general claim that an area “has 5G” is not enough if you need reliable calls in a ground-floor study.

UKHomePack presents available Ofcom predictions in its [property reports](/tool) and dedicated [mobile coverage checker](/mobile). The information is useful for comparison but is not a guarantee of reception.

## Compare networks separately

Networks use different masts, frequencies and planning assumptions. Your current provider may be weak where another is strong. Check every network you might realistically use rather than assuming the largest advertised coverage will suit the precise address.

If more than one household member depends on mobile service, compare their networks and devices. Wi-Fi calling may help indoors, but it depends on compatible equipment, account settings and a working broadband connection.

## Indoor and outdoor coverage are different

Walls, foil-backed insulation, coated glazing, basements and the position of the room can weaken a signal. A prediction of good outdoor reception does not promise the same result inside. Upper floors and windows may perform differently from the centre of the building.

Flats can add further variables: height may improve line of sight, while reinforced concrete or neighbouring buildings may interfere.

## Test during a viewing

With permission, make a call and load a webpage in the rooms where reception matters. Check the kitchen, bedrooms, home office and garden rather than relying on the hallway. Repeat if the first viewing is unusually quiet, because network load changes.

The bars on a phone are not a standardised engineering measure. Test the activities you need: a voice call, messages, ordinary browsing and, if relevant, a short video call.

## Look beyond 5G

5G availability can be useful, but dependable 4G may matter more for everyday use. Check voice coverage as well as data, and remember that some phones display a technology icon even when performance is limited.

If you plan to use mobile broadband as the main home connection, ask the network about address-specific availability, expected speeds, data limits, router placement and external antennas. Test before committing to a long contract.

## Understand prediction limits

Ofcom periodically updates its checker with predictions supplied by mobile network operators. It notes that real-life experience may differ. Terrain, buildings, vegetation, weather, device capability and network demand all play a part.

This means a map is a sensible first check, not proof that a particular room will receive a reliable service.

## Make a connectivity plan

For important home-working or care needs, avoid relying on one connection. Check [fixed broadband availability](/articles/how-to-check-broadband-availability-before-moving), Wi-Fi calling and a second network as possible backup. Confirm whether the property has suitable places for a router and whether mobile reception works during a broadband outage.

## Frequently asked questions

### Which mobile network is best at my new address?

There is no single best network everywhere. Compare predictions for the exact location, then test likely networks indoors before choosing.

### Does 5G mean faster service throughout the house?

No. Coverage, capacity, frequency, building materials and device capability affect performance. Good 4G can sometimes be more consistent.

### Can I test without changing contract?

Consider a pay-as-you-go SIM or eSIM where available, subject to device compatibility and provider terms. Test in the rooms and at the times that matter.

## Sources and further reading

- [Ofcom mobile and broadband checker](https://checker.ofcom.org.uk/)
- [Ofcom mobile checker frequently asked questions](https://www.ofcom.org.uk/mobile-coverage-checker/frequently-asked-questions)
- [Check broadband information for an address](/broadband)`,
  },
  {
    slug: 'what-property-sold-price-history-can-tell-you',
    title: "What Can You Learn from a Property's Sold Price History?",
    excerpt: 'Learn how to use recorded sale prices and recent street transactions without mistaking historic data for a current property valuation.',
    category: 'Property research',
    tags: ['sold price history', 'Land Registry', 'house prices', 'property research'],
    imageUrl: `${IMAGE}/property-sold-price-history.jpg`,
    imageAlt: 'A homebuyer comparing an abstract chart of previous property sales on a laptop',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'What Property Sold Price History Can Tell You',
    seoDescription: 'Use Land Registry sold-price history and recent street sales as context when researching a property, while avoiding common mistakes.',
    status: 'draft', featured: false,
    content: `A property's sold-price history can show when it changed hands and the amount recorded for qualifying transactions. Used carefully, it provides context for an asking price and prompts useful questions. It is not a current valuation and it does not explain the condition or circumstances of each sale.

## What HM Land Registry records

HM Land Registry Price Paid Data covers property sales in England and Wales that were sold for value and lodged for registration. Records include the price, transaction date and address, with fields such as property type and tenure category.

The data excludes some transactions and can be updated after its first publication. A recent completion may not appear immediately. HM Land Registry itself says the data is not guaranteed to be error-free or fit for every purpose.

## What one property's history can reveal

The sequence of sale dates and prices may help you see:

- how long the current owner appears to have held the property;
- whether the home has sold several times in a short period;
- the recorded price at earlier market points;
- whether a transaction was categorised as a new build;
- whether the recorded tenure was freehold or leasehold;
- questions to ask about changes since the last sale.

A long gap is not inherently positive or negative. A quick resale may have an ordinary explanation. Treat patterns as prompts, not conclusions about the property or seller.

## Compare recent sales on the street

Nearby transactions can help frame the asking price, especially where homes are similar. Compare the closest equivalents by property type, size, tenure, plot, parking, extension and condition. A renovated detached home is not a sensible comparator for an unmodernised semi simply because both share a postcode.

Sale date matters. Market conditions, mortgage rates and local supply can move between transactions. If a comparable sold months ago, note what changed since then.

UKHomePack reports can show the exact property's available history and recent recorded sales on the same street. [View the sample report](/sample) to see the presentation.

## Price history is not a valuation

A valuation estimates current value for a defined purpose and date. Price Paid Data tells you what was recorded for past qualifying sales. It does not inspect the building, measure it, account for every improvement or explain whether the sale involved unusual circumstances.

Automated estimates can also miss important differences. If value is critical, consider advice from a suitable local professional and remember that a lender's valuation is primarily for the lender.

## Check that the address really matches

House names, flats, converted buildings and reused postcodes can cause mistakes. Confirm the house number, street, postcode and any secondary address such as a flat number. Do not substitute a neighbour's transaction because the target property has no result.

Where the recorded price looks surprising, check the official source and consider whether an address has changed. You can report suspected errors to HM Land Registry through its published process.

## Useful questions to ask

- What has changed since the last recorded sale?
- Was an extension, conversion or major refurbishment completed?
- Are planning and building-regulations documents available?
- Is the tenure consistent with the seller's information?
- How similar are the recent street comparables in practice?
- Is a very recent transaction still missing from the monthly data?

Combine these answers with the EPC, planning record, survey, legal title and your own viewings.

## Frequently asked questions

### How quickly does a sold price appear?

There can be a delay between completion, registration and publication. The dataset is updated monthly and earlier releases can be revised.

### Why is a sale missing?

It may not yet have been lodged or published, may be excluded from Price Paid Data, or may be recorded under an address variation. Missing data does not mean no sale occurred.

### Can sold prices tell me what to offer?

They provide evidence and context, but your offer also reflects current market conditions, competition, condition, tenure, survey findings and your own budget.

## Sources and further reading

- [HM Land Registry Price Paid Data](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads)
- [GOV.UK: check property price trends](https://www.gov.uk/check-house-price-trends)
- [Research a property address with UKHomePack](/tool)`,
  },
  {
    slug: 'property-searches-vs-surveys-vs-property-reports',
    title: "Property Searches vs Surveys vs Property Reports: What's the Difference?",
    excerpt: 'Understand what conveyancing searches, home surveys, lender valuations and online property reports each do—and why buyers may need several.',
    category: 'Buying a property',
    tags: ['property searches', 'home survey', 'property report', 'buying a house'],
    imageUrl: `${IMAGE}/searches-surveys-reports.jpg`,
    imageAlt: 'A homebuyer organising separate property search, survey and research documents',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'Property Searches vs Surveys vs Property Reports',
    seoDescription: 'Compare conveyancing searches, home surveys, valuations and online property reports so you know what each check covers when buying.',
    status: 'draft', featured: false,
    content: `Property searches, home surveys and online property reports answer different questions. A search deals with legal, environmental or infrastructure information. A survey involves a physical inspection of condition. A property report brings available records together for early research. One does not replace the others.

This guide describes the buying process in England and Wales. Scotland and Northern Ireland use different systems and terminology.

## What are conveyancing searches?

After an offer is accepted, your solicitor or conveyancer usually orders searches for the property. GOV.UK identifies local authority, water and drainage, and environmental searches as common examples. Depending on the location and your circumstances, your legal professional may advise additional flood, mining, chancel, infrastructure or other specialist searches.

Searches can reveal matters such as local land charges, planning entries, road proposals, drainage connections and environmental risks within the scope of the product ordered. They are used as part of the legal due-diligence process and may be required by a mortgage lender.

Ask your conveyancer which searches are being ordered, what area and date they cover, and what is outside scope.

## What is a home survey?

A home survey is commissioned for the buyer and carried out by a qualified surveyor after a physical inspection. RICS offers Level 1, Level 2 and Level 3 Home Surveys with different inspection and reporting depth. The appropriate choice depends on the property's age, construction, condition, complexity and your plans.

A survey can identify visible defects, risks and areas that need further investigation. It does not expose every concealed problem, and the exact scope depends on the service agreed. Read the terms before instructing the surveyor and tell them about concerns raised by your viewing or research.

## Is a mortgage valuation a survey?

No. A lender's valuation helps the lender decide whether the property is adequate security for the loan. It is not commissioned to provide you with a comprehensive condition assessment, and it may involve only a limited inspection or automated process.

Even if you receive a copy, do not assume it gives the protection or detail of a survey commissioned for you.

## What is an online property report?

An online report such as UKHomePack brings available public and official records together around an address. Depending on source coverage, that can include sold-price history, EPC information, council tax, planning applications, flood information, crime, schools, broadband and mobile predictions.

It is most useful before or soon after a viewing, when you want to screen an address and prepare better questions. It does not check legal title, commission formal searches, inspect the structure or give legal advice.

[View a sample UKHomePack report](/sample) to see the data, source notes and limitations before ordering one.

## How the checks complement one another

Imagine an online report identifies an older EPC, a nearby planning application and area-level flood information. You might ask the seller what energy work has been completed, read the council planning file, request an insurance quotation and tell your conveyancer about the flood concern. Your conveyancer can advise on formal searches, while your surveyor considers visible condition and any relevant building features.

The online report helped you spot the questions. The searches and legal enquiries address the legal and environmental process. The survey addresses physical condition. Each has a different job.

## A sensible buying sequence

### Before making an offer

Research the property and area, review the EPC and recorded history, check obvious planning and flood information, visit more than once and form an initial budget.

### After the offer is accepted

Instruct a conveyancer promptly, arrange mortgage finance and choose an appropriate survey. Tell both professionals about anything that concerned you during research or viewing.

### Before exchange

Read the survey, searches, title information and replies to enquiries. Resolve issues you consider material, confirm insurance and finance, and ask your conveyancer to explain anything you do not understand. In England and Wales, the offer is not legally binding until exchange of contracts.

## Comparison at a glance

| Check | Main purpose | Physical inspection? | Legal due diligence? |
| --- | --- | --- | --- |
| Online property report | Early research and questions | No | No |
| Conveyancing searches | Legal, environmental and infrastructure information within scope | Usually no | Yes, as part of conveyancing |
| Home survey | Visible condition, defects and risks within scope | Yes | No |
| Mortgage valuation | Lender's security decision | Sometimes limited | No |

## Frequently asked questions

### Do I need both searches and a survey?

They cover different risks. Your conveyancer and surveyor can advise on the services appropriate to the property and your purchase.

### Can a property report replace local authority searches?

No. Public planning information and other online records are useful research, but they are not a formal local authority search or legal opinion.

### Which survey level should I choose?

It depends on the property and your concerns. RICS says age, size, condition, complexity and originality are relevant; ask a qualified surveyor to recommend the appropriate service.

### When should I order a property report?

Use it during early research, before an offer or soon after, so the findings can guide viewings and questions. [Research an address](/tool) when you have a property in mind.

## Sources and further reading

- [GOV.UK: searches, valuations and surveys](https://www.gov.uk/buying-a-home/making-an-offer)
- [RICS: home survey levels](https://www.rics.org/consumer-guides/house-surveys-uk-the-costs-types-and-benefits-of-an-rics-home-survey)
- [UKHomePack buyer guide](/buyer-guide)`,
  },
  {
    slug: 'how-to-check-crime-rates-before-buying-house',
    title: 'How to Check Crime Rates Before Buying a House',
    excerpt: 'Learn how to read local crime figures before moving, compare areas fairly and understand why street-level crime locations are approximate.',
    category: 'Property research',
    tags: ['crime rates', 'moving area', 'police data', 'property research'],
    imageUrl: `${IMAGE}/check-crime-rates.jpg`,
    imageAlt: 'A homebuyer viewing an abstract crime map on a phone in a British residential street',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Crime Rates Before Buying a House',
    seoDescription: 'A practical guide to checking local crime data, comparing areas and understanding anonymised Police.uk locations before you move.',
    status: 'draft', featured: false,
    content: `Crime data can help you understand an area before buying a house, but a single number rarely tells the full story. The useful questions are: what types of incident are recorded, over what period, across which area, and how does that pattern compare with places you already know?

## Start with the exact address

Use the property's postcode or coordinates to find nearby recorded incidents. A broad town-wide total can be misleading: a busy station, shopping area or night-time venue may influence the figures while sitting some distance from the street you are considering.

A [UKHomePack property report](/tool) organises available Police.uk records around the address alongside other local information. Treat the result as context for further research, not as a safety rating.

## Look at several months, not one

Monthly data can move sharply because of seasonal activity, a single group of related incidents or delays in publication. Review a longer period and look for persistent patterns. Ask whether a category is repeatedly present, broadly stable or concentrated around a particular public place.

Avoid comparing one month in one area with a full year in another. Use the same timeframe and a similar search radius.

## Compare crime categories

An overall count combines incidents that may have very different relevance to you. Separate burglary, vehicle crime, anti-social behaviour, violence and sexual offences, criminal damage, shoplifting and other categories. Read the category definitions before drawing conclusions.

For example, a retail centre can generate shoplifting records that say little about a residential side street. Anti-social behaviour may include a wide range of reported situations. A category label is a starting point, not a detailed account of an event.

## Understand anonymised locations

Police.uk does not publish the exact location of a street-level crime. It replaces the real coordinates with a nearby anonymous map point, chosen to protect privacy. The published point may be the centre of a street or a public or commercial place. Dates are normally shown by month rather than by day.

That means a marker beside a property does not prove that an incident happened at that address. Likewise, the absence of a marker immediately outside a house does not prove that nothing happened nearby.

## Compare like with like

Raw totals reflect the size and character of an area. A dense city neighbourhood, transport hub or entertainment district is not directly comparable with a small residential village. Where a rate per population is available, use it alongside the count—but remember that daytime visitors and commuters may not be represented by the resident population.

Useful comparisons include:

- the same radius around two shortlisted properties;
- the same crime categories over the same months;
- residential streets with similar density and nearby facilities;
- local figures alongside the wider police-force or national context.

## Add real-world checks

Visit during the day and evening. Walk the route from the station or bus stop. Look at street lighting, sight lines, alleys, parking, cycle storage and how secure the property's doors and windows appear. If you can, speak to people who live locally without asking them to disclose personal or sensitive information.

For flats, ask how entry doors, communal areas, parcel deliveries, car parks and bike stores are managed. Your insurer may also ask about locks, alarms or previous claims.

## Questions worth asking

- Has the seller experienced burglary, attempted entry or repeated anti-social behaviour at the property?
- Are there security systems, shared-entry problems or parking issues?
- Do the figures appear tied to a station, shopping area, venue or another local feature?
- Are incidents rising consistently, or is the apparent change caused by a short period?
- Would better locks, lighting or storage be needed after moving in?

Ask these questions neutrally. Recorded crime is an imperfect measure and should not be used to stereotype residents or dismiss an area without context.

## What local crime data cannot tell you

Published figures do not capture unreported incidents. They do not tell you exactly what occurred at an anonymised point, and an outcome shown later may not be the final result of a case. Data quality and publication timing depend on the forces supplying the information.

Crime figures are therefore one part of [researching an area before moving](/articles/how-to-research-an-area-before-moving-home), alongside transport, schools, planning, noise, connectivity and your own visits.

## Frequently asked questions

### Are Police.uk crime locations exact?

No. Street-level locations are approximate and anonymised. They must not be treated as an incident at a particular house.

### How many months should I check?

There is no perfect period, but several months gives a more useful view than a single snapshot. Use an identical period when comparing properties.

### Does a lower recorded count mean an area is safer?

Not automatically. Reporting, population, visitors, local land use and the search area all influence the figure. Use the data to ask questions, not to make a definitive safety judgement.

## Sources and further reading

- [Police.uk: about the data and location anonymisation](https://data.police.uk/about/)
- [Police.uk data downloads](https://data.police.uk/data/)
- [See the local-area checks in a sample report](/sample)`,
  },
  {
    slug: 'how-to-check-schools-near-property-before-moving',
    title: 'How to Check Schools Near a Property Before Moving',
    excerpt: 'A practical guide to finding nearby schools, checking admissions and inspection information, and avoiding assumptions about catchment areas.',
    category: 'Property research',
    tags: ['schools near property', 'school admissions', 'moving with children', 'Ofsted'],
    imageUrl: `${IMAGE}/check-schools-near-property.jpg`,
    imageAlt: 'A parent and child walking towards a British primary school',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Schools Near a Property Before Moving',
    seoDescription: 'Find schools near a property and check admissions, inspection and performance information before moving home with children.',
    status: 'draft', featured: false,
    content: `Finding a school nearby is easy. Working out whether it is suitable—and whether your child could obtain a place—takes more care. Before moving, check the schools around the exact address, then verify admissions with the local authority and the school.

## Find every realistic option

Search for primary, secondary, special and all-through schools around the property. Include schools just beyond the obvious radius, because walking routes, transport and admissions boundaries do not follow neat circles.

A [UKHomePack report](/tool) can show nearby schools and available inspection information for an address. Use that as a shortlist, then follow each school to its current official record.

## Distance is not the same as a place

Living close to a school does not guarantee admission. Oversubscribed schools apply published criteria, which may prioritise looked-after children, siblings, faith, a defined priority area or distance measured by a particular method. Some schools manage their own admissions; others use the local authority.

Ask the local council for:

- the current admission arrangements;
- the application timetable;
- how distance is measured;
- previous allocation distances, where published;
- information about waiting lists and appeals;
- the process for an in-year application if you are moving mid-year.

Past allocation information is useful context, not a promise for the next intake.

## Read inspection information in context

Check the latest official inspection material and its date. A school may have changed leadership, curriculum or circumstances since an older inspection. In England, Ofsted's area explorer can help families find schools and inspection information. Other UK nations use different inspectorates and admissions systems.

Do not reduce a school to one grade. Read what inspectors say about quality, behaviour, leadership, safeguarding and areas for improvement. If a grade is not available, that is not itself a judgement about the school.

## Use performance data carefully

Government performance tables can show attainment, progress, absence and pupil information for schools in England. The measures differ by phase and change over time. Cohort size, pupil needs and the disruption affecting a particular year can matter.

Look for a rounded picture rather than ranking nearby schools by one number. A school visit and discussion about your child's needs may be more useful than a small difference in a published measure.

## Visit the school and test the journey

Attend an open day where possible. Consider the atmosphere, support, curriculum, clubs, wraparound care and how the school communicates with families. Ask about special educational needs provision if relevant.

Travel from the prospective property at the correct time of day. A short map distance may involve a difficult crossing, steep route or congested road. Check public transport and what the school-run traffic is like around the home you are considering.

## Check what could change nearby

Search planning applications for new housing, changes to school sites and major developments that may affect local demand or travel. Councils plan school places, but a proposed development does not automatically mean a new school or guaranteed capacity.

If schools are central to your move, ask the local authority about published place-planning information and planned changes. Do not rely on an estate-agent description such as “in catchment” without verification.

## Build a family-specific shortlist

For each realistic school, record:

- official name and phase;
- admissions authority and criteria;
- application deadline or in-year process;
- measured route from the new address;
- latest inspection date and findings;
- performance measures you consider relevant;
- opening hours, clubs and wraparound care;
- SEND, language, faith or pastoral provision your family needs;
- notes from a visit.

This turns a vague search for “good schools” into a decision based on your child and your circumstances.

## Frequently asked questions

### Does living in a school's catchment guarantee a place?

No. Admissions depend on the published criteria and the number of applications. Priority-area status or proximity may improve priority but is not normally a guarantee.

### Where can I compare school performance?

For schools in England, use the government's Compare School Performance service. Scotland, Wales and Northern Ireland provide separate services.

### Should I rely on the latest inspection grade?

Use it as one source. Read the report, note the inspection date, visit the school and consider current information relevant to your child.

## Sources and further reading

- [GOV.UK: choosing schools and admissions](https://www.gov.uk/schools-admissions)
- [GOV.UK: compare school performance in England](https://www.gov.uk/school-performance-tables)
- [Ofsted: explore schools and local context](https://explore.ofsted.gov.uk/)
- [Research the wider area before moving](/articles/how-to-research-an-area-before-moving-home)`,
  },
  {
    slug: 'how-to-check-planning-applications-near-property',
    title: 'How to Check Planning Applications Near a Property',
    excerpt: 'Learn how to search nearby planning applications, read the documents that matter and distinguish proposals from approved development.',
    category: 'Planning and development',
    tags: ['planning applications', 'buying a house', 'local planning', 'property research'],
    imageUrl: `${IMAGE}/check-planning-applications.jpg`,
    imageAlt: 'A homebuyer reviewing planning drawings and a map beside a British residential street',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Planning Applications Near a Property',
    seoDescription: 'Find and understand planning applications near a house, including proposals, decisions, plans, conditions and council records.',
    status: 'draft', featured: false,
    content: `A planning search can reveal proposed building work, earlier alterations and development around a home. The key is to search the correct council register and read the supporting documents—not just the short description shown in a results list.

## Find the local planning authority

In England and Wales, planning applications that require permission are made public by the relevant council. Use the property's postcode to identify the local planning authority, then open its online planning register. Some addresses sit close to a council boundary, so also consider neighbouring authorities if a nearby site falls across it.

UKHomePack brings together applications returned by connected planning sources. Standard retail reports focus on the property and its street; business users can optionally include applications within 0.3 miles. Coverage varies, so material findings should always be checked on the council portal.

## Search in more than one way

Try the full address, street name, postcode and map search. Large sites may be recorded under a land description rather than a house number. A proposal behind the property might use a different road for access. Search a wider date range if you are checking alterations to the home itself.

Useful searches include:

- the exact property address;
- both sides of the street;
- adjoining roads and land behind the property;
- nearby schools, commercial sites or open land;
- application references mentioned in estate-agent particulars or seller documents.

## Understand the status

“Pending” means a decision has not yet been issued. “Approved” does not necessarily mean work has started, and “refused” may be followed by an appeal or a revised application. “Withdrawn” means the applicant stopped that application, not that the idea can never return.

Check the decision date, any appeal, and whether the permission is still capable of implementation. For approved applications, read the conditions and approved plans. A short summary rarely explains scale, layout or restrictions adequately.

## Open the documents

For an application that could affect your decision, look for:

- location and site plans;
- proposed elevations and floor plans;
- design and access statements;
- transport, noise, drainage, ecology or flood documents;
- neighbour comments, while treating personal views carefully;
- the planning officer's report;
- the decision notice and conditions;
- later applications to vary or discharge conditions.

Compare the plans with the view from the property. Direction, height, levels, trees and access routes matter more than a headline distance.

## Check the property's own history

Planning records may show extensions, loft conversions, outbuildings or changes of use. Ask the seller for the relevant permissions, building regulations approvals and guarantees. Some work may be permitted development and therefore absent from the normal application list; other records may sit under an older address.

Your conveyancer will handle the legal enquiries and searches. If you are worried about a particular alteration, tell them and your surveyor rather than assuming an online planning entry settles the point.

## Look beyond individual applications

A planning application search is not the same as a review of the local plan, conservation-area controls, listed status, compulsory purchase proposals or major infrastructure. Local authority searches ordered through your conveyancer address different matters, and specialist advice may be needed for land or development risk.

For a broader first look, combine planning with [flood information](/articles/how-to-check-flood-risk-before-buying-house), transport, noise and repeat visits to the area.

## Questions to ask before buying

- Is the application close enough to affect light, outlook, privacy, access or noise?
- Is it a proposal, an approval, a refusal, an appeal or completed work?
- Do the plans match the written description?
- Are there conditions controlling hours, materials, traffic or landscaping?
- Does the property itself appear to contain work that needs documents?
- Is a major scheme shown in a local plan even though no detailed application exists yet?

## Frequently asked questions

### How far from a property should I search?

There is no universal radius. Start with the property and street, then expand according to the setting. In open countryside or beside a large site, a proposal farther away may still be important; in a dense street, a close application may be screened from view.

### Does planning permission mean building work will happen?

No. Permission allows development subject to its terms, but the applicant may never implement it. Check dates, conditions and later records.

### Will every alteration appear online?

No. Older records may not be digitised, addresses change and some works do not require a planning application. Building regulations records are separate.

## Sources and further reading

- [GOV.UK: search the register of planning decisions](https://www.gov.uk/search-register-planning-decisions)
- [See how planning appears in a sample report](/sample)
- [Review all UKHomePack report features](/features)`,
  },
  {
    slug: 'how-to-check-flood-risk-before-buying-house',
    title: 'How to Check Flood Risk Before Buying a House',
    excerpt: 'A practical guide to checking river, sea, surface-water and other flood risks before buying, with questions for insurers and conveyancers.',
    category: 'Property research',
    tags: ['flood risk', 'buying a house', 'environmental search', 'home insurance'],
    imageUrl: `${IMAGE}/check-flood-risk.jpg`,
    imageAlt: 'A homebuyer checking an abstract flood map beside a river and British houses',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'How to Check Flood Risk Before Buying a House',
    seoDescription: 'Check river, sea, surface-water and other flood risks before buying a house, and know what to ask insurers and conveyancers.',
    status: 'draft', featured: false,
    content: `Flood risk is worth checking early because it can affect safety, insurance, mortgageability and future resale. Start with official area-level information, then involve your conveyancer, insurer and surveyor where the results or property history give cause for concern.

The services differ across the UK. This guide uses the Environment Agency service for England as its main example; Wales, Scotland and Northern Ireland provide separate national services.

## Check more than rivers and the sea

Official long-term information for England covers risk from rivers and the sea, surface water, reservoirs and groundwater where data is available. Surface-water flooding can occur well away from a river after heavy rain, particularly where water collects on roads or low ground.

No map covers every cause. The Environment Agency service does not assess the chance that an individual building will flood and does not cover events such as blocked drains or burst pipes.

## Use the exact address and inspect the map

Search the postcode, select the correct address and look closely at the property, access routes, garden and surrounding land. Do not rely only on a postcode-level label. A risk boundary can run between neighbouring plots, and local levels or drainage may matter.

Note which source of flooding is identified and the stated likelihood. Check how climate change may affect the result where the service provides that information.

A [UKHomePack report](/tool) presents available flood information with other property records, but it remains an initial screen rather than a property-specific commercial flood search.

## Ask about flood history

Ask the seller directly whether the home, garden, outbuildings, parking or access has flooded, and whether any insurance claim or resilience work has been made. Your conveyancer can raise formal enquiries and advise on an appropriate environmental or specialist flood search.

For an address in England, you can request available flood-history information for the area from the Environment Agency. It warns that it does not hold records for every area. Local councils, lead local flood authorities and internal drainage boards may hold other relevant information.

## Speak to insurers before exchange

Do not wait until the day before exchange to find out whether suitable cover is available. Obtain quotations for the exact address and answer questions accurately. Ask about the flood excess, exclusions, buildings and contents cover, and whether any special conditions apply.

If insurance is difficult or expensive, speak to your mortgage lender and conveyancer. Eligibility for schemes or specialist insurance depends on the property and policy conditions; do not assume a home will qualify.

## Look for physical clues

During viewings, pay attention to air bricks, floor levels, drainage channels, pumps, non-return valves, flood gates or water-resistant materials. None of these proves a current problem, but they justify a polite question about history and maintenance.

Also consider whether a flood could cut off the access road even if the building itself sits on higher ground. A surveyor can comment on visible features and recommend further investigation, but a normal home survey is not automatically a detailed flood assessment.

## Planning and future development

Nearby development can change drainage patterns, although planning controls may require mitigation. Search [planning applications around the property](/articles/how-to-check-planning-applications-near-property) and read drainage or flood documents for a major nearby proposal. Check the council's planning register for the complete file.

## Questions to resolve before buying

- Which sources of flooding are shown around the address?
- Is the result area-level or property-specific?
- Has the property or its access flooded before?
- Are suitable buildings insurance and an acceptable excess available?
- Does the conveyancer recommend an environmental or specialist search?
- Has flood-resilience work been installed, and who maintains it?
- Could a nearby development or watercourse justify further advice?

## Frequently asked questions

### Does “low risk” mean the house cannot flood?

No. It describes the modelled likelihood for a source and area. It is not a guarantee and does not cover every possible cause.

### Is an online flood map the same as an environmental search?

No. Online mapping is useful early research. Your conveyancer can advise on formal searches and whether specialist assessment is appropriate.

### Should I avoid every property shown near flood risk?

Not automatically. Understand the type and level of risk, history, insurance position and professional advice, then decide whether it fits your circumstances and tolerance.

## Sources and further reading

- [GOV.UK: check long-term flood risk in England](https://www.gov.uk/check-long-term-flood-risk)
- [GOV.UK: request flood history for an area](https://www.gov.uk/request-flooding-history)
- [GOV.UK: current flood warnings](https://www.gov.uk/check-flooding)
- [View a sample property report](/sample)`,
  },
  {
    slug: 'what-does-epc-rating-mean-when-buying-house',
    title: 'What Does an EPC Rating Mean When Buying a House?',
    excerpt: 'Understand EPC bands, scores, estimated costs and recommended improvements—and know what an energy certificate cannot tell you.',
    category: 'Energy and EPC',
    tags: ['EPC rating', 'energy performance certificate', 'buying a house', 'energy efficiency'],
    imageUrl: `${IMAGE}/epc-rating-explained.jpg`,
    imageAlt: 'A homebuyer reviewing a colour-coded energy efficiency chart at a kitchen table',
    authorName: 'UKHomePack Editorial Team',
    seoTitle: 'What Does an EPC Rating Mean When Buying a House?',
    seoDescription: 'Understand EPC ratings from A to G, potential scores, estimated costs and recommendations before buying a house.',
    status: 'draft', featured: false,
    content: `An Energy Performance Certificate, or EPC, describes the modelled energy efficiency of a home. It gives the property a score and a band from A, the most efficient, to G, the least efficient. For a buyer, it is useful evidence about the building's recorded fabric and services—but it is not a survey or a promise about future bills.

## What the EPC rating measures

The assessment considers characteristics such as construction, insulation, glazing, heating, hot water, ventilation and lighting. The calculation uses standard occupancy assumptions so that homes can be compared on a consistent basis.

Your actual energy use will depend on the number of occupants, how you heat the home, tariffs, appliances and weather. Two households in the same property can receive very different bills.

## Current rating and potential rating

The current score reflects the home as recorded at the assessment date. The potential score assumes that the listed cost-effective recommendations are carried out. It is not a guarantee that every measure is practical, affordable or suitable.

For example, standard recommendations for glazing or external insulation may need careful consideration in a listed building or conservation area. Ask a competent installer or relevant specialist before planning work.

## Check the certificate date

An EPC is normally valid for ten years, so a valid certificate may not describe recent changes. Compare the certificate with the viewing. If it records an older boiler but the seller says a new one has been installed, ask for evidence and check whether a newer EPC exists.

Likewise, the certificate may record an extension, floor area or wall type that helps you confirm you have the correct address. Flats and buildings with similar names need particular care.

## Read beyond the letter

The band is only the headline. Review:

- the numeric score and potential score;
- total useful floor area;
- main heating system and fuel;
- wall, roof, floor and window descriptions;
- estimated energy use and costs;
- recommended improvements, indicative costs and expected effect;
- assessor and assessment date.

A higher band does not tell you that the boiler is safe, the roof is sound or the insulation is correctly installed. The government guidance says an EPC does not comment on service safety or confirm that an installed system is fit for purpose.

## Use recommendations as questions

The recommendation list can help you budget and prepare questions. Ask whether suggested work has already been done, whether guarantees or building-control documents exist, and whether permission would be needed. Get current quotations rather than relying on an old indicative range.

If the property has electric resistance heating, solid walls, an unusual construction or heritage restrictions, obtain advice suited to that building. Measures that work for a modern cavity-wall house may not suit a traditional structure.

## EPC, survey and bills: three different things

An EPC models energy performance. A home survey assesses visible condition within the chosen scope. Bills show how a particular household used energy under particular tariffs and habits. One cannot substitute for the others.

Ask to see recent bills if the seller is willing, but do not treat them as a forecast. Use the EPC to understand the recorded building, your surveyor to discuss condition, and current tariffs and your own habits to form a budget.

You can see how EPC data appears alongside other checks in the [UKHomePack sample report](/sample).

## Frequently asked questions

### Is EPC band C good?

Band C is towards the more efficient end of the A-to-G scale, but the score, property features and recommendations matter too. Compare the certificate with the actual home and your likely use.

### Does a seller need an EPC?

In England and Wales, a valid EPC is generally required when a home is marketed for sale or rent, subject to exemptions. The seller or agent should make it available free of charge to the buyer.

### Does an EPC show the condition of the heating system?

No. It records relevant system characteristics for energy modelling; it does not confirm safety, maintenance or fitness for purpose. Ask for service records and take appropriate professional advice.

### Can I rely on the estimated energy cost?

Use it for comparison, not as a personal forecast. It is based on standard assumptions and may use prices or methods from the assessment period.

## Sources and further reading

- [GOV.UK: guide to domestic Energy Performance Certificates](https://www.gov.uk/government/publications/energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings/a-guide-to-energy-performance-certificates-for-the-marketing-sale-and-let-of-dwellings)
- [GOV.UK: find an energy certificate](https://www.gov.uk/find-energy-certificate)
- [Explore all property-report checks](/features)`,
  },
];
