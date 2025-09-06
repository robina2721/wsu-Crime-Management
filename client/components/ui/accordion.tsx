import * as React from "react";

export const Accordion = ({ children }: any) => <div>{children}</div>;
export const AccordionItem = ({ children }: any) => <div>{children}</div>;
export const AccordionTrigger = ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>;
export const AccordionContent = ({ children }: any) => <div>{children}</div>;

export default Accordion;
