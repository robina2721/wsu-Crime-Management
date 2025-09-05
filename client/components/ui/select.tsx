import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children, className, ...props }: any) {
  const options = React.Children.toArray(children).filter((c: any) => c?.type?.displayName === 'SelectItem' || c?.type?.name === 'SelectItem');
  return (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} className={cn("h-10 w-full rounded-md border px-3 py-2 text-sm", className)} {...props}>
      {options.map((opt: any, i) => {
        const propsOpt = opt.props || {};
        return (
          <option key={i} value={propsOpt.value} disabled={propsOpt.disabled}>
            {opt.props.children}
          </option>
        );
      })}
    </select>
  );
}

export const SelectGroup = ({ children }: any) => <>{children}</>;
export const SelectValue = ({ children }: any) => <>{children}</>;
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectLabel = ({ children, className }: any) => <div className={cn("py-1.5 pl-2 pr-2 text-sm font-semibold", className)}>{children}</div>;
export const SelectItem = ({ children }: any) => <>{children}</>;
export const SelectSeparator = ({ children }: any) => <div className="h-px bg-muted my-2" />;
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;

export default Select;
