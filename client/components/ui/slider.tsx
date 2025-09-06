import * as React from "react";

export const Slider = ({ value, onValueChange, min=0, max=100 }: any) => (
  <input type="range" min={min} max={max} value={value} onChange={(e) => onValueChange?.(Number(e.target.value))} />
);

export default Slider;
