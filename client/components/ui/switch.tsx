import * as React from "react";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef(({ checked, onCheckedChange, className, ...props }: any, ref: any) => {
  return (
    <button ref={ref} role="switch" aria-checked={!!checked} onClick={() => onCheckedChange?.(!checked)} className={cn("w-10 h-6 rounded-full p-1", checked ? 'bg-red-600' : 'bg-gray-300', className)} {...props}>
      <span className={cn("bg-white w-4 h-4 rounded-full block transform", checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
});

export default Switch;
