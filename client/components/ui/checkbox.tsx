import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }: any, ref: any) => {
  return (
    <input ref={ref} type="checkbox" checked={!!checked} onChange={(e) => onCheckedChange?.(e.target.checked)} className={cn("w-4 h-4", className)} {...props} />
  );
});

export default Checkbox;
