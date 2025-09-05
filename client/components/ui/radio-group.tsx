import * as React from "react";

export const RadioGroup = ({ value, onValueChange, children }: any) => (
  <div role="radiogroup">{React.Children.map(children, (c: any) => React.cloneElement(c, { checked: c.props.value === value, onChange: () => onValueChange?.(c.props.value) }))}</div>
);

export const Radio = ({ checked, onChange, children, value }: any) => (
  <label className="inline-flex items-center gap-2"><input type="radio" checked={checked} onChange={() => onChange?.()} value={value} />{children}</label>
);

export default RadioGroup;
