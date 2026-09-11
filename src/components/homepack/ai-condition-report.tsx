import React from 'react';
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
    <Card className="shadow-sm border-[#e2e8f0] rounded-sm overflow-hidden animate-fade-in">
      <CardHeader className="bg-[#f0f7ff] border-b border-[#d1e3f8] py-4">
        <CardTitle className="flex items-center gap-3 text-lg font-serif font-bold text-[#2d4a77]">
          <Bot className="h-5 w-5" />
          <span>AI Condition Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4 font-sans">AI is analyzing images...</p>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
            </div>
        ) : (
            <p className="text-base text-[#2d3748] leading-relaxed font-sans whitespace-pre-wrap">{report}</p>
        )}
      </CardContent>
    </Card>
  );
}
