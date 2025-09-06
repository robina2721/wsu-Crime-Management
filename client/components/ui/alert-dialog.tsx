import * as React from "react";

export const AlertDialog = ({ open, onOpenChange, children }: any) => open ? <div>{children}</div> : null;
export const AlertDialogTrigger = ({ children }: any) => <>{children}</>;
export const AlertDialogContent = ({ children }: any) => <div>{children}</div>;
export default AlertDialog;
