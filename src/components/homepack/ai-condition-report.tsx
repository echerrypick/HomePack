import { Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type AiConditionReportProps = {
  report: string | null;
  isLoading: boolean;
};

export function AiConditionReport({ report, isLoading }: AiConditionReportProps) {
  if (!report && !isLoading) {
    return null; // Don't render anything if there's no report and not loading
  }

  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          <span>Condition Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">AI is analyzing images...</p>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
            </div>
        ) : (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{report}</p>
        )}
      </CardContent>
    </Card>
  );
}
