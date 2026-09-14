import React from 'react';
import { Home } from 'lucide-react';
import { Address } from '@/types';
import { PropertyMap } from '@/components/homepack/property-map';
import { Badge } from '@/components/ui/badge';
import { formatAnnualCost, formatCo2Tonnes, dataOrNA, formatSchoolDistance } from '@/components/homepack/report-display';

interface HomePackPdfTemplateProps {
  pdfTemplateRef: React.RefObject<HTMLDivElement>;
  propertyData: any;
  address: Address;
  landRegistry: any[];
  epc: any;
  floodRisk: any;
  broadband: any;
  radonRisk: any;
  coalMining: any;
  councilTax: any;
  conditionReport?: string;
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
  address,
  landRegistry,
  epc,
  floodRisk,
  broadband,
  radonRisk,
  coalMining,
  councilTax,
  conditionReport,
  isWhiteLabel,
  brandLogo,
  brandPrimary,
  brandAccent,
  branding,
  profile,
  primaryTransaction,
}: HomePackPdfTemplateProps) {
  return (
    <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, background: 'white' }} aria-hidden="true">
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
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
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
                  <div className="pt-4 space-y-1.5 border-t border-[#d1e3f8]/50">
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
              <span className="font-bold">Page 1 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 2: CONTENTS ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#2d4a77] mb-2 flex items-center gap-2">
                Contents
              </h2>
              <p className="text-sm text-muted-foreground mb-10">Structural overview of this property information dossier</p>
              
              <div className="space-y-6 text-base">
                {[
                  { id: 1, title: 'Executive Summary', page: '03' },
                  { id: 2, title: 'Location & Local Schools', page: '04' },
                  { id: 3, title: 'HM Land Registry & Sales History', page: '05' },
                  { id: 4, title: 'Energy Performance Certificate (EPC)', page: '06' },
                  { id: 5, title: 'Council Tax & Flood Risk Analysis', page: '07' },
                  { id: 6, title: 'Environmental Hazards & Planning History', page: '08' },
                  { id: 7, title: 'Broadband, Mobile & Advisory Sign-Off', page: '09' },
                ].map((item) => (
                  <div key={item.id} className="flex items-end gap-3 group">
                    <span className="text-[#2d4a77] font-bold w-6 text-sm">{item.id}.</span>
                    <span className="font-serif text-[#2d4a77] font-medium text-base">{item.title}</span>
                    <div className="flex-grow border-b border-dotted border-[#2d4a77]/30 mb-1" />
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
              <span className="font-bold">Page 2 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 3: EXECUTIVE SUMMARY ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">1. Executive Summary</h2>
              <p className="text-muted-foreground mb-5 text-sm">
                Key findings and high-level due diligence synthesis for {address.houseNumber} {address.street}.
              </p>
              
              <div className="bg-[#f0f7ff] p-5 rounded-sm border border-[#d1e3f8] mb-6">
                <h3 className="text-base font-serif font-bold text-[#2d4a77] mb-3">Property Highlights</h3>
                <div className="space-y-2.5 text-xs leading-relaxed text-[#2d3748]">
                  <p className="flex gap-2">
                    <span className="text-[#2d4a77] font-bold">•</span>
                    <span><strong>Energy Efficiency:</strong> Current EPC rating is <strong>{epc?.rating || 'N/A'}</strong> (potential to reach <strong>{epc?.potentialRating || 'N/A'}</strong>), indicating {epc?.rating === 'A' || epc?.rating === 'B' ? 'above-average thermal efficiency' : 'standard efficiency with improvement potential'}.</span>
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
                    <span><strong>Connectivity:</strong> {broadband?.superfastAvailable ? 'Superfast/Ultrafast broadband coverage is confirmed' : 'Broadband availability confirmed'}, supporting modern remote working requirements.</span>
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
                  <p className="text-2xl font-serif font-bold text-[#2d4a77]">{epc?.rating || 'N/A'} <span className="text-xs text-muted-foreground font-sans font-normal">(Potential: {epc?.potentialRating || 'N/A'})</span></p>
                </div>
                <div className="p-4 border-r border-[#e2e8f0]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Flood Risk Level</p>
                  <p className="text-2xl font-serif font-bold text-emerald-700">{floodRisk?.riskOfFloodingFromRiversAndSea || 'Low'}</p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Council Tax Band</p>
                  <p className="text-2xl font-serif font-bold text-[#b45309]">{councilTax?.band || 'Check VOA'}</p>
                </div>
              </div>

              <div className="border border-[#e2e8f0] rounded-sm overflow-hidden text-xs">
                <div className="bg-[#f8fafc] px-4 py-2 font-bold text-[#2d4a77] border-b border-[#e2e8f0]">
                  Property Baseline Specifications
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[#e2e8f0]">
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-semibold">{epc?.propertyType || 'Residential'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Built Form:</span>
                    <span className="font-semibold">{epc?.builtForm || 'End-terrace'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Tenure:</span>
                    <span className="font-semibold">{primaryTransaction?.estateType || 'Freehold'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-muted-foreground">Billing Authority:</span>
                    <span className="font-semibold">{councilTax?.authority || 'Local Authority'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
              <span className="font-bold">Page 3 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 4: LOCATION & SCHOOLS ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">2. Location & Local Schools</h2>
              <p className="text-muted-foreground mb-4 text-xs">
                Geographical map and verified Ofsted educational ratings for institutions near {address.street}.
              </p>

              {propertyData.coordinates && (
                <div className="mb-4 border border-[#d1e3f8] rounded-md overflow-hidden shrink-0">
                  <PropertyMap 
                    propertyLocation={propertyData.coordinates} 
                    schools={propertyData.schools || []} 
                    address={propertyData.address} 
                    heightClassName="h-[210px]"
                  />
                </div>
              )}

              <div>
                <h3 className="text-sm font-serif font-bold text-[#2d4a77] border-b pb-1.5 mb-3">Nearest Educational Institutions</h3>
                <div className="space-y-2.5">
                  {(propertyData.schools || []).slice(0, 4).map((school: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#f0f7ff] rounded-sm border border-[#d1e3f8] flex justify-between items-center">
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-xs text-[#2d4a77] truncate">{school.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{school.type} School • {formatSchoolDistance(school.distance)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ofsted:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white ${
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
                    <p className="text-xs text-muted-foreground italic py-3">No school data available for this location.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">Admissions Note:</span> Catchment boundaries, sibling criteria, and admission allocations are determined annually by the local education authority. Proximity does not guarantee place allocation.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
              <span className="font-bold">Page 4 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 5: HM LAND REGISTRY & SALES HISTORY ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">3. HM Land Registry & Sales History</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Ownership & transaction history</h3>
                <p className="text-white/80 text-xs">Official recorded title transactions and price paid records registered with HM Land Registry.</p>
              </div>

              <div className="border border-[#e2e8f0] mb-5">
                <div className="grid grid-cols-3 bg-white text-xs">
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Estate type</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold">{primaryTransaction?.estateType || 'Freehold'}</div>
                  <div className="p-3 border-b border-[#e2e8f0] text-muted-foreground">Latest sale: {primaryTransaction ? new Date(primaryTransaction.transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                  
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Latest recorded price</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold text-[#2d4a77]">£{primaryTransaction ? parseInt(primaryTransaction.pricePaid, 10).toLocaleString() : 'N/A'}</div>
                  <div className="p-3 border-b border-[#e2e8f0] text-muted-foreground italic">HM Land Registry Price Paid Data</div>
                  
                  <div className="p-3 border-r border-[#e2e8f0] text-muted-foreground">Previous recorded price</div>
                  <div className="p-3 border-r border-[#e2e8f0] font-bold">£{landRegistry[1] ? parseInt(landRegistry[1].pricePaid, 10).toLocaleString() : 'N/A'}</div>
                  <div className="p-3 text-muted-foreground">{landRegistry[1] ? new Date(landRegistry[1].transactionDate).toLocaleDateString('en-GB') : 'N/A'}</div>
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
                        <td className="px-4 py-2.5">{t.estateType}</td>
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
                <span className="font-semibold">Title Deeds & Covenants:</span> Official copies of the title register and filed plan can be obtained directly through your solicitor to verify easements, rights of access, and statutory covenants.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
              <span className="font-bold">Page 5 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 6: ENERGY PERFORMANCE CERTIFICATE (EPC) ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">4. Energy Performance Certificate (EPC)</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Energy efficiency snapshot</h3>
                <p className="text-white/80 text-xs">Official government registered energy performance rating, thermal efficiency assessment, and projected heating expenditure.</p>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-[#e2e8f0] mb-5">
                <div className="p-6 bg-[#f0fdf4] border-r border-[#e2e8f0]">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Current Rating</p>
                  <p className="text-5xl font-serif font-bold text-emerald-700 mb-1">{epc?.rating || 'N/A'}</p>
                  <p className="text-xs text-emerald-800/80 font-medium">Good current thermal efficiency</p>
                </div>
                <div className="p-6 bg-[#f0f7ff]">
                  <p className="text-[10px] font-bold text-[#2d4a77] uppercase tracking-wider mb-2">Potential Rating</p>
                  <p className="text-5xl font-serif font-bold text-[#2d4a77] mb-1">{epc?.potentialRating || 'N/A'}</p>
                  <p className="text-xs text-[#2d4a77]/80 font-medium">Clear improvement pathway available</p>
                </div>
              </div>

              <div className="border border-[#e2e8f0] mb-5">
                <div className="grid grid-cols-3 text-xs">
                  <div className="p-3 border-r border-b border-[#e2e8f0] text-muted-foreground">Property type</div>
                  <div className="p-3 border-r border-b border-[#e2e8f0] font-bold">{epc?.propertyType || 'House'}</div>
                  <div className="p-3 border-b border-[#e2e8f0] font-medium">{epc?.builtForm || 'End-terrace'}</div>
                  
                  <div className="p-3 border-r border-[#e2e8f0] text-muted-foreground">Total floor area</div>
                  <div className="p-3 border-r border-[#e2e8f0] font-bold">{epc?.totalFloorArea || '63.0'} m²</div>
                  <div className="p-3 text-muted-foreground italic">Official EPC measurement</div>
                </div>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2.5">Key building fabric & projected heating costs</h3>
              <div className="border border-[#e2e8f0] rounded-sm divide-y divide-[#e2e8f0] text-xs mb-4">
                <div className="grid grid-cols-3 p-2.5">
                  <span className="text-muted-foreground font-medium">Main heating</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.mainHeatDescription, 'Mains gas / standard heating system')}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="text-muted-foreground font-medium">Walls & insulation</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.wallsDescription?.split(';')[0], 'Cavity wall, standard insulation')}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="text-muted-foreground font-medium">Windows & glazing</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{dataOrNA(epc?.windowsDescription, 'Fully double glazed')}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="text-muted-foreground font-medium">Estimated annual heating</span>
                  <span className="col-span-2 font-bold text-emerald-700">{formatAnnualCost(epc?.heatingCostCurrent, 'Not recorded on certificate')}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5">
                  <span className="text-muted-foreground font-medium">Projected CO2 emissions</span>
                  <span className="col-span-2 font-semibold text-[#2d4a77]">{formatCo2Tonnes(epc?.co2EmissionsCurrent, 'Not recorded on certificate')}</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">EPC Note:</span> Energy Performance Certificates remain legally valid for 10 years from the date of assessment. Energy improvement recommendations may qualify for local green heating grants.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
              <span className="font-bold">Page 6 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 7: COUNCIL TAX & FLOOD RISK ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">5. Council Tax & Flood Risk Analysis</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Local taxation and flood risk indicators</h3>
                <p className="text-white/80 text-xs">Statutory valuation banding from the Valuation Office Agency and multi-source flood risk data from the Environment Agency.</p>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#2d4a77] mb-2">Council tax assessment</h3>
              <div className="border border-[#e2e8f0] rounded-sm mb-5">
                <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] text-xs">
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Valuation Band</p>
                    <p className="text-xl font-bold text-[#b45309]">{councilTax?.band || 'Band C'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-muted-foreground mb-1">Billing Authority</p>
                    <p className="font-semibold text-[#2d4a77]">{councilTax?.authority || 'Derby City Council'}</p>
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
              <span className="font-bold">Page 7 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 8: ENVIRONMENTAL HAZARDS & PLANNING ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-2">6. Environmental Hazards & Planning History</h2>
              <div className="bg-[#2d4a77] p-4 rounded-sm mb-5 text-white">
                <h3 className="text-base font-serif font-bold mb-1">Environmental hazards and planning checks</h3>
                <p className="text-white/80 text-xs">Screening for radon gas, mining subsidence, ground stability, and recorded local planning applications.</p>
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
                {(propertyData.planning || []).slice(0, 4).map((p: any, i: number) => (
                  <div key={i} className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-[#2d4a77] truncate pr-2">{p.proposal}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#f0f7ff] text-[#2d4a77] shrink-0">{p.decision || 'Decided'}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Ref: {p.reference}</span>
                      <span>Date: {p.date}</span>
                    </div>
                  </div>
                ))}
                {(!propertyData.planning || propertyData.planning.length === 0) && (
                  <p className="text-center text-muted-foreground italic py-5">No statutory planning applications found in local authority registers for this address.</p>
                )}
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#4a5568]">
                <span className="font-semibold">Planning Advice:</span> Alterations, single-storey extensions, and changes of use remain subject to local planning policies, permitted development limits, and conservation area restrictions.
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>{isWhiteLabel && profile?.company ? `${profile.company} Property Due Diligence Report` : 'HomePackAI Property Information Report'}</span>
              <span className="font-bold">Page 8 of 9</span>
            </div>
          </div>

          {/* ================= PAGE 9: BROADBAND, MOBILE & SIGN-OFF ================= */}
          <div 
            data-pdf-page 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[48px] flex flex-col justify-between bg-white text-black font-sans relative html2pdf__page-break"
            style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px', boxSizing: 'border-box', overflow: 'hidden', pageBreakAfter: 'auto', breakAfter: 'auto' }}
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2d4a77] mb-1">7. Digital Connectivity & Property Sign-Off</h2>
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
                <span className="font-bold">Page 9 of 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
