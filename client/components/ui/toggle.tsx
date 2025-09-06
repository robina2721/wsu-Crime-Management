import * as React from "react";

export const Toggle = React.forwardRef(
  (
    { pressed, onPressedChange, children, className, ...props }: any,
    ref: any,
  ) => (
    <button
      ref={ref}
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
);

export default Toggle;
