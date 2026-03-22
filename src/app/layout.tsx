import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../providers/ReduxProvider"; 
import TopMenu from "../components/TopMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dentist Booking",
  description: "Book your dentist appointment easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <TopMenu />
          {children} 
        </ReduxProvider>
      </body>
    </html>
  );
}