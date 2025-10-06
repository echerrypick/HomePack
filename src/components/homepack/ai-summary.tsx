import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AiSummaryProps = {
  summary: string;
};

export function AiSummary({ summary }: AiSummaryProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span>AI-Enhanced Summary</span>
        </CardTitle>
        <CardDescription>
            An AI-generated overview of the key findings from the property data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{summary}</p>
      </CardContent>
    </Card>
  );
}
