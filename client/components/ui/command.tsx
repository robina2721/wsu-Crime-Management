import * as React from "react";

export const Command = ({ children }: any) => <div>{children}</div>;
export const CommandInput = ({ ...props }: any) => <input {...props} />;
export const CommandList = ({ children }: any) => <div>{children}</div>;
export const CommandItem = ({ children, onSelect }: any) => <div onClick={onSelect}>{children}</div>;
export default Command;
