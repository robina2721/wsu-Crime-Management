import * as React from "react";

export const Collapsible = ({ open, children }: any) =>
  open ? <div>{children}</div> : null;
export const CollapsibleTrigger = ({ children, onClick }: any) => (
  <button onClick={onClick}>{children}</button>
);
export const CollapsibleContent = ({ children }: any) => <div>{children}</div>;

export default Collapsible;
