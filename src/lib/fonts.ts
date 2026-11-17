import { Atkinson_Hyperlegible_Next, Newsreader } from "next/font/google";

export const displayFont = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-display-loaded",
});

export const uiFont = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-ui-loaded",
});
