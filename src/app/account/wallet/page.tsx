"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YC3V5HBy8Bu
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useWallet } from "~/hooks/useWallet";
import { ConnectWallet } from "~/app/account/wallet/connect/connect-component";
import { Icons } from "~/components/icons";

export default function WallerPage() {
  const {
    publicKey,
    connect: connectWallet,
    signXDR,
    network,
    isLoading,
    hasFreighter,
    account,
    isFreighterAllowed,
  } = useWallet();

  const challenge = api.stellarAccountRouter.getChallenge.useMutation({
    onError: (e) => toast.error("Challenge error:" + e.message),
  });

  if (isLoading) {
    return <Icons.spinner className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className="p-4">
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {hasFreighter ? "Freighter" : "Connect"} Wallet
          </h1>
          {JSON.stringify({ hasFreighter, isFreighterAllowed })}
          {isFreighterAllowed ? (
            <p className="mt-4 text-muted-foreground">
              Connected to Freighter. You can now access decentralized
              applications and manage your digital assets.
            </p>
          ) : (
            <p className="mt-4 text-muted-foreground">
              Connect your crypto wallet to access decentralized applications
              and manage your digital assets.
            </p>
          )}

          {isLoading && (
            <div className="mt-6 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
            </div>
          )}

          {account?.balances?.map((balance, i) => (
            <p
              key={i}
              className="mt-4 flex flex-row items-center justify-center gap-1 text-center text-xl font-semibold"
            >
              {balance.asset_type === "native" && (
                <Image
                  width={20}
                  height={20}
                  src={"/icons/stellar-xlm-logo.svg"}
                  alt={"Stellar XLM icon"}
                />
              )}
              {balance.asset_type === "credit_alphanum12" && balance.balance}
              {balance.asset_type === "credit_alphanum12" &&
                balance.selling_liabilities}
            </p>
          ))}
          {network && (
            <p className="text-sm font-light text-muted-foreground">
              {network}
            </p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!hasFreighter && (
              <a
                href="https://freighter.app"
                target="_blank"
                className="flex h-10 items-center justify-center gap-2 rounded-md border-[0.5px] border-black hover:bg-black hover:text-white sm:col-span-2"
              >
                <WalletIcon className="h-6 w-6" />
                Install Freighter
              </a>
            )}
            {hasFreighter && !publicKey && (
              <Button
                onClick={connectWallet}
                className="flex items-center justify-center gap-2 border-[1px] border-black bg-black text-white hover:bg-white hover:text-black sm:col-span-2"
              >
                <WalletIcon className="h-6 w-6" />
                Connect Freighter Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const WalletIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
};
