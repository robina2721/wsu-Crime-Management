import * as React from "react";

export const ScrollArea = ({ children, className }: any) => (
  <div className={className} style={{ overflow: 'auto' }}>{children}</div>
);
export const ScrollViewport = ({ children, className }: any) => <div className={className}>{children}</div>;
export default ScrollArea;
