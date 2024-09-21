"use client";

import { CorbadoProvider } from "@corbado/react";
import StellarWallet from "~/app/passkey/components/stellar-wallet";

const CORBADO_PROJECT_ID = "pro-7635031262679338570";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
      <>
    <CorbadoProvider
      projectId={CORBADO_PROJECT_ID}
      setShortSessionCookie
      // add more config options here (styling, language, etc.)
    >
      <div className="m-10 flex min-h-screen flex-col border-2 border-purple-900 p-10">
        {children}
      </div>
      {/*All children go here*/}
    </CorbadoProvider>
        <StellarWallet />
      </>
  );
};

export default Layout;
