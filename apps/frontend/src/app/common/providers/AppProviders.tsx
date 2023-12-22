"use client";

import { useState, useEffect } from "react";
import { SolanaProviders } from "./SolanaProviders";
import StyledComponentsRegistry from "./StyledComponentsRegistry";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    setIsServer(false);
  }, []);
  if (isServer) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="flex flex-col h-full">
      {typeof window === "undefined" ? null : (
        <SolanaProviders>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </SolanaProviders>
      )}
    </div>
  );
};
