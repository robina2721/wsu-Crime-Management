import * as React from "react";

export function Popover({ open, onOpenChange, children }: any) {
  return open ? <div>{children}</div> : null;
}
export const PopoverTrigger = ({ children }: any) => <>{children}</>;
export const PopoverContent = ({ children }: any) => <div className="p-2 bg-white shadow rounded">{children}</div>;
export default Popover;
