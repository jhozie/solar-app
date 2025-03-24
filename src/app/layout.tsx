import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solar Calculator | Dunn Energy",
  description: "Calculate your potential savings with solar energy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ 
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
          backgroundAttachment: 'fixed' 
        }}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Calculate Your Solar Savings
              </h1>
              <p className="text-lg md:text-xl text-green-50/90 max-w-2xl mx-auto">
                Find out how much you could save by switching to solar energy. 
                Get personalized estimates based on your current power usage.
              </p>
            </div>
            {children}
          </div>
        </main>
        <footer className="mt-20 py-8 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <img 
                src="/images/dunnenergy.jpg" 
                alt="Dunn Energy" 
                className="h-8 object-contain"
              />
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Dunn Energy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
