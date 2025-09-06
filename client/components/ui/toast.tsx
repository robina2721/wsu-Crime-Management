import * as React from "react";
import { cn } from "@/lib/utils";

export const ToastProvider = ({ children }: any) => <>{children}</>;

export const ToastViewport = ({ className }: any) => (
  <div
    className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-2", className)}
  />
);

export const Toast = React.forwardRef(
  ({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border rounded-md p-4 shadow-md max-w-xs",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Toast.displayName = "Toast";

export const ToastTitle = ({ children, className }: any) => (
  <div className={cn("font-semibold", className)}>{children}</div>
);
export const ToastDescription = ({ children, className }: any) => (
  <div className={cn("text-sm text-gray-600", className)}>{children}</div>
);
export const ToastClose = ({ onClick }: any) => (
  <button onClick={onClick} className="absolute top-2 right-2 p-1 rounded">
    ✕
  </button>
);
export const ToastAction = ({ children }: any) => (
  <div className="mt-2">{children}</div>
);

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { Toast as default };
