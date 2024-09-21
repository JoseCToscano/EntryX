"use client";

import { CorbadoProvider } from "@corbado/react";
import StellarWallet from "~/app/passkey/components/stellar-wallet";

const CORBADO_PROJECT_ID = "pro-7635031262679338570";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CorbadoProvider
      projectId={CORBADO_PROJECT_ID}
      setShortSessionCookie
      // add more config options here (styling, language, etc.)
    >
      {children}
      {/*All children go here*/}
    </CorbadoProvider>
  );
};

export default Layout;
