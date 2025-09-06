import * as React from "react";
import * as React from "react";
import { cn } from "@/lib/utils";

function collectOptions(children: any, out: any[] = []) {
  React.Children.forEach(children, (c: any) => {
    if (!c) return;
    const typeName = c?.type?.displayName || c?.type?.name;
    if (typeName === 'SelectItem') {
      out.push(c);
    } else if (c.props && c.props.children) {
      collectOptions(c.props.children, out);
    }
  });
  return out;
}

function findTriggerClass(children: any) {
  let found: string | undefined;
  React.Children.forEach(children, (c: any) => {
    if (!c) return;
    const typeName = c?.type?.displayName || c?.type?.name;
    if (typeName === 'SelectTrigger' && c.props && c.props.className) found = c.props.className;
    else if (c.props && c.props.children) {
      const inner = findTriggerClass(c.props.children);
      if (inner) found = inner;
    }
  });
  return found;
}

export function Select({ value, onValueChange, children, className, ...props }: any) {
  const options = collectOptions(children);
  const triggerClass = findTriggerClass(children);
  const selectClass = cn("h-10 w-full rounded-md border px-3 py-2 text-sm", triggerClass, className);
  return (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} className={selectClass} {...props}>
      {options.map((opt: any, i: number) => {
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
export const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectLabel = ({ children, className }: any) => <div className={cn("py-1.5 pl-2 pr-2 text-sm font-semibold", className)}>{children}</div>;
export const SelectItem = ({ children }: any) => <>{children}</>;
export const SelectSeparator = ({ children }: any) => <div className="h-px bg-muted my-2" />;
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;

export default Select;
