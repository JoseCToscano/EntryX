/**
 * v0 by Vercel.
 * @see https://v0.dev/t/L3HRyFOavtW
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client";

import React, { useState, useMemo } from "react";
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
  CardFooter,
} from "~/components/ui/card";
import { Icons } from "~/components/icons";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import Image from "next/image";
import { AlbumArtwork } from "~/app/account/events/components/album-artwork";
import type { Event } from "@prisma/client";
import Link from "next/link";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };
  const handleFilterChange = (
    type: "category" | "price" | "timeRemaining",
    value: string | number,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: value,
    }));
  };

  const auctionItems = api.marketplace.searchAuctions.useQuery({});

  return (
    <div className="border-t">
      <div className="bg-background p-4">
        <div className="h-full px-4 py-6 lg:px-8">
          {/*<MenuBreadcumb actionSection="Secondary Market" />*/}
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
            <div className="mb-4 flex items-center">
              <Input
                id="event-filter"
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-4 flex-1"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Icons.filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                      <CardTitle>{asset.event.name}</CardTitle>
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
                          {dayjs(auction.endsAt).diff(dayjs(), "day")} days
                          remaining
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                      >
                        Place Bid
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button>List Your Tickets</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
