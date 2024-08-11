"use client";
import React from "react";
import { useWallet } from "~/hooks/useWallet";
import { Icons } from "~/components/icons";

import Link from "next/link";
import { Button } from "~/components/ui/button";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Horizon } from "@stellar/stellar-sdk";
import Image from "next/image";

export default function Component() {
  const { publicKey, account } = useWallet();

  const last5Operations = api.stellarAccountRouter.operations.useQuery(
    {
      id: publicKey!,
      limit: 10,
    },
    { enabled: !!publicKey },
  );

  return (
    <div className="flex w-full flex-col">
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
                    className="flex cursor-pointer items-center gap-2 text-blue-600 underline"
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
                    className="text-blue-600 underline"
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
                    className="flex cursor-pointer items-center gap-2 text-center text-blue-600 underline"
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
              <ScrollArea className="flex max-h-80 flex-col gap-10">
                {(
                  account?.balances?.filter(
                    (b) => b.asset_type !== "native",
                  ) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[]
                )?.map((asset, id) => (
                  <div key={id} className="flex items-center justify-between">
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
                    <div className="text-lg font-semibold">{asset.balance}</div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-10">
              <ScrollArea className="flex max-h-80 flex-col gap-10">
                {last5Operations.data?.map((op) => (
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

                          <div className="text-sm text-muted-foreground">
                            {op.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Link
                href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                target="_blank"
                className="text-blue-600 underline"
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
