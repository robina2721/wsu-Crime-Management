import * as React from "react";

export const Sheet = ({ open, onOpenChange, children }: any) => open ? <div className="fixed inset-0 z-50">{children}</div> : null;
export const SheetContent = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>;
export default Sheet;
