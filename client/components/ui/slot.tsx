import * as React from "react";

export const Slot: React.FC<any> = ({ children, ...props }) => {
  if (!children) return null;
  return React.Children.only(children) as any;
};

export default Slot;
