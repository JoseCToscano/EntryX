"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/L3HRyFOavtW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Icons } from "~/components/icons";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { TciketSkeleton } from "~/app/events/components/ticket-skeleton";
import ListYourTicketsBanner from "~/app/secondary-market/components/list-your-tickets-banner";
import { useWallet } from "~/hooks/useWallet";
import { env } from "~/env";
import ConnectYourWallet from "~/app/_components/connect-your-wallet";
import NoAuctions from "~/app/_components/events/no-auctions";
import { plurify } from "~/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";

export default function Component() {
  const { account, publicKey } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filters, setFilters] = useState({
    category: ["Music Festival", "Sports", "Theater"],
    price: {
      min: 0,
      max: 1000,
    },
    timeRemaining: {
      min: 0,
      max: 72,
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  // Debouncing the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      router.push(pathname + "?" + createQueryString("search", searchTerm));
    }, 500); // Adjust the delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  const auctionItems = api.marketplace.searchAuctions.useQuery(
    {
      search: debouncedSearchTerm,
      eventId: searchParams.get("eventId") ?? undefined,
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
      <div className="bg-background px-4">
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
              <DropdownMenu>
                {/*<DropdownMenuTrigger asChild>*/}
                {/*  <Button*/}
                {/*    variant="ghost"*/}
                {/*    className="h-8 border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black"*/}
                {/*  >*/}
                {/*    <Icons.filter className="mr-2 h-4 w-4" />*/}
                {/*    Filters*/}
                {/*  </Button>*/}
                {/*</DropdownMenuTrigger>*/}
                <DropdownMenuContent className="w-64 p-4">
                  <div className="grid gap-4">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Category</h3>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.category.includes(
                              "Music Festival",
                            )}
                            // onCheckedChange={(checked) =>
                            //   handleFilterChange(
                            //     "category",
                            //     checked
                            //       ? [...filters.category, "Music Festival"]
                            //       : filters.category.filter(
                            //           (c) => c !== "Music Festival",
                            //         ),
                            //   )
                            // }
                          />
                          Music Festival
                        </Label>
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.category.includes("Sports")}
                            // onCheckedChange={(checked) =>
                            //   handleFilterChange(
                            //     "category",
                            //     checked
                            //       ? [...filters.category, "Sports"]
                            //       : filters.category.filter(
                            //           (c) => c !== "Sports",
                            //         ),
                            //   )
                            // }
                          />
                          Sports
                        </Label>
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.category.includes("Theater")}
                            // onCheckedChange={(checked) =>
                            //   handleFilterChange(
                            //     "category",
                            //     checked
                            //       ? [...filters.category, "Theater"]
                            //       : filters.category.filter(
                            //           (c) => c !== "Theater",
                            //         ),
                            //   )
                            // }
                          />
                          Theater
                        </Label>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Price</h3>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span>Min:</span>
                          <input
                            type="number"
                            value={filters.price.min}
                            // onChange={(e) =>
                            //   handleFilterChange("price", {
                            //     ...filters.price,
                            //     min: Number(e.target.value),
                            //   })
                            // }
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Max:</span>
                          <input
                            type="number"
                            value={filters.price.max}
                            // onChange={(e) =>
                            //   handleFilterChange("price", {
                            //     ...filters.price,
                            //     max: Number(e.target.value),
                            //   })
                            // }
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium">
                        Time Remaining
                      </h3>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span>Min (hours):</span>
                          <input
                            type="number"
                            value={filters.timeRemaining.min}
                            // onChange={(e) =>
                            //   handleFilterChange("timeRemaining", {
                            //     ...filters.timeRemaining,
                            //     min: Number(e.target.value),
                            //   })
                            // }
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Max (hours):</span>
                          <input
                            type="number"
                            value={filters.timeRemaining.max}
                            // onChange={(e) =>
                            //   handleFilterChange("timeRemaining", {
                            //     ...filters.timeRemaining,
                            //     max: Number(e.target.value),
                            //   })
                            // }
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {searchParams.get("eventId") && (
              <Badge className="mb-2">
                Filtered by event: {searchParams.get("eventId")!}
                <span
                  className="ml-2 cursor-pointer text-white hover:scale-105"
                  onClick={() => {
                    console.log("clearing filter");
                    router.push(
                      pathname + "?" + createQueryString("eventId", ""),
                    );
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
                          {plurify("ticket", auction.assetUnits)} for{" "}
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
                        <div className="text-sm font-bold text-primary">
                          Current Bid: ${Number(auction.highestBid ?? 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total bids: {Number(auction.bidCount ?? 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dayjs(auction.endsAt).diff(dayjs(), "day")} days
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
