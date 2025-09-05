import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const DialogContext = React.createContext({ onClose: (v: boolean) => {} });

export function Dialog({ open, onOpenChange, children }: any) {
  return (
    <DialogContext.Provider value={{ onClose: onOpenChange || (() => {}) }}>
      {open ? <div>{children}</div> : null}
    </DialogContext.Provider>
  );
}

export const DialogTrigger = ({ children }: any) => <>{children}</>;
export const DialogPortal = ({ children }: any) => <>{children}</>;
export const DialogClose = ({ children, onClick }: any) => (
  <button onClick={onClick || (() => {})}>{children}</button>
);

export const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }: any, ref: any) {
  return <div ref={ref} className={cn("fixed inset-0 bg-black/60 z-40", className)} {...props} />;
});

export const DialogContent = React.forwardRef(function DialogContent({ className, children, ...props }: any, ref: any) {
  const ctx = React.useContext(DialogContext);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => ctx.onClose(false)} />
      <div ref={ref} className={cn("bg-white rounded-lg p-6 z-10 max-w-lg w-full shadow-lg", className)} {...props}>
        {children}
        <button className="absolute top-3 right-3 p-1 rounded" onClick={() => ctx.onClose(false)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
});

export const DialogHeader = ({ className, ...props }: any) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
export const DialogFooter = ({ className, ...props }: any) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
export const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }: any, ref: any) {
  return <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
});
export const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }: any, ref: any) {
  return <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});

export default Dialog;
