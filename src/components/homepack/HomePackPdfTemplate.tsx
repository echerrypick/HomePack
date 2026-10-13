import React from 'react';
import { Home } from 'lucide-react';
import { Address } from '@/types';
import { PropertyMap } from '@/components/homepack/property-map';
import { formatAnnualCost, formatCo2Tonnes, dataOrNA, formatSchoolDistance, formatSchoolGrade } from '@/components/homepack/report-display';

interface HomePackPdfTemplateProps {
  pdfTemplateRef: React.RefObject<HTMLDivElement>;
  propertyData: any;
  healthcare?: any;
  crime?: any;
  address: Address;
  landRegistry: any[];
  epc: any;
  floodRisk: any;
  broadband: any;
  radonRisk: any;
  coalMining: any;
  councilTax: any;
  conditionReport?: string;
  planningHistory?: any[];
  isWhiteLabel: boolean;
  brandLogo?: string | null;
  brandPrimary: string;
  brandAccent: string;
  branding?: any;
  profile?: any;
  primaryTransaction?: any;
  isSample?: boolean;
}

export function HomePackPdfTemplate({
  pdfTemplateRef,
  propertyData,
  healthcare,
  crime,
  address,
  landRegistry,
  epc,
  floodRisk,
  broadband,
  radonRisk,
  coalMining,
  councilTax,
  conditionReport,
  planningHistory,
  isWhiteLabel,
  brandLogo,
  brandPrimary,
  brandAccent,
  branding,
  profile,
  primaryTransaction,
  isSample = false,
}: HomePackPdfTemplateProps) {
  const healthcareData = healthcare || propertyData?.healthcare;
  const crimeData = crime || propertyData?.crime;
  const recentStreetSales = propertyData?.recentStreetSales || [];
  const allPlanning = planningHistory || propertyData?.planningHistory || propertyData?.planning || [];
  const planningCoverage = propertyData?.planningCoverage;
  const allPlanningConstraints = propertyData?.planningConstraints || [];
  const floodPlanningConstraint = allPlanningConstraints.find((constraint: any) => constraint?.dataset === 'flood-risk-zone');
  const floodPlanningLabel = floodPlanningConstraint?.detail || floodPlanningConstraint?.name || '';
  const hasPlanningFloodFlag = /zone\s*[23]|medium|high/i.test(String(floodPlanningLabel));
  const epcRating = String(epc?.rating || '').trim().toUpperCase();
  const epcDescription = epcRating === 'A'
    ? 'excellent thermal efficiency'
    : epcRating === 'B'
      ? 'high thermal performance'
      : epcRating === 'C'
        ? 'good, broadly typical thermal efficiency'
        : 'standard efficiency with improvement potential';
  const builtForm = epc?.builtForm || epc?.propertyType || 'Not recorded';
  const todaysPharmacyHours = (() => {
    const hours = String(healthcareData?.pharmacies?.[0]?.openingHours || '');
    const day = new Date().toLocaleDateString('en-GB', { weekday: 'short' });
    return hours.split('; ').find((entry: string) => entry.startsWith(day)) || 'Today’s hours not published';
  })();
  const buyerName = (() => {
    const candidate = String(profile?.displayName || '').trim();
    const looksLikeUsername = /\d/.test(candidate) || (!candidate.includes(' ') && candidate.length > 16);
    return candidate && !looksLikeUsername ? candidate : 'UKHomePack.com customer';
  })();
  const schoolsForPdf = React.useMemo(() => {
    const schools = Array.isArray(propertyData?.schools) ? propertyData.schools : [];
    const primary = schools.filter((school: any) => String(school?.type).toLowerCase().includes('primary')).slice(0, 3);
    const secondary = schools.filter((school: any) => String(school?.type).toLowerCase().includes('secondary')).slice(0, 2);
    return [...primary, ...secondary];
  }, [propertyData?.schools]);
  const formatDecision = (value: unknown) => {
    const decision = String(value || 'Decision not recorded').trim();
    if (/grant|approv/i.test(decision) && /condition/i.test(decision)) return 'Approved with conditions';
    if (/grant|approv/i.test(decision)) return 'Approved';
    if (/refus|reject/i.test(decision)) return 'Refused';
    if (/pending|undecided|consultation|submitted/i.test(decision)) return 'Pending';
    return decision.replace(/\b\w/g, char => char.toUpperCase());
  };
  const councilTaxAmount = (() => {
    const amount = Number(String(councilTax?.annualAmount || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(amount) && amount > 0 ? `£${amount.toLocaleString('en-GB', { maximumFractionDigits: 2 })}` : 'Not available';
  })();

  // Calculate price per m² if both price and floor area exist
  const pricePerM2 = React.useMemo(() => {
    if (!primaryTransaction?.pricePaid || !epc?.totalFloorArea) return null;
    const price = parseFloat(String(primaryTransaction.pricePaid).replace(/[^0-9.]/g, ''));
    const area = parseFloat(String(epc.totalFloorArea).replace(/[^0-9.]/g, ''));
    if (!isNaN(price) && !isNaN(area) && area > 0) {
      return Math.round(price / area);
    }
    return null;
  }, [primaryTransaction?.pricePaid, epc?.totalFloorArea]);

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, background: 'white' }} aria-hidden="true">
      <style>{`
        #homepack-pdf-template .leaflet-control-container {
          display: none !important;
        }
        #homepack-pdf-template {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>

      <div 
        id="homepack-pdf-template"
        ref={pdfTemplateRef}
        style={{ 
          width: '794px', 
          backgroundColor: '#ffffff',
          color: '#0f172a'
        }}
      >
        <div className="bg-white text-[#0f172a] font-sans">
          {/* ================= PAGE 1: COVER ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div className="flex flex-col items-center justify-center text-center mt-6">
              {isSample && <p className="text-red-700 font-bold border border-red-300 p-3 mb-3">ILLUSTRATIVE SAMPLE — unverified demonstration data. Do not rely on this report for property decisions.</p>}
              <div className="mb-6">
                {brandLogo ? (
                  <img src={brandLogo} alt="Agency Logo" className="max-h-20 max-w-[260px] object-contain mx-auto" />
                ) : (
                  <div className="p-5 rounded-2xl inline-block" style={{ backgroundColor: brandPrimary }}>
                    <Home className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight" style={{ color: brandPrimary }}>
                {isWhiteLabel && (branding?.companyTagline || profile?.company) ? (profile?.company || 'Property Intelligence') : 'UKHomePack.com'}
              </h1>
              <p className="text-sm font-sans text-muted-foreground mb-8 uppercase tracking-[0.25em] font-semibold">
                {isWhiteLabel && branding?.companyTagline ? branding.companyTagline : 'UK Property HomePack Report'}
              </p>
              
              <div className="w-full max-w-xl bg-[#f8fafc] p-8 rounded-lg border space-y-4" style={{ borderColor: brandAccent, borderTop: `4px solid ${brandPrimary}` }}>
                <h2 className="text-3xl font-serif font-bold leading-tight" style={{ color: brandPrimary }}>
                  {address.houseNumber} {address.street}
                </h2>
                <div>
                  <p className="text-xl text-[#4a5568]">{address.town}, {address.postcode}</p>
                </div>
                
                {isWhiteLabel ? (
                  <div className="pt-4 space-y-2 border-t" style={{ borderColor: brandAccent }}>
                    <p className="text-sm text-[#4a5568] font-medium">
                      Prepared by <span className="font-bold" style={{ color: brandPrimary }}>{branding?.agentName || profile?.displayName || profile?.company || 'Property Agent'}</span>
                    </p>
                    {branding?.agentBio && (
                      <p className="text-xs italic text-muted-foreground max-w-md mx-auto">{branding.agentBio}</p>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground pt-1">
                      {branding?.agencyPhone && <span>📞 {branding.agencyPhone}</span>}
                      {branding?.agencyEmail && <span>✉️ {branding.agencyEmail}</span>}
                      {branding?.website && <span>🌐 {branding.website}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                ) : (
                  <div className="pt-4 space-y-1.5 border-t border-[#d1e3f8]">
                    <p className="text-sm text-[#4a5568]">Prepared for <span className="font-semibold">{buyerName}</span></p>
                    <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 max-w-md">
                <p className="text-sm font-serif italic text-muted-foreground leading-relaxed">
                  A comprehensive, data-backed due diligence report synthesising official Land Registry records, EPC ratings, Environment Agency flood risk, local planning history, and community amenities.
                </p>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 1 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 2: CONTENTS ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-2 flex items-center gap-2">
                Contents
              </h2>
              <p className="text-sm text-muted-foreground mb-10">Structural overview of this property information dossier</p>
              
              <div className="space-y-6 text-base">
                {[
                  { id: 1, title: 'Executive Summary', page: '03' },
                  { id: 2, title: 'Location, Schools & Healthcare Directory', page: '04' },
                  { id: 3, title: 'HM Land Registry & Sales History', page: '05' },
                  { id: 4, title: 'Energy Performance Certificate (EPC)', page: '06' },
                  { id: 5, title: 'Council Tax & Flood Risk Analysis', page: '07' },
                  { id: 6, title: 'Environmental Hazards & Planning History', page: '08' },
                  { id: 7, title: 'Police.uk Crime & Neighbourhood Safety Analysis', page: '09' },
                  { id: 8, title: 'Connectivity, Sources & Limitations', page: '10' },
                ].map((item) => (
                  <div key={item.id} className="flex items-end gap-3 group">
                    <span className="text-[#2d4a77] font-bold w-6 text-sm">{item.id}.</span>
                    <span className="font-serif text-[#2d4a77] font-medium text-base">{item.title}</span>
                    <div className="flex-grow border-b border-dotted border-[#cbd5e1] mb-1" />
                    <span className="text-[#2d4a77] font-bold font-mono text-sm">Page {item.page}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-5 bg-[#fefce8] border border-[#fef08a] rounded-sm mb-4">
              <p className="text-xs leading-relaxed text-[#854d0e]">
                <span className="font-bold">Important Notice:</span> This report is prepared for informational due diligence purposes only. Legal conveyancing title plans, formal building surveys, and statutory local authority searches must still be conducted via a licensed conveyancing solicitor before exchanging contracts.
              </p>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 2 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 3: EXECUTIVE SUMMARY ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">1. Executive Summary</h2>
              <p className="text-muted-foreground mb-5 text-sm">
                Key findings and high-level due diligence synthesis for {address.houseNumber} {address.street}.
              </p>
              
              <div className="bg-[#f0f7ff] p-5 rounded-sm border border-[#d1e3f8] mb-6">
                <h3 className="text-base font-serif font-bold text-[#2d4a77] mb-3">Property Highlights</h3>
                <div className="space-y-2 text-xs leading-relaxed text-[#2d3748]">
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Energy Efficiency:</strong> Current EPC rating is <strong>{epc?.rating || 'Not recorded'}</strong> (potential to reach <strong>{epc?.potentialRating || 'Not recorded'}</strong>), indicating {epcDescription}.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Sales Record:</strong> Latest recorded transaction is {primaryTransaction ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()} on ${new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')}` : 'not available in recent records'}.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Flood:</strong> {hasPlanningFloodFlag ? <><strong>{floodPlanningLabel} (probability ignoring defences)</strong>; </> : null}Environment Agency defended rivers/sea rating: <strong>{floodRisk?.riskOfFloodingFromRiversAndSea || 'not returned'}</strong>. Current warning status: <strong>{String(floodRisk?.activeWarnings || 'no active warnings').toLowerCase()}</strong>.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Neighbourhood Safety:</strong> {crimeData?.benchmarks ? `Rated as a ${crimeData.benchmarks.safetyRating || 'calculated profile'} (${crimeData.benchmarks.safetyScore ?? 'not scored'}/100 index) with ${crimeData.benchmarks.localAnnualRatePer1000 ?? crimeData.benchmarks.localAnnualRatePer1k ?? 'an unavailable rate'} incidents/1,000 residents vs. ${crimeData.benchmarks.nationalRatePer1000 ?? crimeData.benchmarks.nationalAnnualRatePer1k ?? 'an unavailable national rate'}/1,000 nationally.` : 'Police.uk comparison data was unavailable; no safety rating has been inferred.'}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Connectivity:</strong> {broadband?.maxDownloadSpeed && !/unknown|not available/i.test(broadband.maxDownloadSpeed) ? `Ofcom lookup returned a maximum download speed of ${broadband.maxDownloadSpeed}` : 'Ofcom speed data was not available for this address; verify with providers'}, before relying on connectivity for remote working.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Healthcare Provision:</strong> {healthcareData?.gpSurgeries?.[0] ? `${healthcareData.gpSurgeries[0].name} (${healthcareData.gpSurgeries[0].distance || 'nearby'}, CQC: ${healthcareData.gpSurgeries[0].cqcRating || 'not rated'}). Registration status must be checked directly with the practice.` : 'Live provider details were unavailable. Use NHS Find a Service and confirm registration directly with providers.'}</span>
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#d1e3f8] text-xs text-[#2d4a77]">
                  <span className="font-semibold">Buyer Guidance:</span> Review the detailed educational, Land Registry, and EPC sections in this pack prior to instructing your survey.
                </div>
              </div>
              
              <div className="grid grid-cols-2 border border-[#e2e8f0] mb-6">
                <div className="p-4 border-r border-b border-[#e2e8f0]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Sold Price</p>
                  <p className="text-2xl font-serif font-bold text-[#2d4a77]">{primaryTransaction ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()}` : 'N/A'}</p>
                </div>
                <div className="p-4 border-b border-[#e2e8f0]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Current EPC Rating</p>
                  <p className="text-2xl font-serif font-bold text-[#2d4a77]">{epc?.rating || 'Not recorded'} <span className="text-xs text-muted-foreground font-sans font-normal">(Potential: {epc?.potentialRating || 'Not recorded'})</span></p>
                </div>
                <div className="p-4 border-r border-[#e2e8f0]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Flood Risk Level</p>
                  <p className="text-2xl font-serif font-bold text-emerald-700">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low'}</p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Council Tax Band</p>
                  <p className="text-2xl font-serif font-bold text-[#b45309]">{councilTax?.band || 'Not available'}</p>
                </div>
              </div>

              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden text-xs">
                <div className="bg-[#f8fafc] px-4 py-2 font-bold text-[#2d4a77] border-b border-[#e2e8f0]">
                  Property Baseline Specifications
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[#e2e8f0]">
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-semibold">{epc?.propertyType || 'House'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Built Form:</span>
                    <span className="font-semibold">{builtForm}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Tenure:</span>
                    <span className="font-semibold">{primaryTransaction?.estateType || 'Freehold'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Billing Authority:</span>
                    <span className="font-semibold">{councilTax?.authority || epc?.localAuthority || 'Local Authority'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 3 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 4: LOCATION, SCHOOLS & HEALTHCARE ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-serif font-bold text-[#2d4a77]">2. Location, Schools & Healthcare Directory</h2>
                <span className="text-[10px] font-semibold text-[#1e3a8a] bg-[#f0f7ff] border border-[#d1e3f8] px-2 py-0.5 rounded">
                  Ofsted, CQC & NHS England
                </span>
              </div>
              <p className="text-muted-foreground mb-3 text-xs">
                Geographical map, verified Ofsted educational ratings, and primary healthcare access near {address.street || address.postcode}.
              </p>

              {propertyData.coordinates && (
                <div className="mb-3 border border-[#d1e3f8] rounded-md overflow-hidden shrink-0">
                  <PropertyMap 
                    propertyLocation={propertyData.coordinates} 
                    schools={propertyData.schools || []} 
                    address={propertyData.address} 
                    heightClassName="h-[135px]"
                  />
                </div>
              )}

              {/* Nearest Educational Institutions */}
              <div className="mb-3">
                <h3 className="text-xs font-serif font-bold text-[#2d4a77] border-b pb-1 mb-2">Nearest Educational Institutions</h3>
                <div className="space-y-1.5">
                  {schoolsForPdf.map((school: any, idx: number) => {
                    const grade = formatSchoolGrade(school.ofstedRating);
                    const normalizedGrade = grade.label.toLowerCase();
                    return <div key={idx} className="p-2 bg-[#f0f7ff] rounded border border-[#d1e3f8] flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-[#2d4a77] truncate">{school.name}</p>
                        <p className="text-[10px] text-muted-foreground">{school.type} School • {formatSchoolDistance(school.distance)}{school.inspectionDate ? ` • inspected ${new Date(school.inspectionDate).toLocaleDateString('en-GB')}` : ' • inspection date not verified'}</p>
                      </div>
                      {grade.available ? <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Ofsted:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                          normalizedGrade.includes('outstanding') ? 'bg-emerald-600' :
                          normalizedGrade.includes('good') ? 'bg-blue-600' :
                          normalizedGrade.includes('requires improvement') ? 'bg-amber-500' :
                          'bg-red-500'}
                        `}>
                          {grade.label}
                        </span>
                      </div> : <span className="text-[10px] text-muted-foreground shrink-0">{grade.label}</span>}
                    </div>
                  })}
                  {(!propertyData.schools || propertyData.schools.length === 0) && (
                    <p className="text-xs text-muted-foreground italic py-1.5">No school data available for this location.</p>
                  )}
                  <p className="text-[9px] text-muted-foreground">Source and data date: Ofsted status as returned at report generation; historic grades should be read with their inspection date.</p>
                </div>
              </div>

              {/* NHS Primary Healthcare Directory */}
              <div className="mb-3">
                <div className="flex items-center justify-between border-b pb-1 mb-2">
                  <h3 className="text-xs font-serif font-bold text-[#2d4a77]">NHS Primary Healthcare & CQC Inspection Ratings</h3>
                  <span className="text-[9px] font-bold text-[#2d4a77]">NHS & CQC sources</span>
                </div>

                {/* 3 Core Highlights (GP, Dentist, Pharmacy) */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  {/* GP Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Nearest GP Practice</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.gpSurgeries?.[0]?.name || 'Live result unavailable'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.gpSurgeries?.[0]?.distance || 'Use NHS Find a GP'} • CQC: <strong className="text-foreground">{healthcareData?.gpSurgeries?.[0]?.cqcRating || 'Not checked'}</strong>
                    </p>
                    <p className="text-[10px] text-[#2d4a77] font-bold mt-1">Check registration with practice</p>
                  </div>

                  {/* Dentist Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">NHS Dental Surgery</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.dentists?.[0]?.name || 'Live result unavailable'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.dentists?.[0]?.distance || 'Use NHS Find a Dentist'}
                    </p>
                    <p className="text-[10px] text-[#2d4a77] font-bold mt-1">Check NHS availability directly</p>
                  </div>

                  {/* Pharmacy Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Dispensing Pharmacy</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.pharmacies?.[0]?.name || 'Live result unavailable'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.pharmacies?.[0]?.distance || 'Use NHS Find a Pharmacy'} — {todaysPharmacyHours}
                    </p>
                    <p className="text-[10px] text-[#2d4a77] font-semibold mt-1">
                      {healthcareData?.pharmacies?.[0]?.phone || 'Check NHS service profile'}
                    </p>
                  </div>
                </div>

                {/* Secondary GP Practice List */}
                {healthcareData?.gpSurgeries && healthcareData.gpSurgeries.length > 1 && (
                  <div className="border border-[#e2e8f0] rounded overflow-hidden text-[11px] mb-2">
                    <div className="bg-[#f8fafc] px-2.5 py-1 font-semibold text-[#2d4a77] border-b border-[#e2e8f0] flex justify-between text-[10px]">
                      <span>Additional Catchment GP Surgeries</span>
                      <span className="text-muted-foreground">Directory details</span>
                    </div>
                    <div className="divide-y divide-[#e2e8f0]">
                      {healthcareData.gpSurgeries.slice(1, 3).map((gp: any, idx: number) => (
                        <div key={idx} className="px-2.5 py-1 flex justify-between items-center text-[10px]">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-[#2d4a77]">{gp.name}</span>
                            <span className="text-muted-foreground ml-1">({gp.distance}) • {gp.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-blue-700 text-[9px] font-semibold">CQC: {gp.cqcRating || 'Not matched'}</span>
                            <span className="text-[9px] font-bold text-[#2d4a77]">
                              Check registration
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[10px] text-[#4a5568] leading-tight">
                <span className="font-semibold text-[#2d4a77]">Catchment & NHS Registration Rights:</span> UK residents have a statutory right under NHS England rules to register with any GP surgery within catchment that has open lists, without photo ID or address proof. Educational catchment boundaries are subject to annual local authority allocation criteria.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 4 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 5: HM LAND REGISTRY & SALES HISTORY ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">3. HM Land Registry & Sales History</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Ownership & transaction history</h3>
                <p className="text-[#e2e8f0] text-xs">Official recorded title transactions and price paid records registered with HM Land Registry.</p>
              </div>

              <div className="border border-[#e2e8f0] mb-5">
                <div className="grid grid-cols-3 bg-white text-xs">
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Tenure</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold">{primaryTransaction?.estateType || 'Freehold'}</div>
                  <div className="p-3 border-b border-[#e2e8f0] text-muted-foreground">Latest recorded sale: {primaryTransaction ? new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                  
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Property type</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold text-[#2d4a77]">
                    {primaryTransaction?.propertyType || 'Not recorded'}
                  </div>
                  <div className="p-3 border-b border-[#e2e8f0] font-medium text-muted-foreground">
                    {primaryTransaction?.transactionCategory || 'Category not recorded'}
                  </div>

                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Latest price in Price Paid Data</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold text-[#2d4a77]">
                    £{primaryTransaction ? parseInt(primaryTransaction.pricePaid, 10).toLocaleString() : 'N/A'}
                  </div>
                  <div className="p-3 border-b border-[#e2e8f0] font-medium text-muted-foreground">
                    {pricePerM2 ? `£${pricePerM2.toLocaleString()} / m²` : 'HM Land Registry Official Price Paid'}
                  </div>
                  
                  <div className="p-3 border-r border-[#e2e8f0] text-muted-foreground">Previous recorded price</div>
                  <div className="p-3 border-r border-[#e2e8f0] font-bold">
                    {landRegistry[1] ? `£${parseInt(landRegistry[1].pricePaid, 10).toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="p-3 text-muted-foreground">
                    {landRegistry[1] ? new Date(landRegistry[1].transactionDate).toLocaleDateString('en-GB') : 'No prior sales on file'}
                  </div>
                </div>
              </div>

              {primaryTransaction && (
                <p className="text-[10px] text-muted-foreground mb-4">
                  Exact matched record: {primaryTransaction.addressString}. This is the latest sale present in HM Land Registry Price Paid Data, which may not include every transaction, and is not a current valuation.
                </p>
              )}

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2.5">Full historical sales records</h3>
              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden mb-5">
                <table className="w-full text-xs">
                  <thead className="bg-[#f0f7ff]">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold text-[#2d4a77]">Date</th>
                      <th className="px-4 py-2.5 text-left font-bold text-[#2d4a77]">Price paid</th>
                      <th className="px-4 py-2.5 text-left font-bold text-[#2d4a77]">Tenure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {landRegistry.slice(0, 6).map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                        <td className="px-4 py-2.5">{new Date(t.transactionDate).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-2.5 font-bold text-[#2d4a77]">£{parseInt(t.pricePaid, 10).toLocaleString()}</td>
                        <td className="px-4 py-2.5">{t.estateType || 'Freehold'}</td>
                      </tr>
                    ))}
                    {landRegistry.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground italic">No historical transactions found in Land Registry records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2.5">Recently recorded sales on this street</h3>
              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden mb-4">
                <table className="w-full text-[10px]">
                  <thead className="bg-[#f0f7ff]">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-[#2d4a77]">Address</th>
                      <th className="px-3 py-2 text-left font-bold text-[#2d4a77]">Date</th>
                      <th className="px-3 py-2 text-right font-bold text-[#2d4a77]">Price paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {recentStreetSales.slice(0, 4).map((sale: any, index: number) => (
                      <tr key={`${sale.addressString}-${sale.transactionDate}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                        <td className="px-3 py-2 max-w-[390px]">{sale.addressString}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(sale.transactionDate).toLocaleDateString('en-GB')}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#2d4a77] whitespace-nowrap">£{parseInt(sale.pricePaid, 10).toLocaleString('en-GB')}</td>
                      </tr>
                    ))}
                    {recentStreetSales.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-center text-muted-foreground italic">No neighbouring sales were returned for this exact street and town.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-[9px] text-muted-foreground mb-3">
                Recorded sale prices are not current valuations. Transactions may take time to appear and some transfers are excluded. Contains HM Land Registry data © Crown copyright and database right 2021. Licensed under the Open Government Licence v3.0.
              </p>

              <div className="p-3.5 bg-[#f0f7ff] border border-[#d1e3f8] rounded text-xs text-[#2d4a77]">
                <span className="font-semibold">Title Deeds & Covenants:</span> Official copies of the title register and filed plan can be obtained directly through your conveyancer to verify easements, rights of access, and statutory boundary covenants.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 5 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 6: ENERGY PERFORMANCE CERTIFICATE (EPC) ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">4. Energy Performance Certificate (EPC)</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Energy efficiency snapshot</h3>
                <p className="text-[#e2e8f0] text-xs">Official government registered energy performance rating, thermal efficiency assessment, and projected heating expenditure.</p>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-[#e2e8f0] mb-5">
                <div className="p-5 bg-[#f0fdf4] border-r border-[#e2e8f0]">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Current Energy Rating</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-serif font-bold text-emerald-700">{epc?.rating || '-'}</p>
                    {epc?.currentEnergyEfficiency && (
                      <span className="text-sm font-bold text-emerald-800">
                        Score: {epc.currentEnergyEfficiency}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#065f46] font-medium mt-1">{epcDescription}</p>
                </div>
                <div className="p-5 bg-[#f0f7ff]">
                  <p className="text-[10px] font-bold text-[#2d4a77] uppercase tracking-wider mb-1">Potential Energy Rating</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-serif font-bold text-[#2d4a77]">{epc?.potentialRating || '-'}</p>
                    {epc?.potentialEnergyEfficiency && (
                      <span className="text-sm font-bold text-[#2d4a77]">
                        Score: {epc.potentialEnergyEfficiency}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#3b5987] font-medium mt-1">Clear cost-effective improvement pathway identified</p>
                </div>
              </div>

              <div className="border border-[#e2e8f0] mb-4">
                <div className="grid grid-cols-3 text-xs">
                  <div className="p-2.5 border-r border-b border-[#e2e8f0] text-muted-foreground">Property type</div>
                  <div className="p-2.5 border-r border-b border-[#e2e8f0] font-bold">{epc?.propertyType || 'Not recorded'}</div>
                  <div className="p-2.5 border-b border-[#e2e8f0] font-medium">{builtForm}</div>
                  
                  <div className="p-2.5 border-r border-[#e2e8f0] text-muted-foreground">Total floor area</div>
                  <div className="p-2.5 border-r border-[#e2e8f0] font-bold">{epc?.totalFloorArea ? `${epc.totalFloorArea} m²` : 'Not recorded'}</div>
                  <div className="p-2.5 text-muted-foreground italic">Official EPC internal area</div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] text-[10px] text-[#4a5568] mb-4">
                <strong>EPC verification:</strong> {epc?.address1 || `${address.houseNumber} ${address.street}`}, {epc?.postcode || address.postcode} • Certificate: {epc?.lmkKey || 'not recorded'} • Lodged: {epc?.lodgementDate ? new Date(epc.lodgementDate).toLocaleDateString('en-GB') : 'not recorded'}. Cost figures use the certificate's assessment-date prices and are not current tariffs.
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Building fabric specifications & energy costs</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Main heating</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.mainHeatDescription, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Walls & insulation</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.wallsDescription, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Roof & insulation</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.roofDescription, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Windows & glazing</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.windowsDescription, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Hot water system</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.hotwaterDescription, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Heating estimate at assessment date</span>
                  <span className="col-span-2 font-bold text-emerald-700">{formatAnnualCost(epc?.heatingCostCurrent, 'Not recorded')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Projected CO2 emissions</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{formatCo2Tonnes(epc?.co2EmissionsCurrent, 'Not recorded')}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">EPC Note:</span> Energy Performance Certificates remain legally valid for 10 years from the date of assessment ({epc?.expiryDate ? `valid until ${new Date(epc.expiryDate).toLocaleDateString('en-GB')}` : 'standard statutory validity'}). Recommended efficiency improvements may qualify for local green energy support schemes.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 6 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 7: COUNCIL TAX & FLOOD RISK ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">5. Council Tax & Flood Risk Analysis</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Local taxation and flood risk indicators</h3>
                <p className="text-[#e2e8f0] text-xs">Statutory valuation banding from the Valuation Office Agency and multi-source flood risk data from the Environment Agency.</p>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Council tax assessment</h3>
              <div className="border border-[#e2e8f0] rounded-sm mb-5">
                <div className="grid grid-cols-4 divide-x divide-[#e2e8f0] text-xs">
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Valuation Band</p>
                    <p className="text-xl font-bold text-[#b45309]">{councilTax?.band || 'Not available'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Standard Annual Charge</p>
                    <p className="text-base font-bold text-[#2d4a77]">
                      {councilTaxAmount}
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Billing Authority</p>
                    <p className="font-semibold text-[#2d4a77] truncate">{councilTax?.authority || epc?.localAuthority || 'Local Authority'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Charging Period</p>
                    <p className="font-semibold">{councilTax?.year || 'Current year - verify with council'}</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mb-1">Source and data date: {councilTax?.source || `VOA band and ${councilTax?.authority || 'local authority'} charges`} ({councilTax?.year || 'year not recorded'}). Standard charge before discounts, exemptions, reductions, premiums or account adjustments.</p>
              {councilTax?.chargeNote && <p className="text-[9px] text-amber-800 mb-3">{councilTax.chargeNote}</p>}

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Multi-source flood risk assessment</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Rivers and Sea Flooding</span>
                  <span className="col-span-2 font-bold text-emerald-700">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Very Low / Low'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Surface Water Flooding</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{floodRisk?.riskOfFloodingFromSurfaceWater || 'Low Risk'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Groundwater & Reservoirs</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{floodRisk?.riskOfFloodingFromGroundwater || 'Not assessed by this source'} • {floodRisk?.riskOfFloodingFromReservoirs || 'Check Environment Agency map'}</span>
                </div>
              </div>

              {hasPlanningFloodFlag && (
                <div className="p-3 mb-4 bg-amber-50 border border-amber-300 text-[10px] leading-relaxed text-amber-950">
                  <strong>Planning flood flag: {floodPlanningLabel}.</strong> The Flood Map for Planning generally shows probability without taking flood defences into account. A live-warning status or separate defended-risk assessment can therefore differ; neither should be used to dismiss the planning flag.
                </div>
              )}
              <p className="text-[9px] text-muted-foreground mb-3">Source and data date: Environment Agency live warnings and Planning Data constraints, checked {new Date().toLocaleDateString('en-GB')}.</p>

              <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded text-xs text-emerald-800 mb-5">
                <p className="font-bold mb-0.5">Active Flood Status</p>
                <p>{floodRisk?.activeWarnings || 'No active flood warnings or alerts currently in force for this catchment area.'}</p>
              </div>

              <div className="p-3.5 bg-[#f0f7ff] border border-[#d1e3f8] rounded text-xs text-[#2d4a77]">
                <span className="font-semibold">Conveyancing Search Note:</span> A full Law Society compliant environmental search (CON29) is strongly advised during conveyancing to confirm historical flood records and property eligibility under the Flood Re insurance agreement.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 7 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 8: ENVIRONMENTAL HAZARDS & PLANNING ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">6. Environmental Hazards & Planning History</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Environmental hazards and planning checks</h3>
                <p className="text-[#e2e8f0] text-xs">Screening for radon gas, mining subsidence, ground stability, and recorded local planning applications.</p>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Environmental hazards screening</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-5">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Radon Gas Risk</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{radonRisk?.riskLevel || 'Unknown - check ukradon.org'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Coal Mining Reporting Area</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{coalMining?.isReportingArea ? 'Within designated coal mining reporting boundary' : coalMining?.description && !/not assessed|unavailable/i.test(coalMining.description) ? 'Outside designated coal mining reporting area' : 'Not assessed by an official property-level source'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Natural Ground Stability</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(propertyData.groundStability, 'Not assessed - obtain a licensed ground stability search if required')}</span>
                </div>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Planning constraints at this location</h3>
              <div className="border border-[#fde68a] bg-[#fffbeb] rounded-sm divide-y divide-[#fde68a] text-xs mb-4">
                {allPlanningConstraints.slice(0, 3).map((constraint: any, i: number) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-2.5 items-start">
                    <div className="min-w-0">
                      <p className="font-bold text-[#92400e] capitalize">{String(constraint.dataset || 'Planning constraint').replace(/-/g, ' ')}</p>
                      <p className="text-[10px] text-[#4a5568] break-words">{constraint.detail || constraint.name || 'Recorded constraint'}</p>
                    </div>
                    <span className="text-[9px] text-[#78716c]">Ref: {constraint.reference || 'N/A'}</span>
                  </div>
                ))}
                {allPlanningConstraints.length === 0 && (
                  <div className="p-3 text-[10px] text-[#4a5568]">
                    No intersecting records were returned by the selected Planning Data datasets. This does not confirm that the property is constraint-free.
                  </div>
                )}
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">
                {planningCoverage?.scope === 'radius' ? 'Planning applications within 0.3 miles' : 'Planning applications at the property and on this street'}
              </h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                {allPlanning.slice(0, 3).map((p: any, i: number) => {
                  const title = p.application || p.proposal || p.description || 'Planning Application';
                  const decision = formatDecision(p.decision || p.status);
                  const ref = p.reference || p.ref || 'Recorded';
                  const date = p.date || p.decisionDate || 'On file';
                  return (
                    <div key={i} className="p-2.5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#2d4a77] leading-tight line-clamp-2 pr-2">{title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#f0f7ff] text-[#2d4a77] shrink-0">{decision}</span>
                      </div>
                      <p className="text-[10px] text-[#4a5568] mb-1 break-words">Site: {p.address || 'Address not published in source record'}</p>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Ref: {ref}{p.distanceKm !== undefined ? Number(p.distanceKm) === 0 ? ' - property-linked' : ` - ${(Number(p.distanceKm) * 0.621371).toFixed(2)} miles away` : ''}</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  );
                })}
                {allPlanning.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs font-semibold text-[#2d4a77] mb-1">No applications returned by the available sources</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      This does not confirm that no planning activity exists; local register coverage can vary.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">Planning Advice:</span> Alterations, single-storey extensions, and changes of use remain subject to local planning policies, permitted development limits, and conservation area restrictions.
              </div>
              <p className="text-[9px] text-muted-foreground mt-2">Source and data date: Planning Data constraints and PlanIt/local-authority applications, checked {new Date().toLocaleDateString('en-GB')}.</p>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 8 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 9: POLICE.UK CRIME & SAFETY ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">7. Crime & Neighbourhood Safety Analysis</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-serif font-bold mb-0.5">Police.uk Street-Level Due Diligence</h3>
                    <p className="text-[#e2e8f0] text-xs">
                      12-month rolling data ({crimeData?.earliestMonth && crimeData?.latestMonth ? `${crimeData.earliestMonth} to ${crimeData.latestMonth}` : 'rolling 12 months'}) within a ~1-mile radius of {address.postcode}.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#ffffff]/20 text-white">
                      {crimeData?.policeForce?.name || 'Local Police Force'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento KPI row */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Safety Assessment</p>
                  <p className="text-sm font-bold text-emerald-700">{crimeData?.benchmarks?.safetyRating || 'Low Crime Area'}</p>
                  <p className="text-[10px] text-muted-foreground">Index: {crimeData?.benchmarks?.safetyScore ?? 82}/100</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Local Crime Rate</p>
                  <p className="text-base font-bold text-[#2d4a77]">{crimeData?.benchmarks?.localAnnualRatePer1000 ?? crimeData?.benchmarks?.localAnnualRatePer1k ?? '54.2'}</p>
                  <p className="text-[10px] text-muted-foreground">per 1k residents/yr</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">vs Force Benchmark</p>
                  {(() => {
                    const diff = crimeData?.benchmarks?.vsForceDifferencePercent ?? crimeData?.benchmarks?.diffVsForce ?? -15;
                    return (
                      <p className={`text-sm font-bold ${diff <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {diff <= 0 ? `${Math.abs(diff)}% Below` : `+${diff}% Above`}
                      </p>
                    );
                  })()}
                  <p className="text-[10px] text-muted-foreground truncate" title={crimeData?.benchmarks?.forceName || crimeData?.policeForce?.name}>
                    {crimeData?.benchmarks?.forceName ? String(crimeData.benchmarks.forceName).replace(/Police|Constabulary/gi, '').trim() : 'Force'} ({crimeData?.benchmarks?.forceRatePer1000 ?? crimeData?.benchmarks?.forceAnnualRatePer1k ?? '71'}/1k)
                  </p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">vs England & Wales</p>
                  {(() => {
                    const diffNat = crimeData?.benchmarks?.vsNationalDifferencePercent ?? crimeData?.benchmarks?.diffVsNational ?? -20;
                    return (
                      <p className={`text-sm font-bold ${diffNat <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {diffNat <= 0 ? `${Math.abs(diffNat)}% Below` : `+${diffNat}% Above`}
                      </p>
                    );
                  })()}
                  <p className="text-[10px] text-muted-foreground">National: {crimeData?.benchmarks?.nationalRatePer1000 ?? crimeData?.benchmarks?.nationalAnnualRatePer1k ?? '85.5'}/1k</p>
                </div>
              </div>

              {/* Key Categories Breakdown Table */}
              <h3 className="text-xs font-serif font-bold text-[#2d4a77] mb-1.5 uppercase tracking-wide">
                Key Property Risk Categories (12-Month Total & Baseline)
              </h3>
              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden mb-4 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] text-[#4a5568]">
                      <th className="py-1.5 px-3 font-bold">Category</th>
                      <th className="py-1.5 px-3 font-bold text-center">12M Incidents</th>
                      <th className="py-1.5 px-3 font-bold text-center">% of Local Crime</th>
                      <th className="py-1.5 px-3 font-bold text-center">Monthly Avg</th>
                      <th className="py-1.5 px-3 font-bold text-right">Rate vs national</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[11px]">
                    {[
                      { 
                        name: 'Burglary (Residential & Commercial)', 
                        detail: crimeData?.keyCategories?.burglary,
                        defaultCount: '—', defaultPct: '—', defaultAvg: '—'
                      },
                      { 
                        name: 'Vehicle Crime (Theft of/from Vehicle)', 
                        detail: crimeData?.keyCategories?.vehicleCrime,
                        defaultCount: '—', defaultPct: '—', defaultAvg: '—'
                      },
                      { 
                        name: 'Anti-Social Behaviour (ASB)', 
                        detail: crimeData?.keyCategories?.asb || crimeData?.keyCategories?.antiSocialBehaviour,
                        defaultCount: '—', defaultPct: '—', defaultAvg: '—'
                      },
                      { 
                        name: 'Violence & Sexual Offences', 
                        detail: crimeData?.keyCategories?.violentCrime,
                        defaultCount: '—', defaultPct: '—', defaultAvg: '—'
                      },
                    ].map((row, idx) => {
                      const count = row.detail?.count ?? row.defaultCount;
                      const pct = row.detail?.percentage ?? row.defaultPct;
                      const avg = row.detail?.monthlyAvg ?? row.detail?.monthlyAverage ?? row.defaultAvg;
                      const comparison = row.detail?.status ? `${row.detail.status} (${row.detail.ratePer1000}/1k)` : 'Not calculated';
                      return (
                        <tr key={idx} className="hover:bg-[#fcfdfe]">
                          <td className="py-1.5 px-3 font-medium text-[#2d4a77]">{row.name}</td>
                          <td className="py-1.5 px-3 text-center font-bold text-[#0f172a]">{count}</td>
                          <td className="py-1.5 px-3 text-center text-muted-foreground">{pct}%</td>
                          <td className="py-1.5 px-3 text-center text-muted-foreground">{avg}/mo</td>
                          <td className="py-1.5 px-3 text-right">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-[#334155] border border-[#94a3b8] bg-white">{comparison}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 12-Month Trend Visual Bar Chart */}
              <div className="border border-[#e2e8f0] rounded-sm p-3 mb-4 bg-[#ffffff]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-serif font-bold text-[#2d4a77] uppercase tracking-wide">
                    12-Month Crime Incident Volume Trend
                  </h3>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-muted-foreground">Overall 12M Trajectory:</span>
                    <span className="font-bold text-[#334155]">{(() => {
                      const months = (crimeData?.monthlyTrends || []).filter((month: any) => month.isPublished !== false);
                      if (months.length < 8) return 'INSUFFICIENT DATA';
                      const midpoint = Math.floor(months.length / 2);
                      const average = (items: any[]) => items.reduce((sum, item) => sum + Number(item.totalCrimes || 0), 0) / Math.max(items.length, 1);
                      const previous = average(months.slice(0, midpoint));
                      const recent = average(months.slice(midpoint));
                      const change = previous ? ((recent - previous) / previous) * 100 : 0;
                      return change <= -10 ? 'DECREASING' : change >= 10 ? 'INCREASING' : 'BROADLY STABLE';
                    })()}</span>
                  </div>
                </div>

                {/* Trend bars */}
                {(() => {
                  const trendsList = crimeData?.monthlyTrends || crimeData?.trends || [];
                  const trendCount = (item: any) => Number(item.totalCrimes ?? item.count ?? 0);
                  const maxVal = Math.max(...trendsList.map(trendCount), 20);
                  return (
                    <div className="h-28 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-[#e2e8f0]">
                      {(trendsList.length > 0 ? trendsList : [
                        { month: 'Jan', count: 12 },
                        { month: 'Feb', count: 10 },
                        { month: 'Mar', count: 14 },
                        { month: 'Apr', count: 11 },
                        { month: 'May', count: 15 },
                        { month: 'Jun', count: 13 },
                        { month: 'Jul', count: 16 },
                        { month: 'Aug', count: 12 },
                        { month: 'Sep', count: 11 },
                        { month: 'Oct', count: 13 },
                        { month: 'Nov', count: 10 },
                        { month: 'Dec', count: 9 },
                      ]).map((t: any, i: number) => {
                        const cnt = trendCount(t);
                        const isPublished = t.isPublished !== false;
                        const heightPercent = isPublished ? Math.min(100, Math.max(12, Math.round((cnt / maxVal) * 100))) : 8;
                        const isLast = i === (trendsList.length > 0 ? trendsList.length - 1 : 11);
                        const rawLabel = t.displayMonth || t.monthLabel || t.date || t.month;
                        const label = typeof rawLabel === 'string'
                          ? (/^\d{4}-\d{2}$/.test(rawLabel)
                            ? new Date(`${rawLabel}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
                            : rawLabel.slice(0, 3))
                          : `M${i + 1}`;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                            <span className="text-[9px] font-bold text-[#2d4a77] mb-1">{isPublished ? cnt : 'N/P'}</span>
                            <div 
                              className="w-full rounded-t-sm"
                              style={{ 
                                height: `${heightPercent}%`, 
                                backgroundColor: !isPublished ? '#cbd5e1' : isLast ? '#2563eb' : '#2d4a77',
                                minHeight: '8px'
                              }}
                            />
                            <span className="text-[8px] font-medium text-muted-foreground mt-1 truncate">
                              {isPublished ? label : `${label}*`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-1.5">
                  <span>← 12 months ago</span>
                  <span>Average: {crimeData?.monthlyAverage ?? 'N/A'} crimes per published month in ~1-mile radius (* not published)</span>
                  <span>Most recent recorded month →</span>
                </div>
              </div>

              {/* Street Incident Outcomes & Homeowner Advisory */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#e2e8f0] rounded-sm p-3">
                  <h4 className="text-[11px] font-bold text-[#2d4a77] uppercase mb-1.5">Recent Local Street Incidents</h4>
                  <div className="space-y-1.5 text-[10px]">
                    {(crimeData?.recentIncidents || []).slice(0, 3).map((inc: any, idx: number) => {
                      const category = String(inc.categoryLabel || inc.category || 'Incident');
                      const streetRaw = inc.streetName || (typeof inc.location === 'string' ? inc.location : (inc.location?.street?.name || 'Local Street'));
                      const cleanStreet = String(streetRaw).replace(/^On or near\s+/i, '');
                      const outcome = String(inc.outcomeStatus || inc.outcome || 'Recorded');
                      const incidentMonthRaw = String(inc.month || crimeData?.latestMonth || 'Date unavailable');
                      const incidentMonth = /^\d{4}-\d{2}$/.test(incidentMonthRaw)
                        ? new Date(`${incidentMonthRaw}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
                        : incidentMonthRaw;
                      return (
                        <div key={idx} className="py-1 border-b border-[#f1f5f9] last:border-none">
                          <div className="font-medium leading-tight text-[#0f172a] break-words" title={cleanStreet}>
                            {category} ({cleanStreet}{inc.distanceMiles !== undefined ? `, ${Number(inc.distanceMiles).toFixed(1)} miles away` : ''})
                          </div>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-start mt-0.5 text-[9px] leading-tight">
                            <span className="min-w-0 text-muted-foreground break-words" title={outcome}>{outcome}</span>
                            <span className="shrink-0 font-semibold text-[#2d4a77]">{incidentMonth}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(!crimeData?.recentIncidents || crimeData.recentIncidents.length === 0) && (
                      <p className="text-muted-foreground text-[10px] italic">No street-level incident samples were returned for the latest reporting month. The category totals above still include all incidents returned across the 12-month period.</p>
                    )}
                  </div>
                </div>

                <div className="border border-[#d1e3f8] bg-[#f8fafc] rounded-sm p-3 text-[10px] leading-relaxed text-[#4a5568]">
                  <h4 className="text-[11px] font-bold text-[#2d4a77] uppercase mb-1 flex items-center gap-1">
                    <span>🛡️</span> Homebuyer Security & Insurance Note
                  </h4>
                  <p>
                    Insurers may ask about British Standard <strong>BS3621</strong> mortice deadlocks on external timber doors and multi-point locking systems on uPVC doors. Check the chosen policy's security conditions and any discounts directly with the insurer.
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2">Source and data date: Police.uk, {crimeData?.earliestMonth || 'start date unavailable'} to {crimeData?.latestMonth || 'latest published month unavailable'}; unpublished months excluded from the average.</p>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
              <span className="font-bold">Page 9 of 10</span>
            </div>
          </div>

          {/* ================= PAGE 10: BROADBAND, MOBILE & SIGN-OFF ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[44px] flex flex-col justify-between bg-white text-[#0f172a] font-sans relative"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">8. Connectivity, Sources & Limitations</h2>
              <p className="text-muted-foreground mb-4 text-xs">
                Broadband speed capabilities from Ofcom data, mobile coverage across 4 major UK networks, and source and limitation notes.
              </p>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Broadband availability & performance (Ofcom)</h3>
              <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Max Download</p>
                  <p className="text-base font-bold text-[#2d4a77]">{broadband?.maxDownloadSpeed || 'Not available'}</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Max Upload</p>
                  <p className="text-base font-bold text-[#2d4a77]">{broadband?.maxUploadSpeed || 'Not available'}</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Network Tier</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">{broadband?.ultrafastAvailable ? 'Ultrafast (300+ Mbps)' : broadband?.superfastAvailable ? 'Superfast (30+ Mbps)' : broadband?.standardAvailable ? 'Standard broadband' : 'Not verified'}</p>
                </div>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Mobile network availability (4 UK Operators)</h3>
              <div className="space-y-2 mb-4">
                {(propertyData.mobile || []).slice(0, 4).map((m: any, i: number) => {
                  const isFiveGGood = m.fiveG && (m.fiveG.includes('Good') || m.fiveG.includes('Available'));
                  return (
                    <div key={i} className="p-2.5 border border-[#e2e8f0] rounded-sm flex justify-between items-center text-xs">
                      <div className="flex-grow pr-3">
                        <p className="font-bold text-[#2d4a77]">{m.operator}</p>
                        <p className="text-[11px] text-muted-foreground">Voice: {m.voice || m.overall || 'Check operator'} - Data: {m.data || m.data4g || m.overall || 'Check operator'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${isFiveGGood ? 'bg-emerald-600' : 'bg-slate-500'}`}>
                          {m.fiveG ? `5G: ${m.fiveG}` : (m.overall || 'Ofcom prediction')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(!propertyData.mobile || propertyData.mobile.length === 0) && (
                  <div className="grid grid-cols-4 gap-2">
                    {['EE', 'Vodafone', 'Three', 'O2'].map((op) => (
                      <div key={op} className="p-2 border border-[#e2e8f0] rounded text-center text-xs">
                        <p className="font-bold text-[#2d4a77]">{op}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Coverage not verified</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">Source and data date: Ofcom address checker and operator-specific mobile checker, checked {new Date().toLocaleDateString('en-GB')}. Missing values are shown as unavailable rather than estimated.</p>

              {conditionReport && (
                <div className="mb-4">
                  <h3 className="text-xs font-serif font-bold text-[#2d4a77] mb-1.5">AI Condition Synthesis</h3>
                  <div className="p-3 bg-[#f8fafc] rounded-sm border border-[#e2e8f0] text-xs leading-relaxed text-[#2d3748] max-h-[85px] overflow-hidden">
                    {conditionReport}
                  </div>
                </div>
              )}
            </div>

            <div>
              {isWhiteLabel ? (
                <div className="py-3 px-6 rounded-sm border text-center mb-2" style={{ backgroundColor: '#f8fafc', borderColor: brandAccent, borderTop: `3px solid ${brandPrimary}` }}>
                  <h3 className="text-base font-serif font-bold mb-0.5" style={{ color: brandPrimary }}>{branding?.agentName || profile?.company || 'Property Agent'}</h3>
                  {branding?.companyTagline && <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">{branding.companyTagline}</p>}
                  <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-[#4a5568] font-medium">
                    {branding?.agencyPhone && <span>📞 {branding.agencyPhone}</span>}
                    {branding?.agencyEmail && <span>✉️ {branding.agencyEmail}</span>}
                    {branding?.website && <span>🌐 {branding.website}</span>}
                  </div>
                </div>
              ) : (
                <div className="py-3 px-6 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm text-center mb-2">
                  <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-0.5">UKHomePack.com Data Compilation Statement</h3>
                  <p className="text-xs text-[#4a5568] italic">Compiled by UKHomePack.com from the cited public and official sources. This is not a professional certification, valuation, survey, or legal opinion.</p>
                </div>
              )}
              
              <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
                <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'UKHomePack.com • UK Property HomePack Report'}</span>
                <span className="font-bold">Page 10 of 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
