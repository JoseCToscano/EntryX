"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/L3HRyFOavtW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import React, { useMemo } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { TciketSkeleton } from "~/app/events/components/ticket-skeleton";
import ListYourTicketsBanner from "~/app/secondary-market/components/list-your-tickets-banner";
import { useWallet } from "~/hooks/useWallet";
import { env } from "~/env";
import ConnectYourWallet from "~/app/_components/connect-your-wallet";
import NoAuctions from "~/app/_components/events/no-auctions";
import { plurify, shortStellarAddress } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { useSearch } from "~/hooks/useSearch";

export default function Component() {
  const { account, publicKey } = useWallet();
  const {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    addToSeacrhParams,
    searchParams,
  } = useSearch();

  const filterFromUser = !!searchParams.get("fromUser");
  const filterMyBids = !!searchParams.get("myBids");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  const auctionItems = api.marketplace.searchAuctions.useQuery(
    {
      search: debouncedSearchTerm,
      eventId: searchParams.get("eventId") ?? undefined,
      fromUserKey: filterFromUser ? publicKey : undefined,
      bidder: filterMyBids ? publicKey : undefined,
    },
    {},
  );

  const hasAssets = useMemo(() => {
    return account?.balances.some((balance) => {
      if (balance.asset_type === "credit_alphanum12") {
        return (
          balance.asset_issuer === env.NEXT_PUBLIC_ISSUER_PUBLIC_KEY &&
          Number(balance.balance) > 0
        );
      }
    });
  }, [account?.balances]);

  return (
    <div className="border-t">
      {hasAssets && <ListYourTicketsBanner />}
      {!publicKey && <ConnectYourWallet />}
      <div className="bg-background-red px-4">
        <div className="h-full px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Secondary Market
              </h2>
              <p className="text-sm text-muted-foreground">
                Buy and sell tickets from other users.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="my-4 flex items-center">
              <Input
                id="event-filter"
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
                className="mr-4 flex-1"
              />
            </div>
            {searchParams.get("eventId") && (
              <Badge className="mb-2">
                Filtered by event: {searchParams.get("eventId")!}
                <span
                  className="ml-2 cursor-pointer text-white hover:scale-105"
                  onClick={() => {
                    console.log("clearing filter");
                    addToSeacrhParams("eventId", "");
                  }}
                >
                  x
                </span>
              </Badge>
            )}
            {filterFromUser && (
              <Badge className="mb-2">
                My Auctions
                <span
                  className="ml-2 cursor-pointer text-white hover:scale-105"
                  onClick={() => {
                    addToSeacrhParams("fromUser", "");
                  }}
                >
                  x
                </span>
              </Badge>
            )}
            {filterMyBids && (
              <Badge className="mb-2">
                Auctions I&apos;ve bid on
                <span
                  className="ml-2 cursor-pointer text-white hover:scale-105"
                  onClick={() => {
                    addToSeacrhParams("myBids", "");
                  }}
                >
                  x
                </span>
              </Badge>
            )}
            {auctionItems.data?.length === 0 && <NoAuctions />}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {auctionItems.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TciketSkeleton key={i} />
                ))}
              {auctionItems.data?.map(({ asset, id, ...auction }) => (
                <Link href={`/secondary-market/${id}`} key={id}>
                  <Card
                    key={id}
                    className="hover:boder-[1.5px] hover:border-gray-400 hover:shadow-gray-300"
                  >
                    <Image
                      width={300}
                      height={300}
                      src={asset.event.imageUrl ?? "/"}
                      alt={asset.event.name}
                      className="h-48 w-full rounded-t-lg object-cover"
                    />
                    <CardHeader>
                      <CardTitle>
                        <Badge className="mb-2 text-sm">
                          {auction.assetUnits}{" "}
                          {plurify("ticket", auction.assetUnits)}
                        </Badge>
                        <p>{asset.event.name}</p>
                      </CardTitle>
                      <CardDescription>
                        <span className="flex flex-row items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {asset.event.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(asset.event.date).format("MMM DD")}
                          </p>
                        </span>{" "}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="">
                      <div className="mb-4 flex flex-col items-start justify-between">
                        <div className="flex items-center justify-between text-sm font-bold text-primary">
                          Current Bid: ${Number(auction.highestBid ?? 0)}
                        </div>
                        {auction.highestBidder && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            • {shortStellarAddress(auction.highestBidder)}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          • Total bids: {Number(auction.bidCount ?? 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • {dayjs(auction.endsAt).diff(dayjs(), "day")} days
                          remaining
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                      >
                        Place Bid
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
