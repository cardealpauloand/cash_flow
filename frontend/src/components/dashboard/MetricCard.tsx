import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  gradient?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon,
  gradient 
}: MetricCardProps) => {
  const changeColors = {
    positive: "text-income",
    negative: "text-expense", 
    neutral: "text-muted-foreground"
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
      gradient && `bg-gradient-to-br ${gradient}`
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-card-foreground">
              {value}
            </p>
            {change && (
              <p className={cn("text-sm mt-1", changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          <div className="text-primary opacity-20">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};