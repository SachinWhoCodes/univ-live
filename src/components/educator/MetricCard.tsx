import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold font-display">{value}</p>
              {change && (
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      change.type === "increase" ? "text-green-500" : "text-destructive"
                    )}
                  >
                    {change.type === "increase" ? "+" : "-"}{change.value}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "p-3 rounded-xl bg-muted",
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
