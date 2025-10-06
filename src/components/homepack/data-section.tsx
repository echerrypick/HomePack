import type { LucideProps } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        {children}
      </CardContent>
    </Card>
  );
}

type DataItemProps = {
    label: string;
    value: string | number;
}
export function DataItem({ label, value }: DataItemProps) {
    return (
        <div className="flex justify-between items-center text-sm even:bg-muted/50 p-2 rounded-md -mx-2">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium text-right">{value}</p>
        </div>
    )
}
