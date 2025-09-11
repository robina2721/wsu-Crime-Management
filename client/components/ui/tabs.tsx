import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }: any) {
  return <div className={cn(className)}>{children}</div>;
}
export const TabsList = ({ children, className }: any) => (
  <div className={cn("flex flex-col sm:flex-row w-full gap-2 sm:gap-0 sm:space-x-2", className)}>
    {children}
  </div>
);
export const TabsTrigger = ({ value, children, onClick }: any) => (
  <button className="px-3 py-1 rounded" onClick={() => onClick?.(value)}>{children}</button>
);
export const TabsContent = ({ value, activeValue, children, className }: any) => {
  if (value && activeValue && value !== activeValue) return null;
  return <div className={cn(className)}>{children}</div>;
};

export default Tabs;
