"use client";
import React from "react";
import { api } from "~/trpc/react";
import { Separator } from "~/components/ui/separator";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { AlbumArtwork } from "~/app/account/events/components/album-artwork";
import { madeForYouAlbums } from "~/app/account/data/albums";
import { TciketSkeleton } from "~/app/events/components/ticket-skeleton";

const EventsPage: React.FC = () => {
  const { data: events, error, isLoading } = api.event.search.useQuery({});

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="border-t">
      <div className="bg-background p-4">
        <div className="h-full px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Upcoming events
              </h2>
              <p className="text-sm text-muted-foreground">
                Find out what&apos;s happening next.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea className="max-w-[90vw]">
              <div className="flex space-x-4 pb-4">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TciketSkeleton key={i} />
                  ))}
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
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Your events
            </h2>
            <p className="text-sm text-muted-foreground">
              Take a look back to previous events.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea className="max-w-[90vw]">
              <div className="flex space-x-4 pb-4">
                {madeForYouAlbums.map((album) => (
                  <AlbumArtwork
                    key={album.name}
                    album={album}
                    className="w-[150px]"
                    aspectRatio="square"
                    width={150}
                    height={150}
                    showAttendance
                    href={`/events/#`}
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
export default EventsPage;
