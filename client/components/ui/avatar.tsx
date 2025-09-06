import * as React from "react";

export const Avatar = ({ children, className }: any) => <div className={className}>{children}</div>;
export const AvatarImage = ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} />;
export const AvatarFallback = ({ children }: any) => <div>{children}</div>;

export default Avatar;
