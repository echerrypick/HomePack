import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Car, 
  Home, 
  Users, 
  Flame, 
  Info, 
  Building2, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import { CrimeData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CrimeDisplayProps {
  data?: CrimeData;
  postcode?: string;
}

export function CrimeDisplay({ data, postcode }: CrimeDisplayProps) {
  const [trendFilter, setTrendFilter] = useState<'all' | 'burglary' | 'vehicle' | 'asb' | 'violence'>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);

  if (!data) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
        <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        <p className="font-medium text-foreground">Police.uk Crime Data Unavailable</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Street-level crime records could not be retrieved from data.police.uk for this coordinate.
        </p>
      </div>
    );
  }

  const {
    totalLast12Months,
    monthlyAverage,
    latestMonth,
    earliestMonth,
    monthlyTrends = [],
    categoryBreakdown = [],
    benchmarks,
    keyCategories,
    recentIncidents = [],
    policeForce,
    source
  } = data;

  // Max value in monthly trends for chart scaling
  const getTrendValue = (m: any) => {
    if (trendFilter === 'burglary') return m.burglary;
    if (trendFilter === 'vehicle') return m.vehicleCrime;
    if (trendFilter === 'asb') return m.antiSocialBehaviour;
    if (trendFilter === 'violence') return m.violentCrime;
    return m.totalCrimes;
  };

  const trendValues = monthlyTrends.map(getTrendValue);
  const maxTrendVal = Math.max(...trendValues, 1);

  // Safety Score Styling
  const getSafetyBadge = (rating: string, score: number) => {
    if (score >= 85) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1.5 px-3 py-1 font-semibold text-xs shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          {rating} • {score}/100
        </Badge>
      );
    }
    if (score >= 70) {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-600 text-white gap-1.5 px-3 py-1 font-semibold text-xs shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          {rating} • {score}/100
        </Badge>
      );
    }
    if (score >= 55) {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-600 text-white gap-1.5 px-3 py-1 font-semibold text-xs shadow-2xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          {rating} • {score}/100
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-600 hover:bg-rose-600 text-white gap-1.5 px-3 py-1 font-semibold text-xs shadow-2xs">
        <ShieldAlert className="h-3.5 w-3.5" />
        {rating} • {score}/100
      </Badge>
    );
  };

  // Difference percentage label
  const renderDiffBadge = (diffPercent: number, comparison: 'Lower' | 'Average' | 'Higher') => {
    const isLower = diffPercent < 0;
    const absDiff = Math.abs(diffPercent);

    if (comparison === 'Lower' || isLower) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200/50">
          <TrendingDown className="h-3 w-3" />
          {absDiff}% Lower
        </span>
      );
    }
    if (comparison === 'Higher' || diffPercent > 10) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-200/50">
          <TrendingUp className="h-3 w-3" />
          {absDiff}% Higher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
        In line with average
      </span>
    );
  };

  const displayedCategories = showAllCategories ? categoryBreakdown : categoryBreakdown.slice(0, 6);

  return (
    <div className="space-y-6" id="crime-safety-section">
      {/* 1. Executive Summary & Safety Rating Card */}
      <div className="bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-xl p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Crime & Neighbourhood Safety
              </h3>
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground bg-muted/40">
                1-Mile Radius
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Home Office police data recorded across the immediate ~1 mile catchment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getSafetyBadge(benchmarks?.safetyRating || 'Verified', benchmarks?.safetyScore || 75)}
          </div>
        </div>

        {/* 3-Column Comparative Benchmark Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
          {/* Local Area */}
          <div className="bg-background rounded-lg border border-border/80 p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Local Radius Rate
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {benchmarks?.localAnnualRatePer1000 || '0'}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ 1k pop</span>
            </div>
            <div className="text-xs text-muted-foreground pt-0.5">
              <span className="font-semibold text-foreground">{totalLast12Months}</span> crimes recorded over 12 months (avg. {monthlyAverage}/mo)
            </div>
          </div>

          {/* Regional Police Force Benchmark */}
          <div className="bg-background rounded-lg border border-border/80 p-3.5 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                {benchmarks?.forceName || 'Force Benchmark'}
              </span>
              {renderDiffBadge(benchmarks?.vsForceDifferencePercent || 0, benchmarks?.vsForceComparison || 'Average')}
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {benchmarks?.forceRatePer1000 || '81.2'}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ 1k pop</span>
            </div>
            <div className="text-xs text-muted-foreground pt-0.5">
              Regional constabulary benchmark average
            </div>
          </div>

          {/* National Benchmark */}
          <div className="bg-background rounded-lg border border-border/80 p-3.5 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                National Benchmark
              </span>
              {renderDiffBadge(benchmarks?.vsNationalDifferencePercent || 0, benchmarks?.vsNationalComparison || 'Average')}
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              {benchmarks?.nationalRatePer1000 || '85.5'}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ 1k pop</span>
            </div>
            <div className="text-xs text-muted-foreground pt-0.5">
              England & Wales baseline (ONS Recorded Crime)
            </div>
          </div>
        </div>

        {/* Local police force contact pill */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>Policed by <strong className="text-foreground">{policeForce.name}</strong></span>
            <span className="text-muted-foreground/40">•</span>
            <span>Non-emergency: <strong className="text-foreground">{policeForce.telephone || '101'}</strong></span>
          </div>
          {policeForce.url && (
            <a 
              href={policeForce.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Police force website
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Key Focus Categories for Home Buyers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-primary" />
            Priority Categories for Property Buyers
          </h4>
          <span className="text-xs text-muted-foreground">
            Ranked by buyer impact & risk profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Burglary */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Home className="h-3.5 w-3.5 text-amber-600" />
                  Burglary
                </span>
                <Badge variant={keyCategories.burglary.riskLevel === 'Low' ? 'secondary' : keyCategories.burglary.riskLevel === 'Moderate' ? 'outline' : 'destructive'} className="text-[10px] font-semibold px-2 py-0">
                  {keyCategories.burglary.riskLevel} Risk
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {keyCategories.burglary.count}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({keyCategories.burglary.percentage}%)
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg. <strong className="text-foreground">{keyCategories.burglary.monthlyAvg}/mo</strong> within 1 mile
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
              {keyCategories.burglary.status === 'Lower' 
                ? 'Rate is below the national average for residential & commercial break-ins.'
                : keyCategories.burglary.status === 'Higher'
                ? 'Rate is elevated vs national average. Consider smart locks & security alarms.'
                : 'Consistent with regional average break-in rates.'}
            </div>
          </div>

          {/* Vehicle Crime */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Car className="h-3.5 w-3.5 text-blue-600" />
                  Vehicle Crime
                </span>
                <Badge variant={keyCategories.vehicleCrime.riskLevel === 'Low' ? 'secondary' : keyCategories.vehicleCrime.riskLevel === 'Moderate' ? 'outline' : 'destructive'} className="text-[10px] font-semibold px-2 py-0">
                  {keyCategories.vehicleCrime.riskLevel} Risk
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {keyCategories.vehicleCrime.count}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({keyCategories.vehicleCrime.percentage}%)
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg. <strong className="text-foreground">{keyCategories.vehicleCrime.monthlyAvg}/mo</strong> within 1 mile
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
              Theft of and from motor vehicles. Off-street driveway or garage parking provides substantial protection.
            </div>
          </div>

          {/* Anti-Social Behaviour */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                  Anti-Social Behaviour
                </span>
                <Badge variant={keyCategories.asb.riskLevel === 'Low' ? 'secondary' : keyCategories.asb.riskLevel === 'Moderate' ? 'outline' : 'destructive'} className="text-[10px] font-semibold px-2 py-0">
                  {keyCategories.asb.riskLevel} Risk
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {keyCategories.asb.count}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({keyCategories.asb.percentage}%)
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg. <strong className="text-foreground">{keyCategories.asb.monthlyAvg}/mo</strong> within 1 mile
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
              Street noise, nuisance gatherings, or neighbour disputes recorded by local policing teams.
            </div>
          </div>

          {/* Violent Crime */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Activity className="h-3.5 w-3.5 text-rose-600" />
                  Violence & Safety
                </span>
                <Badge variant={keyCategories.violentCrime.riskLevel === 'Low' ? 'secondary' : keyCategories.violentCrime.riskLevel === 'Moderate' ? 'outline' : 'destructive'} className="text-[10px] font-semibold px-2 py-0">
                  {keyCategories.violentCrime.riskLevel} Risk
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {keyCategories.violentCrime.count}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({keyCategories.violentCrime.percentage}%)
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg. <strong className="text-foreground">{keyCategories.violentCrime.monthlyAvg}/mo</strong> within 1 mile
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
              Recorded personal disputes, harassment, and public incidents across the wider 1-mile perimeter.
            </div>
          </div>
        </div>
      </div>

      {/* 3. 12-Month Trend Visualizer */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              12-Month Crime Trend Timeline
            </h4>
            <p className="text-xs text-muted-foreground">
              Monthly recorded incidents from {earliestMonth} to {latestMonth}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Crimes' },
              { id: 'burglary', label: 'Burglary' },
              { id: 'vehicle', label: 'Vehicle' },
              { id: 'asb', label: 'ASB' },
              { id: 'violence', label: 'Violence' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={trendFilter === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrendFilter(tab.id as any)}
                className="h-7 text-[11px] px-2.5 rounded-full"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-2">
          <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2 pt-6 px-1">
            {monthlyTrends.map((m, idx) => {
              const val = getTrendValue(m);
              const heightPercent = Math.max(8, Math.round((val / maxTrendVal) * 100));

              return (
                <div key={m.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-foreground text-background text-[10px] font-medium py-0.5 px-1.5 rounded shadow-xs whitespace-nowrap z-10">
                    {val} incidents ({m.displayMonth})
                  </div>

                  {/* Number label above bar */}
                  <span className="text-[10px] font-semibold text-muted-foreground mb-1 group-hover:text-foreground transition-colors">
                    {val}
                  </span>

                  {/* The Bar */}
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      trendFilter === 'burglary' ? 'bg-amber-500/80 group-hover:bg-amber-600' :
                      trendFilter === 'vehicle' ? 'bg-blue-500/80 group-hover:bg-blue-600' :
                      trendFilter === 'asb' ? 'bg-purple-500/80 group-hover:bg-purple-600' :
                      trendFilter === 'violence' ? 'bg-rose-500/80 group-hover:bg-rose-600' :
                      'bg-primary/80 group-hover:bg-primary'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Month label below bar */}
                  <div className="mt-2 text-[10px] text-muted-foreground text-center truncate max-w-full group-hover:text-foreground font-medium">
                    {m.displayMonth.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Historical 12-month baseline</span>
            <span>Monthly average for selected view: <strong className="text-foreground">
              {trendFilter === 'burglary' ? keyCategories.burglary.monthlyAvg :
               trendFilter === 'vehicle' ? keyCategories.vehicleCrime.monthlyAvg :
               trendFilter === 'asb' ? keyCategories.asb.monthlyAvg :
               trendFilter === 'violence' ? keyCategories.violentCrime.monthlyAvg :
               monthlyAverage}
            </strong></span>
          </div>
        </div>
      </div>

      {/* 4. Complete Category Breakdown Table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-foreground">
              Incident Category Distribution
            </h4>
            <p className="text-xs text-muted-foreground">
              Comprehensive breakdown of all recorded offences across the 12-month period
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {categoryBreakdown.length} Categories
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {displayedCategories.map((cat) => (
            <div key={cat.categoryKey} className="py-2.5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">
                    {cat.label}
                  </span>
                  <Badge 
                    variant={cat.riskLevel === 'Low' ? 'secondary' : cat.riskLevel === 'Moderate' ? 'outline' : 'destructive'} 
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {cat.riskLevel}
                  </Badge>
                </div>
                {cat.description && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Visual share bar */}
                <div className="w-20 hidden sm:block bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${Math.min(100, cat.percentage * 2)}%` }} 
                  />
                </div>
                <div className="text-right w-16">
                  <span className="font-bold text-foreground">{cat.count}</span>
                  <span className="text-[11px] text-muted-foreground ml-1">({cat.percentage}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categoryBreakdown.length > 6 && (
          <div className="pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              {showAllCategories 
                ? 'Show Top 6 Categories' 
                : `View All ${categoryBreakdown.length} Crime Categories`}
            </Button>
          </div>
        )}
      </div>

      {/* 5. Recent Street-Level Incidents Sample */}
      {recentIncidents.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                Latest Street-Level Incidents Sample
              </h4>
              <p className="text-xs text-muted-foreground">
                Recent police reports in latest recorded month ({latestMonth})
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] text-muted-foreground">
              {recentIncidents.length} Samples
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {recentIncidents.map((incident, idx) => (
              <div 
                key={`${incident.id}-${idx}`}
                className="p-3 bg-muted/20 hover:bg-muted/40 transition-colors rounded-lg border border-border/70 flex flex-col justify-between text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground truncate">
                    {incident.streetName}
                  </span>
                  <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
                    {incident.categoryLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="truncate max-w-[200px]" title={incident.outcomeStatus}>
                    {incident.outcomeStatus || 'Under investigation'}
                  </span>
                  <span className="text-muted-foreground/80 font-mono text-[10px]">
                    {incident.month}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/80 italic pt-1">
            * Exact street locations are anonymized by the Home Office to protect victim privacy while preserving geographic precision.
          </p>
        </div>
      )}

      {/* 6. Home Buyer Security Advisory */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs leading-relaxed text-foreground">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Buyer Safety Guidance for this Location
          </p>
          <p className="text-muted-foreground">
            {benchmarks?.vsNationalDifferencePercent <= -15 ? (
              <>
                This property is located in an area with a <strong>significantly lower crime rate than the national average ({Math.abs(benchmarks.vsNationalDifferencePercent)}% below)</strong>. Standard home insurance policies generally reflect these favorable risk ratings. Standard smart locks, external motion lighting, and joining the local Neighbourhood Watch are recommended best practices.
              </>
            ) : (
              <>
                Vehicle crime and burglary are key considerations when assessing property security. During property viewings, verify the condition of window locks, garden perimeter fences, driveway lighting, and whether an active alarm or Ring doorbell system is installed.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
