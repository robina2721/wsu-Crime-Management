import * as React from "react";

export const DropdownMenu = ({ children, open }: any) => open ? <div className="bg-white shadow rounded">{children}</div> : null;
export const DropdownMenuItem = ({ children, onSelect }: any) => <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={onSelect}>{children}</div>;
export const DropdownMenuTrigger = ({ children }: any) => <>{children}</>;
export default DropdownMenu;
