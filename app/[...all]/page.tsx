"use client";
import React from "react";
import dynamic from "next/dynamic";

const AppSPA = dynamic(() => import("../../frontend/client/AppSPA"), { ssr: false });

export default function CatchAll() {
  return <AppSPA />;
}
