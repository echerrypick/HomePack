import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Coins, 
  User, 
  Wifi, 
  Smartphone, 
  History, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Address } from '@/types';

interface GenerationSpotlightModalProps {
  address?: Address | null;
  onCancel?: () => void;
}

interface FeatureSpotlight {
  id: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
  linkUrl: string;
  linkLabel: string;
}

const SPOTLIGHT_FEATURES: FeatureSpotlight[] = [
  {
    id: 'council-tax',
    tag: 'Standalone Check',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    icon: Coins,
    title: 'Instant Council Tax Band Check',
    description: 'Need a fast valuation check without a full dossier? Lookup official Valuation Office Agency (VOA) bands and estimated annual rates for any UK postcode.',
    highlight: 'Official VOA valuation bands • Annual billing breakdown',
    linkUrl: '/council-tax',
    linkLabel: 'Open Council Tax Checker',
  },
  {
    id: 'profile',
    tag: 'Account Settings',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    icon: User,
    title: 'Customise Your Profile & Roles',
    description: 'Set your professional role (Homebuyer, Estate Agent, Surveyor, Conveyancer), contact telephone, firm/agency name, and default search area in "Your Profile".',
    highlight: 'Permitted fields saved securely • Customise report headers',
    linkUrl: '/profile',
    linkLabel: 'Manage Your Profile',
  },
  {
    id: 'broadband',
    tag: 'Connectivity Tool',
    tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    icon: Wifi,
    title: 'Broadband Speeds & Full Fibre (FTTP)',
    description: 'Verify whether gigabit FTTP broadband is live at any address, with real-time download and upload speed estimates from Openreach, Virgin Media, and alt-nets.',
    highlight: 'Gigabit FTTP availability • Critical for remote workers',
    linkUrl: '/broadband',
    linkLabel: 'Open Broadband Checker',
  },
  {
    id: 'mobile',
    tag: 'Telecoms Check',
    tagColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
    icon: Smartphone,
    title: 'Mobile Signal & 5G Reception',
    description: 'Check indoor and outdoor voice, data, and 5G coverage across all 4 primary UK mobile networks (EE, O2, Vodafone, and Three) to spot dead-zones.',
    highlight: 'Compare 4 networks side-by-side • Indoor & outdoor reception',
    linkUrl: '/mobile',
    linkLabel: 'Open Mobile Checker',
  },
  {
    id: 'history',
    tag: 'Personal Archive',
    tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    icon: History,
    title: 'Search History & Dossier Archive',
    description: 'Every HomePack you generate is automatically logged to your account. Revisit previous address searches, compare price histories, and re-download PDFs.',
    highlight: 'Instant report retrieval • Automatic cloud synchronisation',
    linkUrl: '/history',
    linkLabel: 'View Search History',
  },
  {
    id: 'guides',
    tag: 'Legal Guidance',
    tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
    icon: FileText,
    title: 'Buyer & Seller Guides & TA6 Checklists',
    description: 'Explore step-by-step conveyancing roadmaps, Law Society TA6 property information guidance, survey recommendations, and seller prep advice.',
    highlight: 'Speed up transactions • Clear legal requirements explained',
    linkUrl: '/buyer-guide',
    linkLabel: 'Explore Property Guides',
  },
  {
    id: 'sample-report',
    tag: 'Sample Showcase',
    tagColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
    icon: Sparkles,
    title: 'Sample Property Dossier Preview',
    description: 'See a finished HomePack report showcasing real Land Registry title boundaries, EPC certificate metrics, local planning, and environmental hazard breakdowns.',
    highlight: 'Preview completed report layout • Exportable PDF formatting',
    linkUrl: '/sample-report',
    linkLabel: 'View Sample Report',
  },
];

const GENERATION_STAGES = [
  'Querying HM Land Registry Price Paid & Title registers...',
  'Retrieving official Energy Performance Certificate (EPC)...',
  'Analyzing Environment Agency Flood & Radon risk registers...',
  'Checking Local Planning Authority and Council Tax bands...',
  'Scanning Ofcom Broadband & Mobile 5G Signal coverage...',
  'Synthesizing AI Property Intelligence Summary...',
];

