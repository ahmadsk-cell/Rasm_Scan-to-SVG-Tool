"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster
          theme="system"
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            className: "glass-panel border-border",
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
