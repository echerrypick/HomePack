import React from 'react';
import { 
  Home, 
  Landmark, 
  Zap, 
  Coins, 
  Waves, 
  ShieldAlert, 
  ClipboardList, 
  Wifi, 
  Smartphone, 
  Camera,
  Download,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cleanDataValue } from './report-display';

interface PropertyQuickNavProps {
  propertyData: any;
  primaryTransaction?: any;
  epc?: any;
  councilTax?: any;
  floodRisk?: any;
  broadband?: any;
  onDownloadPdf?: () => void;
  canDownloadPdf: boolean;
  isDownloading: boolean;
  onUnlockB2C?: () => void;
}

export function PropertyQuickNav({
  propertyData,
  primaryTransaction,
  epc,
  councilTax,
  floodRisk,
  broadband,
  onDownloadPdf,
  canDownloadPdf,
  isDownloading,
  onUnlockB2C,
}: PropertyQuickNavProps) {
  const sections = [
    { id: 'section-summary', label: 'Executive Summary', icon: Home },
    { id: 'section-schools', label: 'Map & Schools', icon: Home },
    { id: 'section-land-registry', label: 'Land Registry', icon: Landmark },
    { id: 'section-epc', label: 'Energy Performance', icon: Zap },
    { id: 'section-council-tax', label: 'Council Tax', icon: Coins },
    { id: 'section-flood', label: 'Flood Risk', icon: Waves },
    { id: 'section-environmental', label: 'Environmental', icon: ShieldAlert },
    { id: 'section-planning', label: 'Planning History', icon: ClipboardList },
    { id: 'section-broadband', label: 'Broadband', icon: Wifi },
    { id: 'section-mobile', label: 'Mobile Coverage', icon: Smartphone },
    { id: 'section-condition', label: 'AI Condition Report', icon: Camera },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get EPC Badge Color
  const epcRating = epc?.rating ? String(epc.rating).toUpperCase() : null;
  const epcBg = 
    epcRating === 'A' ? 'bg-emerald-600' :
    epcRating === 'B' ? 'bg-emerald-500' :
    epcRating === 'C' ? 'bg-lime-600' :
    epcRating === 'D' ? 'bg-amber-500' :
    epcRating === 'E' ? 'bg-orange-500' :
    epcRating === 'F' ? 'bg-red-500' :
    epcRating === 'G' ? 'bg-red-700' : 'bg-slate-500';

  // Get Price Paid formatted
  const pricePaid = primaryTransaction?.pricePaid 
    ? `£${parseInt(primaryTransaction.pricePaid, 10).toLocaleString('en-GB')}` 
    : 'Not recorded';

  // Council tax band
  const ctBand = councilTax?.band ? `Band ${councilTax.band}` : 'Recorded';
  const ctAmount = councilTax?.annualAmount || null;

  // Flood risk summary
  const floodLevel = floodRisk?.riskOfFloodingFromRiversAndSea || 'Low';
  const isFloodHigh = floodLevel.toLowerCase().includes('high');
  const isFloodMed = floodLevel.toLowerCase().includes('medium');

  return (
    <div className="space-y-5 sticky top-20">
      {/* Key Facts Summary Card */}
      <Card className="shadow-xs border-border/80 bg-card rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-border/60 py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Key Facts at a Glance</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] h-4.5 font-medium px-1.5 bg-background">
              Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 space-y-2.5 text-xs">
          {/* Price & Tenure */}
          <div className="flex items-center justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground font-medium">Last Sold:</span>
            <span className="font-bold text-foreground text-right">{pricePaid}</span>
          </div>

          {/* EPC Rating */}
          <div className="flex items-center justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground font-medium">EPC Energy:</span>
            {epcRating ? (
              <Badge className={`${epcBg} text-white font-bold h-5 px-2 text-[11px] border-none`}>
                Band {epcRating}
              </Badge>
            ) : (
              <span className="text-muted-foreground">Not recorded</span>
            )}
          </div>

          {/* Council Tax */}
          <div className="flex items-center justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground font-medium">Council Tax:</span>
            <div className="text-right">
              <span className="font-bold text-foreground">{ctBand}</span>
              {ctAmount && <span className="text-muted-foreground text-[10px] block">{ctAmount}/yr</span>}
            </div>
          </div>

          {/* Flood Risk */}
          <div className="flex items-center justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground font-medium">River/Sea Flood:</span>
            <Badge 
              variant="outline" 
              className={`h-5 text-[10px] font-semibold ${
                isFloodHigh ? 'bg-red-50 text-red-700 border-red-200' :
                isFloodMed ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {floodLevel}
            </Badge>
          </div>

          {/* Broadband */}
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground font-medium">Broadband Max:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {broadband?.maxDownloadSpeed || 'Ultrafast'}
            </span>
          </div>

          {/* Quick PDF Trigger */}
          <div className="pt-2 border-t border-border/60">
            {canDownloadPdf ? (
              <Button 
                size="sm" 
                className="w-full text-xs font-semibold gap-1.5 h-8.5 shadow-2xs"
                onClick={onDownloadPdf}
                disabled={isDownloading}
              >
                <Download className="h-3.5 w-3.5" />
                {isDownloading ? 'Generating PDF...' : 'Download Full 9-Page PDF'}
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="w-full text-xs font-semibold gap-1.5 h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                onClick={onUnlockB2C}
              >
                <Download className="h-3.5 w-3.5" />
                Unlock Full PDF (£9.99)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Quick Jump Navigator */}
      <Card className="shadow-xs border-border/80 bg-card rounded-xl overflow-hidden hidden md:block">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-border/60 py-2.5 px-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Report Contents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <nav className="space-y-0.5">
            {sections.map((s) => {
              const IconComp = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconComp className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
