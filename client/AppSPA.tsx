"use client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";
import LanguageToggle from "./components/LanguageToggle";
import AppRoutes from "./AppRoutes";
import React from "react";

const queryClient = new QueryClient();

export default function AppSPA() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LanguageToggle />
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
