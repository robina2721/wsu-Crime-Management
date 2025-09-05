import "./globals.css";
import React from "react";
 // 

export const metadata = {
  title: "Crime Management System",
  description: "Admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="/wspolice.jpeg" rel="icon" />
      </head>
      <body>{children}</body>
     
    </html>
  );
}
