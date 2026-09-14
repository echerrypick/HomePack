import React, { useState } from 'react';
import { 
  Stethoscope, 
  Clock, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MapPin, 
  Info,
  BadgeCheck,
  Check,
  Building,
  Sparkles
} from 'lucide-react';
import { HealthcareAccessData, GpSurgery, DentistPractice, Pharmacy } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthcareDisplayProps {
  data?: HealthcareAccessData;
  postcode?: string;
}

export function HealthcareDisplay({ data, postcode }: HealthcareDisplayProps) {
  const [activeTab, setActiveTab] = useState<'gp' | 'dentists' | 'pharmacies'>('gp');

  if (!data) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
        <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        <p className="font-medium text-foreground">Healthcare Data Unavailable</p>
        <p className="text-xs text-muted-foreground mt-1">
          Unable to retrieve local GP and dental practice registries for this location.
        </p>
      </div>
    );
  }

  const { gpSurgeries = [], dentists = [], pharmacies = [], summary } = data;

  // Helper for CQC rating color badge
  const renderCqcBadge = (rating?: string) => {
    if (!rating) {
      return (
        <Badge variant="outline" className="text-[11px] font-medium bg-muted/30">
          CQC: Registered
        </Badge>
      );
    }
    const rLower = rating.toLowerCase();
    if (rLower.includes('outstanding')) {
      return (
        <Badge className="bg-purple-700 hover:bg-purple-700 text-white font-semibold text-[11px] gap-1 shadow-2xs">
          <BadgeCheck className="h-3 w-3" />
          CQC: Outstanding
        </Badge>
      );
    }
    if (rLower.includes('good') || rLower.includes('compliant')) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold text-[11px] gap-1 shadow-2xs">
          <CheckCircle2 className="h-3 w-3" />
          CQC: Good
        </Badge>
      );
    }
    if (rLower.includes('requires improvement')) {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-semibold text-[11px] gap-1 shadow-2xs">
          <AlertCircle className="h-3 w-3" />
          CQC: Requires Improvement
        </Badge>
      );
    }
    if (rLower.includes('inadequate')) {
      return (
        <Badge className="bg-red-600 hover:bg-red-600 text-white font-semibold text-[11px] gap-1 shadow-2xs">
          <AlertCircle className="h-3 w-3" />
          CQC: Inadequate
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[11px] font-medium">
        CQC: {rating}
      </Badge>
    );
  };

  const acceptingCount = gpSurgeries.filter(g => g.isAcceptingNewPatients).length;
  const nhsDentistCount = dentists.filter(d => d.isAcceptingNhsPatients).length;

  return (
    <div className="space-y-6">
      {/* Overview Card with responsive, non-overflowing metrics */}
      <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Primary Care & Community Health
            </span>
            <Badge variant="outline" className="text-[10px] h-5 px-2 font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
              NHS England & CQC Grounded
            </Badge>
          </div>
          {postcode && (
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
              Postcode: {postcode}
            </span>
          )}
        </div>

        <p className="text-xs text-foreground/80 leading-relaxed">
          {summary || `Primary healthcare directory for ${postcode || 'this property'}, combining operational patient-acceptance records with independent Care Quality Commission (CQC) inspection ratings.`}
        </p>

        {/* 3-Column Responsive Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-1">
          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400 shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                GP Surgeries
              </span>
              <span className="text-base font-bold text-foreground block">
                {gpSurgeries.length} Identified
              </span>
              <span className={`text-[11px] font-medium block truncate ${acceptingCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600'}`}>
                {acceptingCount > 0 ? `✓ ${acceptingCount} accepting new patients` : 'Consult practices directly'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Dental Practices
              </span>
              <span className="text-base font-bold text-foreground block">
                {dentists.length} Nearby
              </span>
              <span className={`text-[11px] font-medium block truncate ${nhsDentistCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
                {nhsDentistCount > 0 ? `✓ ${nhsDentistCount} taking NHS patients` : 'Private & referral active'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Dispensing Pharmacy
              </span>
              <span className="text-base font-bold text-foreground block">
                {pharmacies[0]?.distance || '< 1.0 mi'}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate font-medium">
                {pharmacies[0]?.name || 'Community Chemist'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Category Selector Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('gp')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'gp' 
                ? 'bg-[#1e3a8a] text-white shadow-xs ring-2 ring-[#1e3a8a]/20' 
                : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>GP Surgeries ({gpSurgeries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dentists')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'dentists' 
                ? 'bg-[#1e3a8a] text-white shadow-xs ring-2 ring-[#1e3a8a]/20' 
                : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>NHS Dentists ({dentists.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'pharmacies' 
                ? 'bg-[#1e3a8a] text-white shadow-xs ring-2 ring-[#1e3a8a]/20' 
                : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pharmacies ({pharmacies.length})</span>
          </button>
        </div>

        {/* --- TAB 1: GP SURGERIES --- */}
        {activeTab === 'gp' && (
          <div className="space-y-3 pt-1">
            {gpSurgeries.length > 0 ? (
              gpSurgeries.map((gp, idx) => (
                <div 
                  key={idx} 
                  className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card hover:border-border transition-colors shadow-2xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">{gp.name}</h4>
                        {gp.odsCode && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground font-semibold">
                            ODS: {gp.odsCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{gp.address} • {gp.postcode}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs font-semibold bg-muted/40">
                        {gp.distance}
                      </Badge>
                      {renderCqcBadge(gp.cqcRating)}
                    </div>
                  </div>

                  {/* Key Operational Statuses */}
                  <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Accepting Patients Pill */}
                    <div className={`p-2.5 rounded-lg border ${
                      gp.isAcceptingNewPatients 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60' 
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60'
                    }`}>
                      <div className="flex items-center gap-2">
                        {gp.isAcceptingNewPatients ? (
                          <>
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                                Patient Registration
                              </span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                Currently Accepting New NHS Patients
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block tracking-wider">
                                Patient Registration
                              </span>
                              <span className="font-bold text-amber-700 dark:text-amber-400">
                                List Temporarily Closed / Capacity Reached
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* CQC Details & Links */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                          Inspection & Regulation
                        </span>
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          {gp.cqcPublicationDate ? `Inspected ${new Date(gp.cqcPublicationDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : 'CQC Registered & Compliant'}
                        </span>
                      </div>
                      {gp.cqcReportUrl && (
                        <a
                          href={gp.cqcReportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 shrink-0 ml-2"
                        >
                          CQC Report <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Contact & Surgery Links */}
                  {(gp.phone || gp.website) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40 text-muted-foreground">
                      {gp.phone && (
                        <a 
                          href={`tel:${gp.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{gp.phone}</span>
                        </a>
                      )}
                      {gp.website && (
                        <a 
                          href={gp.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Practice Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                No GP surgeries found for this postcode search.
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: DENTISTS --- */}
        {activeTab === 'dentists' && (
          <div className="space-y-3 pt-1">
            {dentists.length > 0 ? (
              dentists.map((dentist, idx) => (
                <div 
                  key={idx} 
                  className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card hover:border-border transition-colors shadow-2xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">{dentist.name}</h4>
                        {dentist.odsCode && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground font-semibold">
                            ODS: {dentist.odsCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{dentist.address} • {dentist.postcode}</span>
                      </p>
                    </div>

                    <Badge variant="outline" className="text-xs font-semibold bg-muted/40 shrink-0 self-start sm:self-auto">
                      {dentist.distance}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* NHS Acceptance Status */}
                    <div className={`p-2.5 rounded-lg border ${
                      dentist.isAcceptingNhsPatients 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-border/60'
                    }`}>
                      <div className="flex items-center gap-2">
                        {dentist.isAcceptingNhsPatients ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                                NHS Provision
                              </span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                Accepting New NHS Patients
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                                NHS Provision
                              </span>
                              <span className="font-semibold text-amber-700 dark:text-amber-400">
                                Private Only / Referral Required
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quality Standards */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/50 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                          Regulatory Standards
                        </span>
                        <span className="font-semibold text-foreground">
                          {dentist.cqcRating || 'CQC Inspected & Regulated'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  {(dentist.phone || dentist.website) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40 text-muted-foreground">
                      {dentist.phone && (
                        <a 
                          href={`tel:${dentist.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{dentist.phone}</span>
                        </a>
                      )}
                      {dentist.website && (
                        <a 
                          href={dentist.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Practice Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                No dental practices identified in immediate radius.
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: PHARMACIES --- */}
        {activeTab === 'pharmacies' && (
          <div className="space-y-3 pt-1">
            {pharmacies.length > 0 ? (
              pharmacies.map((pharmacy, idx) => (
                <div 
                  key={idx} 
                  className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card hover:border-border transition-colors shadow-2xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">{pharmacy.name}</h4>
                        {pharmacy.odsCode && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground font-semibold">
                            ODS: {pharmacy.odsCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{pharmacy.address} • {pharmacy.postcode}</span>
                      </p>
                    </div>

                    <Badge variant="outline" className="text-xs font-semibold bg-muted/40 shrink-0 self-start sm:self-auto">
                      {pharmacy.distance}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/50 space-y-2.5 text-xs">
                    {/* Hours & Phone */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-foreground">
                          {pharmacy.openingHours || 'Mon-Fri: 09:00 - 18:00'}
                        </span>
                      </div>
                      {pharmacy.phone && (
                        <a 
                          href={`tel:${pharmacy.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{pharmacy.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Services tags */}
                    {pharmacy.services && pharmacy.services.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                          NHS Community Services Available
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pharmacy.services.map((svc, sIdx) => (
                            <span 
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-muted/80 text-foreground/80 text-[11px] font-medium"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                No dispensing pharmacies identified nearby.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advisory & Registration Note */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">NHS Patient Registration Rights & Boundary Guidance</p>
          <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] leading-relaxed">
            UK residents have a statutory right to register with any GP surgery whose practice boundary covers their home and is accepting new patients. Registration is completely free and by law does not require photographic ID, proof of address, or immigration status. For dental practices, patients can register anywhere in England with available NHS capacity.
          </p>
        </div>
      </div>
    </div>
  );
}
