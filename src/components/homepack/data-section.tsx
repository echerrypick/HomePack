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
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Icon className="h-6 w-6 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TooltipProvider>
            {children}
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
        <div className="flex justify-between items-center text-sm even:bg-muted/50 p-2 rounded-md -mx-2">
            <div className="flex items-center gap-1.5">
                <p className="text-muted-foreground">{label}</p>
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs">
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <p className="font-medium text-right">{value}</p>
        </div>
    )
}