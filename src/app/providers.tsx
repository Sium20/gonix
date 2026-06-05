"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#161616",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: { iconTheme: { primary: "#1A7F5A", secondary: "#fff" } },
          error: { iconTheme: { primary: "#8B0000", secondary: "#fff" } },
        }}
      />
    </SessionProvider>
  );
}
