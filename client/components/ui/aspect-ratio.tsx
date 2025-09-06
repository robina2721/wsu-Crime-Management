import * as React from "react";

export const AspectRatio = ({ ratio = 16 / 9, children, className }: any) => (
  <div
    className={className}
    style={{ position: "relative", paddingBottom: `${100 / ratio}%` }}
  >
    {children}
  </div>
);

export default AspectRatio;
