"use client";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { TciketSkeleton } from "~/app/events/components/ticket-skeleton";
import { AlbumArtwork } from "~/app/account/events/components/album-artwork";
import { Separator } from "~/components/ui/separator";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import React from "react";
import { api } from "~/trpc/react";
import NoEvents from "~/app/_components/events/no-events";
import ErrorElement from "~/app/_components/error-element";

const today = new Date().toISOString();
export const DisplayEvents: React.FC<{ fromUserKey?: string }> = ({
  fromUserKey,
}) => {
  const {
    data: events,
    error,
    isLoading,
  } = api.event.search.useQuery({
    minDate: today,
    fromUserKey,
  });

  const { data: previousEvents } = api.event.search.useQuery({
    maxDate: today,
  });

  if (error) {
    return <ErrorElement />;
  }

  return (
    <div className="border-t">
      <div className="bg-background px-4">
        <div className="h-full px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Upcoming events
              </h2>
              <p className="text-sm text-muted-foreground">
                {fromUserKey
                  ? "Your upcoming events"
                  : "Find out what's happening next."}
              </p>
            </div>
          </div>
          <div className="mb-8">
            <div className="my-4 flex items-center">
              <Input
                id="event-filter"
                type="text"
                placeholder="Search events..."
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-4 flex-1"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black"
                  >
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
                          // checked={filters.category.includes(
                          //     "Music Festival",
                          // )}
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
                          // checked={filters.category.includes("Sports")}
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
                          // checked={filters.category.includes("Theater")}
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
                            // value={filters.price.min}
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
                            // value={filters.price.max}
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
                            // value={filters.timeRemaining.min}
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
                            // value={filters.timeRemaining.max}
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
            <div className="flex max-w-[90vw] space-x-4 overflow-x-scroll pb-4">
              {isLoading &&
                Array.from({ length: 2 }).map((_, i) => (
                  <TciketSkeleton key={i} />
                ))}
              {events?.length === 0 && <NoEvents />}
              {events?.map((event) => (
                <AlbumArtwork
                  key={event.name}
                  album={event}
                  className="w-[250px]"
                  aspectRatio="portrait"
                  width={300}
                  height={300}
                  showSalesPercentage
                  href={`/events/${event.id}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Recent events
            </h2>
            <p className="text-sm text-muted-foreground">
              Take a look back to previous events
            </p>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea className="max-w-[90vw]">
              <div className="flex space-x-4 pb-4">
                {previousEvents?.map((event) => (
                  <AlbumArtwork
                    key={event.name}
                    album={event}
                    className="w-[150px]"
                    aspectRatio="square"
                    width={150}
                    height={150}
                    showAttendance
                    href={`/events/${event.id}`}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
