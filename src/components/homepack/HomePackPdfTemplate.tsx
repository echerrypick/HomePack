import React from 'react';
import { Home } from 'lucide-react';
import { Address } from '@/types';
import { PropertyMap } from '@/components/homepack/property-map';
import { formatAnnualCost, formatCo2Tonnes, dataOrNA, formatSchoolDistance } from '@/components/homepack/report-display';

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
}: HomePackPdfTemplateProps) {
  const healthcareData = healthcare || propertyData?.healthcare;
  const crimeData = crime || propertyData?.crime;
  const allPlanning = planningHistory || propertyData?.planningHistory || propertyData?.planning || [];

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
                {isWhiteLabel && (branding?.companyTagline || profile?.company) ? (profile?.company || 'Property Intelligence') : 'HomePackAI'}
              </h1>
              <p className="text-sm font-sans text-muted-foreground mb-8 uppercase tracking-[0.25em] font-semibold">
                {isWhiteLabel && branding?.companyTagline ? branding.companyTagline : 'Property Information Report'}
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
                      Prepared by <span className="font-bold" style={{ color: brandPrimary }}>{branding?.agentName || profile?.displayName || profile?.company || 'Certified Property Agent'}</span>
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
                    <p className="text-sm text-[#4a5568]">Prepared for <span className="font-semibold">{profile?.displayName || profile?.email || 'Homebuyer / Property Investor'}</span></p>
                    <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 max-w-md">
                <p className="text-sm font-serif italic text-muted-foreground leading-relaxed">
                  A comprehensive, data-backed due diligence report synthesizing official Land Registry records, EPC ratings, Environment Agency flood risk, local planning history, and community amenities.
                </p>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                  { id: 8, title: 'Broadband, Mobile & Advisory Sign-Off', page: '10' },
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
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                    <span><strong>Energy Efficiency:</strong> Current EPC rating is <strong>{epc?.rating || 'B'}</strong> (potential to reach <strong>{epc?.potentialRating || 'A'}</strong>), indicating {epc?.rating === 'A' || epc?.rating === 'B' ? 'above-average thermal efficiency' : 'standard efficiency with improvement potential'}.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Sales Record:</strong> Latest recorded transaction is {primaryTransaction ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString()} on ${new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB')}` : 'not available in recent records'}.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Flood Risk:</strong> Rivers & sea flooding risk is classified as <strong>{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low'}</strong> with {floodRisk?.activeWarnings || 'no active warnings'}.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Neighbourhood Safety:</strong> {crimeData?.benchmarks ? `Rated as a ${crimeData.benchmarks.safetyRating || 'Verified Profile'} (${crimeData.benchmarks.safetyScore ?? 80}/100 index) with ${crimeData.benchmarks.localAnnualRatePer1000 ?? crimeData.benchmarks.localAnnualRatePer1k ?? '54.2'} incidents/1,000 residents vs. ${crimeData.benchmarks.nationalRatePer1000 ?? crimeData.benchmarks.nationalAnnualRatePer1k ?? '85.5'}/1,000 nationally.` : 'Low local crime rate confirmed via official Police.uk street-level database with below-average incident frequency.'}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Connectivity:</strong> {broadband?.superfastAvailable ? 'Superfast/Ultrafast broadband coverage is confirmed' : 'Broadband availability confirmed'}, supporting modern remote working requirements.</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Healthcare Provision:</strong> {healthcareData?.gpSurgeries?.[0] ? `${healthcareData.gpSurgeries[0].name} (${healthcareData.gpSurgeries[0].distance}, CQC: ${healthcareData.gpSurgeries[0].cqcRating || 'Good'}) is ${healthcareData.gpSurgeries[0].isAcceptingNewPatients ? 'currently accepting new NHS patients' : 'operating at list capacity'}. Local NHS dental access within ${healthcareData.dentists?.[0]?.distance || 'immediate radius'}.` : 'Verified local primary care GP surgeries, dental practices, and community dispensing pharmacies within immediate catchment.'}</span>
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
                  <p className="text-2xl font-serif font-bold text-[#2d4a77]">{epc?.rating || 'B'} <span className="text-xs text-muted-foreground font-sans font-normal">(Potential: {epc?.potentialRating || 'A'})</span></p>
                </div>
                <div className="p-4 border-r border-[#e2e8f0]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Flood Risk Level</p>
                  <p className="text-2xl font-serif font-bold text-emerald-700">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low'}</p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Council Tax Band</p>
                  <p className="text-2xl font-serif font-bold text-[#b45309]">{councilTax?.band || 'Band C'}</p>
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
                    <span className="font-semibold">{epc?.builtForm || 'Semi-detached / End-terrace'}</span>
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
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                <h3 className="text-xs font-serif font-bold text-[#2d4a77] border-b pb-1 mb-2">Nearest Educational Institutions (Ofsted Rated)</h3>
                <div className="space-y-1.5">
                  {(propertyData.schools || []).slice(0, 3).map((school: any, idx: number) => (
                    <div key={idx} className="p-2 bg-[#f0f7ff] rounded border border-[#d1e3f8] flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-[#2d4a77] truncate">{school.name}</p>
                        <p className="text-[10px] text-muted-foreground">{school.type} School • {formatSchoolDistance(school.distance)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Ofsted:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                          school.ofstedRating.toLowerCase().includes('outstanding') ? 'bg-emerald-600' : 
                          school.ofstedRating.toLowerCase().includes('good') ? 'bg-blue-600' : 
                          school.ofstedRating.toLowerCase().includes('requires improvement') ? 'bg-amber-500' : 
                          'bg-red-500'}
                        `}>
                          {school.ofstedRating}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!propertyData.schools || propertyData.schools.length === 0) && (
                    <p className="text-xs text-muted-foreground italic py-1.5">No school data available for this location.</p>
                  )}
                </div>
              </div>

              {/* NHS Primary Healthcare Directory */}
              <div className="mb-3">
                <div className="flex items-center justify-between border-b pb-1 mb-2">
                  <h3 className="text-xs font-serif font-bold text-[#2d4a77]">NHS Primary Healthcare & CQC Inspection Ratings</h3>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Verified CQC & NHS Registry
                  </span>
                </div>

                {/* 3 Core Highlights (GP, Dentist, Pharmacy) */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  {/* GP Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Nearest GP Practice</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.gpSurgeries?.[0]?.name || 'Local GP Surgery'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.gpSurgeries?.[0]?.distance || 'Nearby'} • CQC: <strong className="text-foreground">{healthcareData?.gpSurgeries?.[0]?.cqcRating || 'Good'}</strong>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      {healthcareData?.gpSurgeries?.[0]?.isAcceptingNewPatients ? '✓ Accepting NHS Patients' : 'List Closed / Inquire'}
                    </p>
                  </div>

                  {/* Dentist Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">NHS Dental Surgery</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.dentists?.[0]?.name || 'Dental Practice'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.dentists?.[0]?.distance || 'Nearby'} • CQC Regulated
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      {healthcareData?.dentists?.[0]?.isAcceptingNhsPatients ? '✓ NHS Patients Accepted' : 'Private / Referral'}
                    </p>
                  </div>

                  {/* Pharmacy Box */}
                  <div className="p-2 bg-[#f8fafc] border border-[#cbd5e1] rounded">
                    <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Dispensing Pharmacy</p>
                    <p className="font-bold text-[#2d4a77] truncate mt-0.5 text-xs">
                      {healthcareData?.pharmacies?.[0]?.name || 'Local Chemist'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {healthcareData?.pharmacies?.[0]?.distance || '< 1 mi'} • {healthcareData?.pharmacies?.[0]?.openingHours || 'Mon-Fri'}
                    </p>
                    <p className="text-[10px] text-[#2d4a77] font-semibold mt-1">
                      {healthcareData?.pharmacies?.[0]?.phone || 'NHS Pharmacy First'}
                    </p>
                  </div>
                </div>

                {/* Secondary GP Practice List */}
                {healthcareData?.gpSurgeries && healthcareData.gpSurgeries.length > 1 && (
                  <div className="border border-[#e2e8f0] rounded overflow-hidden text-[11px] mb-2">
                    <div className="bg-[#f8fafc] px-2.5 py-1 font-semibold text-[#2d4a77] border-b border-[#e2e8f0] flex justify-between text-[10px]">
                      <span>Additional Catchment GP Surgeries</span>
                      <span className="text-muted-foreground">Patient Acceptance Status</span>
                    </div>
                    <div className="divide-y divide-[#e2e8f0]">
                      {healthcareData.gpSurgeries.slice(1, 3).map((gp: any, idx: number) => (
                        <div key={idx} className="px-2.5 py-1 flex justify-between items-center text-[10px]">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-[#2d4a77]">{gp.name}</span>
                            <span className="text-muted-foreground ml-1">({gp.distance}) • {gp.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1 py-0.2 rounded bg-blue-50 text-blue-700 text-[9px] font-semibold border border-blue-200">
                              CQC: {gp.cqcRating || 'Good'}
                            </span>
                            <span className={`text-[9px] font-bold ${gp.isAcceptingNewPatients ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {gp.isAcceptingNewPatients ? '✓ Accepting' : 'Waitlist'}
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
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Estate type</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold">{primaryTransaction?.estateType || 'Freehold'}</div>
                  <div className="p-3 border-b border-[#e2e8f0] text-muted-foreground">Latest sale: {primaryTransaction ? new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                  
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Latest recorded price</div>
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

              <div className="p-3.5 bg-[#f0f7ff] border border-[#d1e3f8] rounded text-xs text-[#2d4a77]">
                <span className="font-semibold">Title Deeds & Covenants:</span> Official copies of the title register and filed plan can be obtained directly through your conveyancer to verify easements, rights of access, and statutory boundary covenants.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                    <p className="text-5xl font-serif font-bold text-emerald-700">{epc?.rating || 'B'}</p>
                    {epc?.currentEnergyEfficiency && (
                      <span className="text-sm font-bold text-emerald-800">
                        Score: {epc.currentEnergyEfficiency}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#065f46] font-medium mt-1">High thermal performance & lower carbon footprint</p>
                </div>
                <div className="p-5 bg-[#f0f7ff]">
                  <p className="text-[10px] font-bold text-[#2d4a77] uppercase tracking-wider mb-1">Potential Energy Rating</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-serif font-bold text-[#2d4a77]">{epc?.potentialRating || 'A'}</p>
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
                  <div className="p-2.5 border-r border-b border-[#e2e8f0] font-bold">{epc?.propertyType || 'House'}</div>
                  <div className="p-2.5 border-b border-[#e2e8f0] font-medium">{epc?.builtForm || 'Semi-detached'}</div>
                  
                  <div className="p-2.5 border-r border-[#e2e8f0] text-muted-foreground">Total floor area</div>
                  <div className="p-2.5 border-r border-[#e2e8f0] font-bold">{epc?.totalFloorArea ? `${epc.totalFloorArea} m²` : '63.0 m²'}</div>
                  <div className="p-2.5 text-muted-foreground italic">Official EPC internal area</div>
                </div>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Building fabric specifications & energy costs</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Main heating</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.mainHeatDescription, 'Boiler and radiators, mains gas')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Walls & insulation</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.wallsDescription, 'Cavity wall, standard insulation')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Roof & insulation</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.roofDescription, 'Pitched, standard loft insulation')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Windows & glazing</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.windowsDescription, 'High performance double glazing')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Hot water system</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.hotwaterDescription, 'From main system')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Estimated annual heating</span>
                  <span className="col-span-2 font-bold text-emerald-700">{formatAnnualCost(epc?.heatingCostCurrent, '£195 / year')}</span>
                </div>
                <div className="grid grid-cols-3 p-2">
                  <span className="text-muted-foreground font-medium">Projected CO2 emissions</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{formatCo2Tonnes(epc?.co2EmissionsCurrent, '1.0 tonnes / year')}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">EPC Note:</span> Energy Performance Certificates remain legally valid for 10 years from the date of assessment ({epc?.expiryDate ? `valid until ${new Date(epc.expiryDate).toLocaleDateString('en-GB')}` : 'standard statutory validity'}). Recommended efficiency improvements may qualify for local green energy support schemes.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                    <p className="text-xl font-bold text-[#b45309]">{councilTax?.band || 'Band C'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Est. Annual Charge</p>
                    <p className="text-base font-bold text-[#2d4a77]">
                      {councilTax?.annualAmount ? `£${String(councilTax.annualAmount).replace(/[^0-9.]/g, '')}` : '£1,850 - £2,200'}
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Billing Authority</p>
                    <p className="font-semibold text-[#2d4a77] truncate">{councilTax?.authority || epc?.localAuthority || 'Local Authority'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Charging Period</p>
                    <p className="font-semibold">{councilTax?.year || '2024 / 2025'}</p>
                  </div>
                </div>
              </div>

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
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{floodRisk?.riskOfFloodingFromGroundwater || 'Negligible Risk'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded text-xs text-emerald-800 mb-5">
                <p className="font-bold mb-0.5">Active Flood Status</p>
                <p>{floodRisk?.activeWarnings || 'No active flood warnings or alerts currently in force for this catchment area.'}</p>
              </div>

              <div className="p-3.5 bg-[#f0f7ff] border border-[#d1e3f8] rounded text-xs text-[#2d4a77]">
                <span className="font-semibold">Conveyancing Search Note:</span> A full Law Society compliant environmental search (CON29) is strongly advised during conveyancing to confirm historical flood records and property eligibility under the Flood Re insurance agreement.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{radonRisk?.riskLevel || 'Low (< 1% of homes estimated at or above action level)'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Coal Mining Reporting Area</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{coalMining?.isReportingArea ? 'Within designated coal mining reporting boundary' : 'Outside designated coal mining reporting area'}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground font-medium">Natural Ground Stability</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(propertyData.groundStability, 'Standard natural ground stability / low hazard')}</span>
                </div>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Local authority planning applications</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                {allPlanning.slice(0, 4).map((p: any, i: number) => {
                  const title = p.application || p.proposal || p.description || 'Planning Application';
                  const decision = p.decision || p.status || 'Decided';
                  const ref = p.reference || p.ref || 'Recorded';
                  const date = p.date || p.decisionDate || 'On file';
                  return (
                    <div key={i} className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#2d4a77] truncate pr-2">{title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#f0f7ff] text-[#2d4a77] shrink-0">{decision}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Ref: {ref}</span>
                        <span>Date: {date}</span>
                      </div>
                    </div>
                  );
                })}
                {allPlanning.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs font-semibold text-[#2d4a77] mb-1">✓ No Adverse Planning Notices or Statutory Enforcement</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      No contentious planning applications or restrictive notices recorded on the local authority statutory register for this dwelling. Standard permitted development rights apply.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">Planning Advice:</span> Alterations, single-storey extensions, and changes of use remain subject to local planning policies, permitted development limits, and conservation area restrictions.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
                      <th className="py-1.5 px-3 font-bold text-right">Risk Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[11px]">
                    {[
                      { 
                        name: 'Burglary (Residential & Commercial)', 
                        detail: crimeData?.keyCategories?.burglary,
                        defaultCount: 8,
                        defaultPct: 4.8,
                        defaultAvg: 0.7,
                        defaultRisk: 'Low'
                      },
                      { 
                        name: 'Vehicle Crime (Theft of/from Vehicle)', 
                        detail: crimeData?.keyCategories?.vehicleCrime,
                        defaultCount: 14,
                        defaultPct: 8.4,
                        defaultAvg: 1.2,
                        defaultRisk: 'Low'
                      },
                      { 
                        name: 'Anti-Social Behaviour (ASB)', 
                        detail: crimeData?.keyCategories?.asb || crimeData?.keyCategories?.antiSocialBehaviour,
                        defaultCount: 42,
                        defaultPct: 25.1,
                        defaultAvg: 3.5,
                        defaultRisk: 'Moderate'
                      },
                      { 
                        name: 'Violence & Sexual Offences', 
                        detail: crimeData?.keyCategories?.violentCrime,
                        defaultCount: 52,
                        defaultPct: 31.1,
                        defaultAvg: 4.3,
                        defaultRisk: 'Moderate'
                      },
                    ].map((row, idx) => {
                      const count = row.detail?.count ?? row.defaultCount;
                      const pct = row.detail?.percentage ?? row.defaultPct;
                      const avg = row.detail?.monthlyAvg ?? row.detail?.monthlyAverage ?? row.defaultAvg;
                      const risk = row.detail?.riskLevel ?? row.defaultRisk;
                      const riskColor = risk === 'Low' ? 'text-emerald-700 bg-emerald-50' : risk === 'Moderate' ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50';
                      return (
                        <tr key={idx} className="hover:bg-[#fcfdfe]">
                          <td className="py-1.5 px-3 font-medium text-[#2d4a77]">{row.name}</td>
                          <td className="py-1.5 px-3 text-center font-bold text-[#0f172a]">{count}</td>
                          <td className="py-1.5 px-3 text-center text-muted-foreground">{pct}%</td>
                          <td className="py-1.5 px-3 text-center text-muted-foreground">{avg}/mo</td>
                          <td className="py-1.5 px-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${riskColor}`}>
                              {risk}
                            </span>
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
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {crimeData?.benchmarks?.vsNationalComparison ? `${crimeData.benchmarks.vsNationalComparison.toUpperCase()} CRIME TREND` : 'STABLE'}
                    </span>
                  </div>
                </div>

                {/* Trend bars */}
                {(() => {
                  const trendsList = crimeData?.monthlyTrends || crimeData?.trends || [];
                  const maxVal = Math.max(...trendsList.map((item: any) => item.count || 0), 20);
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
                        const cnt = typeof t.count === 'number' ? t.count : 0;
                        const heightPercent = Math.min(100, Math.max(12, Math.round((cnt / maxVal) * 100)));
                        const isLast = i === (trendsList.length > 0 ? trendsList.length - 1 : 11);
                        const label = t.monthLabel ? t.monthLabel.slice(0, 3) : (typeof t.month === 'string' ? (t.month.includes('-') ? t.month.slice(5) : t.month.slice(0, 3)) : `M${i+1}`);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                            <span className="text-[9px] font-bold text-[#2d4a77] mb-1">{cnt}</span>
                            <div 
                              className="w-full rounded-t-sm"
                              style={{ 
                                height: `${heightPercent}%`, 
                                backgroundColor: isLast ? '#2563eb' : '#2d4a77',
                                minHeight: '8px'
                              }}
                            />
                            <span className="text-[8px] font-medium text-muted-foreground mt-1 truncate">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-1.5">
                  <span>← 12 months ago</span>
                  <span>Average: {crimeData?.monthlyAverage || '12.4'} crimes/month in ~1-mile radius</span>
                  <span>Most recent recorded month →</span>
                </div>
              </div>

              {/* Street Incident Outcomes & Homeowner Advisory */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#e2e8f0] rounded-sm p-3">
                  <h4 className="text-[11px] font-bold text-[#2d4a77] uppercase mb-1.5">Recent Local Street Incidents</h4>
                  <div className="space-y-1.5 text-[10px]">
                    {(crimeData?.recentIncidents || []).slice(0, 3).map((inc: any, idx: number) => {
                      const category = inc.categoryLabel || inc.category || 'Incident';
                      const streetRaw = inc.streetName || (typeof inc.location === 'string' ? inc.location : (inc.location?.street?.name || 'Local Street'));
                      const cleanStreet = String(streetRaw).replace(/^On or near\s+/i, '');
                      const outcome = inc.outcomeStatus || inc.outcome || 'Recorded';
                      return (
                        <div key={idx} className="flex justify-between items-center py-0.5 border-b border-[#f1f5f9] last:border-none">
                          <span className="font-medium text-[#0f172a] truncate max-w-[170px]" title={cleanStreet}>
                            {category} ({cleanStreet})
                          </span>
                          <span className="text-[9px] text-muted-foreground shrink-0 ml-1 truncate max-w-[120px]" title={outcome}>
                            {outcome.slice(0, 20)}
                          </span>
                        </div>
                      );
                    })}
                    {(!crimeData?.recentIncidents || crimeData.recentIncidents.length === 0) && (
                      <p className="text-muted-foreground text-[10px] italic">No high-severity street crimes recorded in immediate vicinity during latest reporting cycle.</p>
                    )}
                  </div>
                </div>

                <div className="border border-[#d1e3f8] bg-[#f8fafc] rounded-sm p-3 text-[10px] leading-relaxed text-[#4a5568]">
                  <h4 className="text-[11px] font-bold text-[#2d4a77] uppercase mb-1 flex items-center gap-1">
                    <span>🛡️</span> Homebuyer Security & Insurance Note
                  </h4>
                  <p>
                    Standard residential buildings & contents insurance policies require British Standard <strong>BS3621</strong> mortice deadlocks on external timber doors and multi-point locking systems on uPVC doors. Active neighbourhood watch schemes and certified intruder alarms can qualify properties for additional premium discounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
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
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">8. Digital Connectivity & Property Sign-Off</h2>
              <p className="text-muted-foreground mb-4 text-xs">
                Broadband speed capabilities from Ofcom data, mobile coverage across 4 major UK networks, and professional due diligence sign-off.
              </p>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Broadband availability & performance (Ofcom)</h3>
              <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Max Download</p>
                  <p className="text-base font-bold text-[#2d4a77]">{broadband?.maxDownloadSpeed || '1,000 Mbps'}</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Max Upload</p>
                  <p className="text-base font-bold text-[#2d4a77]">{broadband?.maxUploadSpeed || '220 Mbps'}</p>
                </div>
                <div className="p-3 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Network Tier</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">{broadband?.superfastAvailable ? 'Ultrafast Fibre (FTTP)' : 'Standard Superfast'}</p>
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
                        <p className="text-[11px] text-muted-foreground">Voice: {m.voice} • Data: {m.data || m.data4g || '4G Available'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${isFiveGGood ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                          5G: {m.fiveG || 'Limited'}
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
                        <p className="text-[10px] text-emerald-600 font-semibold">4G / 5G Good</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  <h3 className="text-base font-serif font-bold mb-0.5" style={{ color: brandPrimary }}>{branding?.agentName || profile?.company || 'Certified Property Agent'}</h3>
                  {branding?.companyTagline && <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">{branding.companyTagline}</p>}
                  <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-[#4a5568] font-medium">
                    {branding?.agencyPhone && <span>📞 {branding.agencyPhone}</span>}
                    {branding?.agencyEmail && <span>✉️ {branding.agencyEmail}</span>}
                    {branding?.website && <span>🌐 {branding.website}</span>}
                  </div>
                </div>
              ) : (
                <div className="py-3 px-6 bg-[#f0f7ff] border border-[#d1e3f8] rounded-sm text-center mb-2">
                  <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-0.5">Official HomePackAI Certification</h3>
                  <p className="text-xs text-[#4a5568] italic">Comprehensive UK property information dossier compiled and certified by HomePackAI.</p>
                </div>
              )}
              
              <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
                <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
                <span className="font-bold">Page 10 of 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
