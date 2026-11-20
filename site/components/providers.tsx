"use client";

import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  primaryColor: "nanodes",
  primaryShade: { light: 6, dark: 4 },
  colors: {
    nanodes: [
      "#eef3ff",
      "#e0e9ff",
      "#c9d8ff",
      "#b3caff",
      "#a8c2ff",
      "#8aa8ed",
      "#7595df",
      "#5c7dc9",
      "#4a65a9",
      "#3b5089",
    ],
    dark: [
      "#e1e6f1",
      "#bdc7da",
      "#a2adc2",
      "#7d8aa3",
      "#4c5972",
      "#374258",
      "#272e3e",
      "#1b1f29",
      "#151820",
      "#111215",
    ],
  },
  fontFamily: "var(--font-body), sans-serif",
  defaultRadius: "md",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      {children}
    </MantineProvider>
  );
}
