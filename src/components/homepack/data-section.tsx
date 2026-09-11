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
};

export function DataSection({ icon: Icon, title, children }: DataSectionProps) {
  return (
    <Card className="shadow-sm border-[#e2e8f0] rounded-sm overflow-hidden">
      <CardHeader className="bg-[#f0f7ff] border-b border-[#d1e3f8] py-4">
        <CardTitle className="flex items-center gap-3 text-xl font-serif font-bold text-[#2d4a77]">
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <TooltipProvider>
            <div className="space-y-0.5">
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
}
export function DataItem({ label, value, tooltip }: DataItemProps) {
  return (
        <div className="grid grid-cols-2 py-3 border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors px-1">
            <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[#64748b]">{label}</p>
               {tooltip && (
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs">
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <p className="text-sm font-bold text-[#2d4a77] text-right">{value}</p>
        </div>
    )
}
