"use client";
"use client";
import React from "react";
import NextDynamic from "next/dynamic";

const AppSPA = NextDynamic(() => import("../client/AppSPA"), { ssr: false });

export default function Page() {
  return <AppSPA />;
}
