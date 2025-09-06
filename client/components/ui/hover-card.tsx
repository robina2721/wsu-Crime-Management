import * as React from "react";

export const HoverCard = ({ children, className }: any) => (
  <span className={className}>{children}</span>
);
export const HoverCardTrigger = ({ children }: any) => <>{children}</>;
export const HoverCardContent = ({ children }: any) => <div>{children}</div>;
export default HoverCard;
