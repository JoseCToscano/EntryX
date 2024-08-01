"use client";
import { type Metadata } from "next";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AlbumArtwork } from "./components/album-artwork";
import { api } from "~/trpc/react";
import { EmptyPlaceholder } from "./components/empty-placeholder";
import { listenNowAlbums, madeForYouAlbums } from "../data/albums";

// export const metadata: Metadata = {
//   title: "Music App",
//   description: "Example music app using the components.",
// };

import { CalendarDateRangePicker } from "./components/date-range-picker";
import CreateEventDialog from "~/app/account/events/components/create-event-dialog";
import { MenuBreadcumb } from "~/app/account/events/components/menu-breadcumb";

export default function EventsPage() {
  const { data: events, error, isLoading } = api.event.search.useQuery({});
  return (
    <>
      <div className="border-t">
        <div className="bg-background p-4">
          <MenuBreadcumb />
          <div className="h-full px-4 py-6 lg:px-8">
            <Tabs defaultValue="overview" className="h-full space-y-6">
              <div className="space-between flex items-center">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <div className="ml-auto mr-4">
                  <CalendarDateRangePicker />
                </div>
                <CreateEventDialog />
              </div>
              <TabsContent
                value="overview"
                className="border-none p-0 outline-none"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Upcoming events
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your favorite artists. Live.
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="relative">
                  <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                      {events?.map((event) => (
                        <AlbumArtwork
                          key={event.name}
                          album={event}
                          className="w-[250px]"
                          aspectRatio="portrait"
                          width={300}
                          height={300}
                          showSalesPercentage
                          href={`/account/events/${event.id}`}
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
                  <ScrollArea>
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
                          href={`/account/events/#`}
                        />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent
                value="upcoming"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Upcoming events
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Get ready for your next event.
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <EmptyPlaceholder />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
