import React from "react";
import { cn, getStatusColor } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  status?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, status, className }) => {
  const colorClass = status ? getStatusColor(status) : "bg-stone-100 text-stone-700";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
};
