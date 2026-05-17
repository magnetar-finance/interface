import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import { Sidebar } from "@/partials/Sidebar";
import { StickyMobileNavbar } from "@/partials/StickyMobileNavbar";
import { Header } from "@/partials/Header";
import { Providers } from "./providers";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magnetar Finance | MetaDEX on EVM",
  description:
    "Magnetar Finance combines features of Uniswap and Curve to create a powerful MetaDEX on EVM, enabling users to find the best prices across multiple liquidity sources with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.className} antialiased overflow-x-hidden`}>
        <Providers>
          <div className="flex flex-col md:flex-row min-h-screen min-w-screen justify-center items-start gap-0 overflow-y-auto overflow-x-hidden relative">
            <div className="hidden md:block w-[20%] min-h-screen">
              <Sidebar />
            </div>
            <div className="container mx-auto">
              <div className="w-full flex justify-start items-center gap-12 flex-col pt-3 pb-28 md:py-6 px-4 md:px-7 overflow-x-hidden">
                <Header />
                {children}
              </div>
            </div>
            <div className="md:hidden w-full px-3 pb-5 fixed bottom-0 left-0">
              <StickyMobileNavbar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
