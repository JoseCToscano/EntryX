import Banner from "~/components/components/banner";
import React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function ConnectYourWallet() {
  return (
    <Banner
      title={"Wallet is not connected"}
      content={
        <>
          <p className="text-sm text-gray-500">
            Wallet connection is required to interact with the platform.
          </p>
          <p className="text-sm text-gray-500">
            Purchasing tickets, listing tickets, and viewing your tickets all
            require a connected wallet.
          </p>
          <Link href="/wallet">
            <Button
              variant="ghost"
              className="h-8 w-full items-center justify-center border border-black text-center"
            >
              Connect Wallet
            </Button>
          </Link>
        </>
      }
      buttonText={"Understood"}
      defaultOpen
    />
  );
}
