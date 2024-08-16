"use client";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { AlbumArtwork } from "./components/album-artwork";
import { api } from "~/trpc/react";
import { MenuBreadcumb } from "~/app/account/events/components/menu-breadcumb";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/hooks/useWallet";

const today = new Date().toISOString();

export default function EventsPage() {
  const { publicKey } = useWallet();
  const { data: upcomingEvents } = api.organizer.myEvents.useQuery(
    {
      publicKey: publicKey!,
      minDate: today,
    },
    { enabled: !!publicKey },
  );
  const { data: previousEvents } = api.organizer.myEvents.useQuery(
    {
      publicKey: publicKey!,
      maxDate: today,
    },
    { enabled: !!publicKey },
  );

  return (
    <>
      <div className="border-t">
        <div className="bg-background p-4">
          <MenuBreadcumb />
          <div className="h-full px-4 py-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Upcoming events
                </h2>
                <p className="text-sm text-muted-foreground">
                  Get ready for your next event.
                </p>
              </div>
              <div className="ml-auto mr-4 flex items-center gap-2">
                <Link href="/account/events/new">
                  <Button className="h-10 rounded-md border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black">
                    Create New Event
                  </Button>
                </Link>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex max-w-[90vw] space-x-4 overflow-x-scroll pb-4">
              {upcomingEvents?.map((event) => (
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
            <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Your events
              </h2>
              <p className="text-sm text-muted-foreground">
                Take a look back to previous events.
              </p>
            </div>
            <Separator className="my-4" />
            <div className="">
              <div className="flex space-x-4 pb-4">
                {previousEvents?.map((album) => (
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
