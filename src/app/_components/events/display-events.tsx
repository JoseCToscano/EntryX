"use client";
import { Input } from "~/components/ui/input";
import { TciketSkeleton } from "~/app/events/components/ticket-skeleton";
import { AlbumArtwork } from "~/app/account/events/components/album-artwork";
import { Separator } from "~/components/ui/separator";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import React from "react";
import { api } from "~/trpc/react";
import NoEvents from "~/app/_components/events/no-events";
import ErrorElement from "~/app/_components/error-element";
import { useSearch } from "~/hooks/useSearch";

const today = new Date().toISOString();
export const DisplayEvents: React.FC<{ fromUserKey?: string }> = ({
  fromUserKey,
}) => {
  const {} = useSearch();
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  const {
    data: events,
    error,
    isLoading,
  } = api.event.search.useQuery({
    minDate: today,
    search: debouncedSearchTerm,
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
                value={searchTerm}
                onChange={handleSearch}
                className="mr-4 flex-1"
              />
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
