import * as React from "react";

export const ToggleGroup = ({ children }: any) => <div className="inline-flex">{children}</div>;
export const ToggleGroupItem = ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>;
export default ToggleGroup;
