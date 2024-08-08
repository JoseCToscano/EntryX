"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YC3V5HBy8Bu
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "~/components/ui/button";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getNetwork,
} from "@stellar/freighter-api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useFreighter from "~/hooks/useFreighter";
import { api } from "~/trpc/react";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import Link from "next/link";
import { useWallet } from "~/hooks/useWallet";
import { useUser } from "@clerk/nextjs";

const WalletBreadcrumb: React.FC = () => {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/account/wallet" prefetch={false}>
              Wallet
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/account/wallet/connect" prefetch={false}>
              Freighter
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default function Component() {
  const { user } = useUser();
  const { publicKey, signXDR, network, isLoading, hasFreighter, account } =
    useWallet();

  const challenge = api.stellarAccountRouter.getChallenge.useMutation({
    onError: (e) => toast.error("Challenge error:" + e.message),
  });
  const validate = api.stellarAccountRouter.validateChallenge.useMutation({
    onError: (e) => toast.error("Validate error:", e.message),
  });

  const connect = async () => {
    if (!publicKey) {
      return toast.error("No public key");
    }
    if (!user) {
      return toast.error("No user");
    }

    const xdr = await challenge.mutateAsync({ publicKey });
    const signedXdr = await signXDR(xdr);
    const isValid = await validate.mutateAsync({
      xdr: signedXdr,
      publicKey,
      clerkId: user.id,
    });
    toast.success(isValid ? "Challenge validated" : "Challenge failed");
  };

  return (
    <div className="p-4">
      <WalletBreadcrumb />
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {hasFreighter ? "Freighter" : "Connect"} Wallet
          </h1>
          {hasFreighter ? (
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

          {account?.balances?.map(({ balance, asset_type, asset_code }) => (
            <p
              key={asset_type}
              className="mt-4 flex flex-row items-center justify-center gap-1 text-center text-xl font-semibold"
            >
              {asset_type === "native" && (
                <Image
                  width={20}
                  height={20}
                  src={"/icons/stellar-xlm-logo.svg"}
                  alt={"Stellar XLM icon"}
                />
              )}
              {asset_code}: {balance ?? "-"}
            </p>
          ))}
          {network && (
            <p className="text-sm font-light text-muted-foreground">
              {network}
            </p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button onClick={connect}>TEEEEEST</Button>
            {hasFreighter ? (
              <Button className="flex items-center justify-center gap-2 border-[0.5px] border-black hover:bg-black hover:text-white sm:col-span-2">
                <WalletIcon className="h-6 w-6" />
                Use Freighter
              </Button>
            ) : (
              <a
                href="https://freighter.app"
                target="_blank"
                className="flex h-10 items-center justify-center gap-2 rounded-md border-[0.5px] border-black hover:bg-black hover:text-white sm:col-span-2"
              >
                <WalletIcon className="h-6 w-6" />
                Install Freighter
              </a>
            )}

            <Button className="flex items-center justify-center gap-2 border-[0.5px] border-black hover:bg-black hover:text-white sm:col-span-2">
              <WalletIcon className="h-6 w-6" />
              LOBSTR
            </Button>
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
