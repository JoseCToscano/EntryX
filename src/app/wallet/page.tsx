"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "~/hooks/useWallet";
import { Icons } from "~/components/icons";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import {
  copyToClipboard,
  generateQrCode,
  shortStellarAddress,
} from "~/lib/utils";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { type Horizon } from "@stellar/stellar-sdk";
import Image from "next/image";
import { ConnectWallet } from "~/app/wallet/connect/connect-component";
import WalletSkeleton from "~/app/wallet/components/wallet-skeleton";

export default function Component() {
  const { publicKey, account, isLoading, hasFreighter, isFreighterAllowed } =
    useWallet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to remove the loading spinner after 3 seconds (3000 milliseconds)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    // Cleanup the timeout if the component is unmounted
    return () => clearTimeout(timeout);
  }, []);

  const recentOperations = api.stellarAccountRouter.operations.useQuery(
    {
      id: publicKey!,
      limit: 25,
    },
    { enabled: !!publicKey },
  );

  if (isLoading || loading) {
    return <WalletSkeleton />;
  }

  if (!hasFreighter || !isFreighterAllowed || !publicKey) {
    return <ConnectWallet />;
  }

  return (
    <div className="mb-10 flex w-full flex-col">
      <main className="flex-1 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <Icons.StellarIcon />
                Stellar Account
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Balance</div>
                <div className="text-lg font-semibold">
                  {account?.xlm?.balance ?? "-"} XLM
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Account ID</div>
                <div className="text-sm font-medium">
                  <span
                    onClick={() => {
                      copyToClipboard(publicKey ?? "");
                    }}
                    className="flex cursor-pointer items-center gap-2 text-blue-800 underline"
                  >
                    {shortStellarAddress(publicKey ?? "", 5)}
                    <Icons.copy className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Trustlines</div>
                <div className="text-sm font-medium">
                  {
                    account?.balances.filter((b) => b.asset_type !== "native")
                      .length
                  }
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Transactions</div>
                <div className="text-sm font-medium">
                  <Link
                    href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                    target="_blank"
                    className="text-blue-800 underline"
                    prefetch={false}
                  >
                    View History
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 p-6">
                {publicKey && (
                  <Image
                    src={generateQrCode(publicKey)}
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="rounded-md"
                    style={{ aspectRatio: "200/200", objectFit: "cover" }}
                  />
                )}
                <div className="text-sm font-medium">
                  <p className="text-center">Wallet Address</p>
                  <span
                    onClick={() => {
                      copyToClipboard(publicKey ?? "");
                    }}
                    className="flex cursor-pointer items-center gap-2 text-center text-blue-800 underline"
                  >
                    {shortStellarAddress(publicKey ?? "", 5)}
                    <Icons.copy className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex max-h-96 flex-col gap-2 overflow-y-scroll">
                {(
                  account?.balances?.filter(
                    (b) => b.asset_type !== "native",
                  ) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[]
                )?.map((asset, id) => (
                  <div
                    key={id}
                    className="mt-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-white text-2xl">
                        <Icons.StellarIcon />
                      </div>
                      <div>
                        <div className="font-medium">{asset.asset_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {shortStellarAddress(asset.asset_issuer)}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold">
                      {Number(asset.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-10">
              <div className="flex max-h-96 flex-col gap-1 overflow-y-scroll">
                {recentOperations.data?.map((op) => (
                  <div key={op.id} className="pr-4">
                    <Separator />
                    <div className="my-1 flex items-center justify-between">
                      <div className="flex w-full items-center gap-2">
                        <div className="w-full">
                          <div className="flex w-full items-center justify-between text-sm font-medium">
                            <span className="flex items-center gap-1">
                              <Icons.StellarIcon />
                              {op.label}
                            </span>
                            {op.asset_code && (
                              <Badge className="border-0 bg-gradient-to-br from-black to-gray-400 text-xs">
                                {op.asset_code}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs font-normal text-muted-foreground">
                            {dayjs(op.created_at).format(
                              "MMM D, YYYY - h:mm A",
                            )}
                          </span>

                          {op.desc.split(",").map((d, i) => (
                            <div
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              • {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                target="_blank"
                className="text-blue-800 underline"
                prefetch={false}
              >
                View All Transactions
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
