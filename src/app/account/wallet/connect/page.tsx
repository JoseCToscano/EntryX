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
  const [hasFreighter, setHasFreighter] = useState(false);
  const [network, setNetwork] = useState("");
  const { setPublicKey, publicKey } = useFreighter();

  const { data, isLoading } = api.stellarAccountRouter.details.useQuery(
    {
      id: publicKey!,
    },
    { enabled: !!publicKey, refetchInterval: 5000 },
  );

  useEffect(() => {
    isConnected().then(setHasFreighter).catch(console.error);
  }, []);

  useEffect(() => {
    if (hasFreighter) {
      void getPublicKey();
      getNetwork().then(setNetwork).catch(console.error);
    }
  }, [hasFreighter]);

  const getPublicKey = async () => {
    const network = await getNetwork();
    requestAccess()
      .then((key) => {
        setPublicKey(key);
        toast.success("Connected to Freighter: " + network);
      })
      .catch(() => {
        toast.error("Failed to connect to Freighter");
      });
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
          <p className="mt-4 flex flex-row items-center justify-center gap-1 text-center text-xl font-semibold">
            <Image
              width={20}
              height={20}
              src={"/icons/stellar-xlm-logo.svg"}
              alt={"Stellar XLM icon"}
            />
            XLM: {data?.xlm?.balance ?? "-"}
          </p>
          {network && (
            <p className="text-sm font-light text-muted-foreground">
              {network}
            </p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {hasFreighter ? (
              <Button
                onClick={getPublicKey}
                className="flex items-center justify-center gap-2 border-[0.5px] border-black hover:bg-black hover:text-white sm:col-span-2"
              >
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

function CoinsIcon(props) {
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
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

function VenetianMaskIcon(props) {
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
      <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z" />
      <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z" />
      <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z" />
    </svg>
  );
}

function WalletIcon(props) {
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
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