export function GenerationSpotlightModal({ address, onCancel }: GenerationSpotlightModalProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Cycle through generation stages sequentially
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(stageInterval);
  }, []);

  // Auto-advance spotlight features every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentFeatureIndex((idx) => (idx + 1) % SPOTLIGHT_FEATURES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % SPOTLIGHT_FEATURES.length);
  };

  const handlePrevFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + SPOTLIGHT_FEATURES.length) % SPOTLIGHT_FEATURES.length);
  };

  const handleSelectFeature = (index: number) => {
    setCurrentFeatureIndex(index);
  };

  const activeFeature = SPOTLIGHT_FEATURES[currentFeatureIndex];
  const FeatureIcon = activeFeature.icon;

  const addressFormatted = address 
    ? `${address.houseNumber} ${address.street}, ${address.town ? address.town + ', ' : ''}${address.postcode}`
    : 'Selected Property';

  const progressPercent = Math.min(96, Math.round(((stageIndex + 1) / GENERATION_STAGES.length) * 100));

  // Minimized floating banner view
  if (isMinimized) {
    return (
      <div 
        id="generation-minimized-pill" 
        className="fixed bottom-6 right-6 z-50 bg-card border-2 border-primary/40 shadow-2xl rounded-2xl p-4 max-w-sm flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 -rotate-90">
              <circle cx="20" cy="20" r="16" className="text-muted stroke-current" strokeWidth="3" fill="transparent" />
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                className="text-primary stroke-current transition-all duration-500" 
                strokeWidth="3" 
                strokeDasharray={2 * Math.PI * 16} 
                strokeDashoffset={2 * Math.PI * 16 - (2 * Math.PI * 16 * progressPercent) / 100}
                strokeLinecap="round" 
                fill="transparent" 
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate text-foreground">Generating HomePack...</div>
            <div className="text-[11px] text-muted-foreground truncate">{GENERATION_STAGES[stageIndex]}</div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={() => setIsMinimized(false)}
          title="Restore full feature spotlight"
          className="shrink-0"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      id="generation-spotlight-overlay"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="generation-spotlight-modal"
        className="w-full max-w-2xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col relative my-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Header & Generation Status with Radial Progress Spinner */}
        <div className="p-6 pb-5 bg-gradient-to-b from-primary/5 via-muted/20 to-transparent border-b border-border/60">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-4">
              {/* Radial Circle Progress Spinner */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90">
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="23" 
                    className="text-muted/50 stroke-current" 
                    strokeWidth="4" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="23" 
                    className="text-primary stroke-current transition-all duration-700 ease-out" 
                    strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 23} 
                    strokeDashoffset={2 * Math.PI * 23 - (2 * Math.PI * 23 * progressPercent) / 100}
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-primary">{progressPercent}%</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  Generating Your HomePack
                </h2>
                <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
                  {addressFormatted}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMinimized(true)}
              title="Minimize to floating widget"
              className="text-muted-foreground hover:text-foreground shrink-0 -mr-2 -mt-2"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Live Stage Status */}
          <div className="bg-background/90 border border-border/70 rounded-lg p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-foreground font-medium truncate">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              <span className="truncate">{GENERATION_STAGES[stageIndex]}</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              Step {stageIndex + 1} of {GENERATION_STAGES.length}
            </span>
          </div>

          {/* Smooth Top Progress Bar */}
          <Progress value={progressPercent} className="h-1.5 w-full mt-2.5 bg-muted/50" />
        </div>

        {/* Feature Spotlight Card Area */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                While you wait • Site Features
              </span>
              <Badge variant="outline" className={activeFeature.tagColor}>
                {activeFeature.tag}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
                {isPaused ? '(Paused)' : '(Auto-advancing)'}
              </span>
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                {currentFeatureIndex + 1} / {SPOTLIGHT_FEATURES.length}
              </span>
            </div>
          </div>

          {/* Feature category quick-jump chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SPOTLIGHT_FEATURES.map((feat, idx) => (
              <button
                key={feat.id}
                onClick={() => handleSelectFeature(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                  idx === currentFeatureIndex
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted/80'
                }`}
              >
                {feat.title.split(' ')[0]} {feat.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>

          {/* Active Feature Spotlight Box */}
          <div 
            id={`feature-spotlight-${activeFeature.id}`}
            className="p-5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/40 transition-all space-y-3 relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-xs shrink-0">
                  <FeatureIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {activeFeature.title}
                  </h3>
                  <div className="text-[11px] text-primary flex items-center gap-1 font-medium mt-0.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    {activeFeature.highlight}
                  </div>
                </div>
              </div>

              {/* Open in new tab link */}
              <a
                href={activeFeature.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary bg-background px-3 py-1.5 rounded-lg border border-border shrink-0 shadow-xs transition-colors"
                title="Opens in new tab without interrupting report generation"
              >
                <span>{activeFeature.linkLabel}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeFeature.description}
            </p>
          </div>

          {/* Bottom simple status indicator: just showing current item + expanding/collapsing dots */}
          <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Expanding and Collapsing Dots */}
              <div className="flex items-center gap-1.5 shrink-0" role="tablist" aria-label="Feature spotlights">
                {SPOTLIGHT_FEATURES.map((feat, idx) => {
                  const isActive = idx === currentFeatureIndex;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => handleSelectFeature(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'w-7 bg-primary shadow-xs' 
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Jump to ${feat.title}`}
                      title={feat.title}
                    />
                  );
                })}
              </div>

              {/* Showing what it is currently on */}
              <span className="text-xs font-semibold text-foreground/85 truncate">
                {activeFeature.title} ...
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                id="spotlight-prev-btn"
                variant="ghost"
                size="icon-sm"
                onClick={handlePrevFeature}
                aria-label="Previous feature"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                id="spotlight-next-btn"
                variant="ghost"
                size="icon-sm"
                onClick={handleNextFeature}
                aria-label="Next feature"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer / Assurance */}
        <div className="px-6 py-3.5 bg-muted/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Connecting official Land Registry, EPC, & Environmental databases</span>
          </div>
          <span className="hidden sm:inline italic text-[11px] text-primary font-medium">
            Display will update automatically
          </span>
        </div>
      </div>
    </div>
  );
}
