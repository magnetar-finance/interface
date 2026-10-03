import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { StickyMobileNavbar } from '@/partials/StickyMobileNavbar';
import { Header } from '@/partials/Header';
import { Providers } from './providers';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Magnetar Finance | MetaDEX on EVM',
  description:
    'Magnetar Finance combines features of Uniswap and Curve to create a powerful MetaDEX on EVM, enabling users to find the best prices across multiple liquidity sources with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <Providers>
          <div className="relative z-10 flex min-h-screen min-w-screen flex-col overflow-x-hidden">
            <Header />
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 md:px-6 md:py-6 lg:pb-8">
              {children}
            </div>
            <div className="fixed bottom-0 left-0 z-40 w-full px-3 pb-4 lg:hidden">
              <StickyMobileNavbar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
