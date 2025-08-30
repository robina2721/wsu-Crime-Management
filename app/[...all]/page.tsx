"use client";
"use client";
import React from "react";
import dynamic from "next/dynamic";

const AppSPA = dynamic(() => import("../../client/AppSPA"), { ssr: false });

export default function CatchAll() {
  return <AppSPA />;
}
