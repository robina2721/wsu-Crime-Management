import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function collectOptions(children: any, out: any[] = []) {
  React.Children.forEach(children, (c: any) => {
    if (!c) return;
    const typeName = c?.type?.displayName || c?.type?.name;
    if (typeName === "SelectItem") {
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
    if (typeName === "SelectTrigger" && c.props && c.props.className) found = c.props.className;
    else if (c.props && c.props.children) {
      const inner = findTriggerClass(c.props.children);
      if (inner) found = inner;
    }
  });
  return found;
}

function findPlaceholder(children: any) {
  let ph: string | undefined;
  React.Children.forEach(children, (c: any) => {
    if (!c) return;
    const typeName = c?.type?.displayName || c?.type?.name;
    if (typeName === "SelectValue" && c.props && c.props.placeholder) ph = c.props.placeholder;
    else if (c.props && c.props.children) {
      const inner = findPlaceholder(c.props.children);
      if (inner) ph = inner;
    }
  });
  return ph;
}

export function Select({ value, onValueChange, children, className, style, ...props }: any) {
  const items = collectOptions(children);
  const triggerClass = findTriggerClass(children) || "";
  const placeholder = findPlaceholder(children) || "Select...";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = items.find((it) => it?.props?.value === value) || null;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-block text-left", className)} style={style} {...props}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "w-full inline-flex justify-between items-center gap-2 rounded-md px-3 py-2 text-sm shadow-sm border bg-white",
          triggerClass,
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {value ? (
            <span className="truncate">{selected ? selected.props.children : String(value)}</span>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn("w-4 h-4 text-gray-500 transition-transform", open && "rotate-180")}
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.832.445l4 6a1 1 0 01-.832 1.555H5a1 1 0 01-.832-1.555l4-6A1 1 0 0110 3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto py-1 text-sm"
        >
          {items.map((it: any, i: number) => {
            const p = it.props || {};
            const disabled = !!p.disabled;
            return (
              <li
                role="option"
                key={i}
                aria-selected={value === p.value}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100 truncate",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => {
                  if (disabled) return;
                  onValueChange?.(p.value);
                  setOpen(false);
                }}
              >
                {it.props.children}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const SelectGroup = ({ children }: any) => <>{children}</>;
export const SelectValue = ({ children, placeholder }: any) => <>{children ?? placeholder}</>;
export const SelectTrigger = ({ children, className }: any) => <>{children}</>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectLabel = ({ children, className }: any) => (
  <div className={cn("py-1.5 pl-2 pr-2 text-sm font-semibold", className)}>{children}</div>
);
export const SelectItem = ({ children }: any) => <>{children}</>;
export const SelectSeparator = ({ children }: any) => <div className="h-px bg-muted my-2" />;
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;

export default Select;
