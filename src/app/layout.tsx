import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import React from "react";
import { TRPCReactProvider } from "~/trpc/react";
import ToasterProvider from "~/app/providers/toaster-provider";

export const metadata: Metadata = {
  title: "Entry•X",
  description: "Decentralized event ticketing platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <ToasterProvider />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
