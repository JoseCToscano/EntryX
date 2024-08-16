"use client";
import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";

import React, { Suspense } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import ToasterProvider from "~/app/providers/toaster-provider";
import { Sidebar } from "~/app/account/components/sidebar";
import Footer from "~/components/components/footer";
import Navbar from "~/app/_components/navbar";
import { Meta } from "next/dist/lib/metadata/generate/meta";
import Head from "next/head";
import Loading from "~/app/account/components/loading";

// export const metadata: Metadata = {
//   title: "Entry•X",
//   description: "Decentralized event ticketing platform",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Head>
        <title>Entry•X</title>
        <meta
          name="description"
          content="Decentralized event ticketing platform"
        />
        <meta property="og:site_name" content="Entry•X" />
        <meta property="og:title" content="Entry•X" />
        <meta
          property="og:description"
          content="Decentralized event ticketing platform"
        />
        <meta property="og:type" content="website" />
      </Head>

      <body>
        <TRPCReactProvider>
          <ToasterProvider />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="grid lg:grid-cols-7">
              <Sidebar className="hidden lg:block" />
              <div className="col-span-5 lg:col-span-6 lg:border-l">
                <Suspense fallback={<Loading />}>{children}</Suspense>
                <Footer />
              </div>
            </div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
