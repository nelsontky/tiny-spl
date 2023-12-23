"use client";

import { useServerInsertedHTML } from "next/navigation";
import React, { useState } from "react";
import original from "react95/dist/themes/original";
import { ServerStyleSheet, StyleSheetManager , ThemeProvider } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined")
    return <ThemeProvider theme={original}>{children}</ThemeProvider>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <ThemeProvider theme={original}>{children}</ThemeProvider>
    </StyleSheetManager>
  );
}
