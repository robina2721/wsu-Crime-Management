import * as React from "react";

export const ContextMenu = ({ children, open }: any) =>
  open ? <div>{children}</div> : null;
export const ContextMenuContent = ({ children }: any) => (
  <div className="bg-white shadow rounded">{children}</div>
);
export const ContextMenuItem = ({ children, onSelect }: any) => (
  <div onClick={onSelect}>{children}</div>
);
export default ContextMenu;
