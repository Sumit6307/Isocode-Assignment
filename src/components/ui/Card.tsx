import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-stone-200/80 shadow-xs hover:shadow-sm transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className }) => {
  return (
    <div className={cn("p-5 border-b border-stone-100 flex items-center justify-between", className)}>
      <div>
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("p-5", className)}>{children}</div>;
};
