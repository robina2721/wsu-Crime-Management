import "./globals.css";
import React from "react";
import Header from "./components/Header";

export const metadata = {
  title: "Crime Management System",
  description: "Admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/wspolice.jpeg" rel="icon" />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </body>
    </html>
  );
}
