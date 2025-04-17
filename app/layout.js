import "./globals.css";
import { Roboto, Playfair_Display } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: "700", variable: "--font-playfair" });

export const metadata = {
  title: "Salon Centrifuge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.className} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
