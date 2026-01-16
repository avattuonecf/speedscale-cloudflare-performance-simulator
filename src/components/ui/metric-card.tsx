import React from 'react';
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Zap, Server } from "lucide-react";
interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'edge' | 'origin';
  className?: string;
}
export function MetricCard({ label, value, subValue, variant = 'origin', className }: MetricCardProps) {
  const isEdge = variant === 'edge';
  return (
    <Card className={cn(
      "p-6 relative overflow-hidden transition-all duration-300",
      isEdge ? "border-[#F38020]/30 bg-[#F38020]/5" : "border-border bg-card",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {isEdge ? (
          <Zap className="w-4 h-4 text-[#F38020]" />
        ) : (
          <Server className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "text-3xl font-bold tabular-nums",
          isEdge ? "text-[#F38020]" : "text-foreground"
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-muted-foreground mt-1">
            {subValue}
          </span>
        )}
      </div>
      {isEdge && (
        <div className="absolute -right-2 -bottom-2 opacity-5">
          <Zap className="w-24 h-24 text-[#F38020]" />
        </div>
      )}
    </Card>
  );
}