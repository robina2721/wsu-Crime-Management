"use client";
"use client";
import React from "react";
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AppSPA = dynamic(() => import("../../client/AppSPA"), { ssr: false });

export default function CatchAll() {
  return <AppSPA />;
}
