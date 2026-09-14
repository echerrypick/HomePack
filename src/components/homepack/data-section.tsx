import React from 'react';
import type { LucideProps } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

type DataSectionProps = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  children: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
};

export function DataSection({ icon: Icon, title, children, id, action }: DataSectionProps) {
  return (
    <Card id={id} className="scroll-mt-24 shadow-xs border-border/80 bg-card rounded-xl overflow-hidden transition-all hover:shadow-sm">
      <CardHeader className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-border/70 py-3.5 px-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-serif font-bold text-[#1e3a8a] dark:text-blue-400">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span>{title}</span>
          </CardTitle>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <TooltipProvider>
          <div className="space-y-1">
            {children}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

type DataItemProps = {
  label: string;
  value: string | number;
  tooltip?: string;
  className?: string;
};

export function DataItem({ label, value, tooltip, className = '' }: DataItemProps) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 px-2 rounded-lg border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors ${className}`}>
      <div className="flex items-center gap-1.5 shrink-0 max-w-[60%]">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-help">
              <HelpCircle className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-xs text-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="text-sm font-semibold text-foreground text-right break-words min-w-0">
        {value}
      </span>
    </div>
  );
}

