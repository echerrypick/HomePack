import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Zap, 
  Waves, 
  PoundSterling, 
  Wifi, 
  Building2, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  LayoutGrid, 
  FileText, 
  MapPin,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type AiSummaryProps = {
  summary: string;
};

interface ParsedSection {
  id: string;
  category: string;
  icon: React.ElementType;
  theme: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    accent: string;
  };
  highlightBadge?: string;
  body: string;
}

export function AiSummary({ summary }: AiSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'narrative'>('structured');

  // Parse raw summary into structured executive categories (supports tables, pipes, bullets, <br>)
  const parsedData = useMemo(() => {
    if (!summary || typeof summary !== 'string') {
      return { address: '', sections: [], takeaway: '', unparsed: '', cleanProse: '' };
    }

    // 1. Normalize line breaks and convert <br> tags to standard newlines
    let text = summary.replace(/<br\s*\/?>/gi, '\n');

    // 2. If table rows are joined horizontally like `| |` or `||`, split onto separate lines
    text = text.replace(/\|\s*\|/g, '|\n|').replace(/\r\n/g, '\n');

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let address = '';
    let takeaway = '';
    const rawSections: { category: string; body: string }[] = [];
    const unparsedLines: string[] = [];

    lines.forEach((line) => {
      // Ignore table separators like |---|---| or |:---|:---|
      if (/^\|?\s*[-:\s|]{4,}\|?$/.test(line)) {
        return;
      }

      // Ignore table header row | Category | Details |
      if (/^\|?\s*Category\s*\|\s*Details\s*\|?$/i.test(line)) {
        return;
      }

      // 1. Check for address header (e.g. 41 Bingley Avenue, Tamworth – B78 3BU or **Address**)
      const addressMatch = line.match(/^\*\*([^*]+(?:[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})[^*]*)\*\*$/i) ||
                           line.match(/^\*\*([^*]+,\s*[^*]+)\*\*$/) ||
                           line.match(/^([A-Za-z0-9\s,\.\-–—]+(?:[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}))$/i);
      if (addressMatch && !address && !line.includes('|') && !line.includes(':')) {
        address = addressMatch[1].replace(/\*\*/g, '').trim();
        return;
      }

      // 2. Check for Table Row: e.g. | **Energy efficiency** | Details... | or | Energy efficiency | Details... |
      const tableRowMatch = line.match(/^\|?\s*(?:\*\*)?([^|*:]+?)(?:\*\*)?:?\s*\|\s*(.+?)(?:\|)?$/);
      if (tableRowMatch) {
        const catName = tableRowMatch[1].trim();
        const catBody = tableRowMatch[2].trim().replace(/^\|+|\|+$/g, '').trim();

        if (/^Category$/i.test(catName) && /^Details$/i.test(catBody)) {
          return;
        }

        // Check if this row is Key take-away
        if (/take-?away|bottom line|recommendation/i.test(catName)) {
          takeaway = catBody;
          return;
        }

        if (catName && catBody) {
          rawSections.push({
            category: catName,
            body: catBody
          });
          return;
        }
      }

      // 3. Check for Key Take-away (e.g. **Key take-away:** or Key take-away: ...)
      const takeawayMatch = line.match(/^\*\*(?:Key\s*take-?away|Bottom\s*line|Buyer\s*take-?away|Recommendation):\*\*\s*(.*)$/i) ||
                            line.match(/^[-*•]?\s*(?:Key\s*take-?away|Bottom\s*line|Buyer\s*take-?away|Recommendation):\s*(.*)$/i);
      if (takeawayMatch) {
        takeaway = takeawayMatch[1].trim();
        return;
      }

      // 4. Check for bulleted category points (e.g. - **Energy efficiency:** ...)
      const bulletMatch = line.match(/^[-*•]\s*\*\*([^*:]+)(?::)?\*\*:?\s*(.*)$/) ||
                          line.match(/^\*\*([^*:]+)(?::)?\*\*:?\s*(.*)$/);
      if (bulletMatch) {
        const catName = bulletMatch[1].trim();
        const catBody = bulletMatch[2].trim();

        if (/take-?away|bottom line|recommendation/i.test(catName)) {
          takeaway = catBody;
          return;
        }

        rawSections.push({
          category: catName,
          body: catBody
        });
        return;
      }

      // 5. If this is a sub-bullet or secondary line for the previous section (e.g. • St Mary's...)
      if (rawSections.length > 0 && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\*\*[A-Z]/.test(line))) {
        const lastSec = rawSections[rawSections.length - 1];
        lastSec.body += (lastSec.body ? '\n' : '') + line;
        return;
      }

      // 6. Otherwise general unparsed line (skip raw table remnants)
      if (!line.startsWith('|') && !line.endsWith('|')) {
        unparsedLines.push(line);
      }
    });

    // Map each raw category to a refined visual theme & icon
    const sections: ParsedSection[] = rawSections.map((sec, idx) => {
      // Clean up category name
      const cleanCatName = sec.category.replace(/\(<=?1\.5\s*mi(?:les)?\)/i, '').trim();
      const lower = cleanCatName.toLowerCase();
      let icon = FileText;
      let theme = {
        bg: 'bg-card',
        border: 'border-border',
        iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        iconColor: 'text-slate-600',
        accent: 'border-l-slate-400'
      };
      let highlightBadge = undefined;

      if (lower.includes('energy') || lower.includes('epc')) {
        icon = Zap;
        theme = {
          bg: 'bg-amber-50/40 dark:bg-amber-950/20',
          border: 'border-amber-200/70 dark:border-amber-900/40',
          iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
          iconColor: 'text-amber-600',
          accent: 'border-l-amber-500'
        };
        const match = sec.body.match(/(Band\s+[A-G]|rating\s+(?:of\s+)?([A-G])|not supplied|no epc recorded|missing epc)/i);
        if (match) {
          highlightBadge = match[1].toLowerCase().includes('not supplied') || match[1].toLowerCase().includes('no epc') ? 'No EPC' : match[1].toUpperCase();
        }
      } else if (lower.includes('flood') || lower.includes('environmental') || lower.includes('river')) {
        icon = Waves;
        theme = {
          bg: 'bg-sky-50/40 dark:bg-sky-950/20',
          border: 'border-sky-200/70 dark:border-sky-900/40',
          iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
          iconColor: 'text-sky-600',
          accent: 'border-l-sky-500'
        };
        const match = sec.body.match(/(very low|low|medium|high)\b/i);
        if (match) highlightBadge = `${match[1]} Risk`;
      } else if (lower.includes('cost') || lower.includes('tax') || lower.includes('council')) {
        icon = PoundSterling;
        theme = {
          bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
          border: 'border-emerald-200/70 dark:border-emerald-900/40',
          iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
          iconColor: 'text-emerald-600',
          accent: 'border-l-emerald-500'
        };
        const match = sec.body.match(/(Band\s+[A-H]|£[\d,]+(?:\.\d{2})?)/i);
        if (match) highlightBadge = match[1];
      } else if (lower.includes('broadband') || lower.includes('internet') || lower.includes('speed')) {
        icon = Wifi;
        theme = {
          bg: 'bg-blue-50/40 dark:bg-blue-950/20',
          border: 'border-blue-200/70 dark:border-blue-900/40',
          iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
          iconColor: 'text-blue-600',
          accent: 'border-l-blue-500'
        };
        const match = sec.body.match(/(\d+\s*Mbps|Superfast|Ultrafast|FTTP|Gigabit)/i);
        if (match) highlightBadge = match[1];
      } else if (lower.includes('planning') || lower.includes('extension') || lower.includes('history')) {
        icon = Building2;
        theme = {
          bg: 'bg-purple-50/40 dark:bg-purple-950/20',
          border: 'border-purple-200/70 dark:border-purple-900/40',
          iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
          iconColor: 'text-purple-600',
          accent: 'border-l-purple-500'
        };
      } else if (lower.includes('mobile') || lower.includes('signal') || lower.includes('5g') || lower.includes('cellular')) {
        icon = Smartphone;
        theme = {
          bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
          border: 'border-emerald-200/70 dark:border-emerald-900/40',
          iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
          iconColor: 'text-emerald-600',
          accent: 'border-l-emerald-500'
        };
        const match = sec.body.match(/(5G transmitters|5G Available|EE & Vodafone|EE|Vodafone|Excellent 5G|Strong 4G|Limited 5G)/i);
        if (match) highlightBadge = match[1];
      } else if (lower.includes('school') || lower.includes('education') || lower.includes('catchment')) {
        icon = GraduationCap;
        theme = {
          bg: 'bg-indigo-50/40 dark:bg-indigo-950/20',
          border: 'border-indigo-200/70 dark:border-indigo-900/40',
          iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
          iconColor: 'text-indigo-600',
          accent: 'border-l-indigo-500'
        };
        highlightBadge = 'Catchment ≤ 1.5 mi';
      }

      return {
        id: `sec-${idx}`,
        category: cleanCatName,
        icon,
        theme,
        highlightBadge,
        body: sec.body
      };
    });

    // Generate pristine, clean markdown prose without tables or pipe noise
    const proseParts: string[] = [];
    if (address) proseParts.push(`**${address}**\n`);
    sections.forEach(s => {
      const cleanBody = s.body.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
      proseParts.push(`- **${s.category}:** ${cleanBody}`);
    });
    if (takeaway) {
      proseParts.push(`\n- **Key take-away:** ${takeaway}`);
    }
    if (unparsedLines.length > 0) {
      proseParts.push(`\n${unparsedLines.join('\n\n')}`);
    }

    return {
      address,
      sections,
      takeaway,
      unparsed: unparsedLines.join('\n\n'),
      cleanProse: proseParts.join('\n')
    };
  }, [summary]);

  const handleCopy = () => {
    const textToCopy = parsedData.cleanProse || summary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasStructuredData = parsedData.sections.length > 0 || Boolean(parsedData.takeaway);

  return (
    <Card className="bg-gradient-to-b from-[#f8fbff] to-[#f0f6ff] dark:from-slate-900/90 dark:to-slate-950 border-[#cfe1f7] dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
      {/* Header with Title & Action Controls */}
      <CardHeader className="pb-4 border-b border-[#e2edf8] dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-2xl font-serif font-bold text-[#1e3a8a] dark:text-blue-400">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <span>Executive Summary</span>
              <Badge variant="outline" className="text-[11px] font-sans font-medium text-blue-700 bg-blue-50/80 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                AI Synthesis
              </Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-sans flex items-center gap-2">
              <span>Condensed property findings and buyer-critical risk evaluation.</span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasStructuredData && (
              <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
                <button
                  onClick={() => setViewMode('structured')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'structured'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Structured Cards View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Structured</span>
                </button>
                <button
                  onClick={() => setViewMode('narrative')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'narrative'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Narrative Prose View"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Prose</span>
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground bg-white/80 dark:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Address Banner Pill if parsed */}
        {parsedData.address && (
          <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-foreground/80 font-medium">
            <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{parsedData.address}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {viewMode === 'structured' && hasStructuredData ? (
          <>
            {/* Category Key Findings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedData.sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <div
                    key={section.id}
                    className={`rounded-xl border ${section.theme.border} ${section.theme.bg} p-4.5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${section.theme.iconBg} shadow-2xs`}>
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <h4 className="font-semibold text-sm text-foreground capitalize">
                            {section.category}
                          </h4>
                        </div>
                        {section.highlightBadge && (
                          <Badge variant="secondary" className="text-[10px] h-5 font-semibold px-2">
                            {section.highlightBadge}
                          </Badge>
                        )}
                      </div>

                      {/* Clean Line-by-Line Bullet Formatting */}
                      <div className="text-[13.5px] leading-relaxed text-foreground/85 font-sans space-y-1.5 mt-1">
                        {section.body.split('\n').filter(Boolean).map((line, lIdx) => {
                          const trimmed = line.trim();
                          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
                          const cleanText = trimmed.replace(/^[-*•]\s*/, '');
                          const isSubheader = /^\*\*[^*]+\*\*$/.test(trimmed);

                          if (isSubheader) {
                            return (
                              <div key={lIdx} className="font-bold text-xs uppercase tracking-wider text-foreground/75 pt-1.5 first:pt-0">
                                {cleanText.replace(/\*\*/g, '')}
                              </div>
                            );
                          }

                          return (
                            <div key={lIdx} className={isBullet ? "flex items-start gap-2 text-foreground/90" : "text-foreground/90"}>
                              {isBullet && (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-2 shrink-0" />
                              )}
                              <div className="flex-grow">
                                <Markdown
                                  components={{
                                    p: ({ children }) => <span>{children}</span>,
                                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>
                                  }}
                                >
                                  {cleanText}
                                </Markdown>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Any unparsed narrative notes */}
            {parsedData.unparsed && (
              <div className="rounded-xl border border-border/80 bg-background/60 p-4 text-sm leading-relaxed text-foreground/85">
                <Markdown
                  components={{
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  }}
                >
                  {parsedData.unparsed}
                </Markdown>
              </div>
            )}

            {/* Prominent Key Take-away Banner */}
            {parsedData.takeaway && (
              <div className="relative rounded-xl border-2 border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40 p-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5 shadow-2xs">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm tracking-tight text-amber-950 dark:text-amber-200">
                        Key Take-away for Buyers
                      </h4>
                      <Badge className="bg-amber-600 text-white text-[10px] h-4 px-1.5 border-none">
                        Action Required
                      </Badge>
                    </div>
                    <div className="text-[14.5px] leading-relaxed text-amber-950/90 dark:text-amber-100 font-sans">
                      <Markdown
                        components={{
                          strong: ({ children }) => <strong className="font-bold text-amber-950 dark:text-white underline decoration-amber-400 underline-offset-2">{children}</strong>,
                          p: ({ children }) => <span>{children}</span>,
                        }}
                      >
                        {parsedData.takeaway}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Narrative Markdown Prose View */
          <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed text-foreground/90 font-sans space-y-3">
            <Markdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 text-[15px] leading-relaxed text-foreground/90 last:mb-0">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2.5 my-3 pl-1 list-none">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2.5 text-foreground/85">
                    <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
              }}
            >
              {parsedData.cleanProse || summary}
            </Markdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

