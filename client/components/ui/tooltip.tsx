import * as React from "react";

export const Tooltip = ({ children }: any) => <span>{children}</span>;
export const TooltipProvider = ({ children }: any) => <>{children}</>;
export const TooltipTrigger = ({ children }: any) => <span>{children}</span>;
export const TooltipContent = ({ children }: any) => <div className="p-2 bg-black text-white rounded">{children}</div>;
export default Tooltip;
