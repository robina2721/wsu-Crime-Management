import * as React from "react";

export const NavigationMenu = ({ children }: any) => <nav>{children}</nav>;
export const NavigationMenuList = ({ children }: any) => (
  <div className="flex">{children}</div>
);
export const NavigationMenuItem = ({ children }: any) => <div>{children}</div>;
export const NavigationMenuTrigger = ({ children }: any) => <>{children}</>;
export const NavigationMenuContent = ({ children }: any) => (
  <div>{children}</div>
);
export default NavigationMenu;
