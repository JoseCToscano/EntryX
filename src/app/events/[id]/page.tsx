"use client";
import { Button } from "~/components/ui/button";
import React, { useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { isConnected } from "@stellar/freighter-api";
import useFreighter from "~/hooks/useFreighter";
import TicketCard from "~/app/events/components/ticket-card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Icons } from "~/components/icons";
import { FIXED_UNITARY_COMMISSION } from "~/constants";

function fromXLMToUSD(xlm: number) {
  return xlm * 0.11;
}

export default function Component() {
  const { hasFreighter, setHasFreighter, publicKey } = useFreighter();
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  // Extract the id from the params object
  const { id } = params;
  const event = api.event.get.useQuery({ id: id as string }, { enabled: !!id });
  const ticketCategories = api.asset.list.useQuery(
    { eventId: id as string },
    { enabled: !!id },
  );

  const myTickets = api.event.myTickets.useQuery(
    { eventId: id as string, userPublicKey: publicKey as string },
    { enabled: !!id && !!publicKey },
  );

  useEffect(() => {
    isConnected().then(setHasFreighter).catch(console.error);
  }, []);

  const categories = React.useMemo(() => {
    return new Map(
      ticketCategories.data?.map((category) => [category.id, category]) ?? [],
    );
  }, [ticketCategories.data]);

  if (typeof id !== "string") return null;
  return (
    <div className="w-full">
      <section className="w-full bg-[url('/images/event-placeholder-3.png')] bg-cover bg-center py-20 md:py-28">
        <MenuBreadcumb id={id} />
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {event?.data?.name}
            </h1>
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="ml-auto border-0 bg-white bg-opacity-25 text-lg font-medium sm:ml-0"
              >
                {dayjs(event.data?.date).format("MMM D, YYYY")}
              </Badge>
              <div className="h-4 w-4 rounded-full bg-primary" />
              <Badge
                variant="outline"
                className="ml-auto border-0 bg-white bg-opacity-25 text-lg font-medium sm:ml-0"
              >
                {event.data?.location ?? event.data?.venue}
              </Badge>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">About the Event</h2>
            <p className="mt-4 text-muted-foreground">
              {event.data?.description}
            </p>
          </div>
          <div>
            <h2 className="my-4 text-2xl font-bold">Your tickets</h2>
            <div className="overflow-x-hidden">
              <ScrollArea>
                <div className="flex max-w-[30vw] space-x-4 p-2 pb-4">
                  {myTickets.data?.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      eventId={id}
                      numOfEntries={Number(ticket.balance.balance)}
                      id={ticket.id}
                      title={ticket.label}
                      location={"SoFi Stadium"}
                      date={dayjs(ticket.createdAt).format("MMM D, YYYY")}
                    />
                  ))}{" "}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-col gap-2 py-4">
                  {ticketCategories.data?.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start justify-between"
                    >
                      <div className="font-medium">{category.label}</div>
                      <div className="flex flex-col items-end justify-end">
                        <div>
                          {(Number(category.pricePerUnit) ?? 0).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 5,
                              maximumFractionDigits: 5,
                            },
                          )}{" "}
                          XLM
                        </div>
                        <div className="text-xs font-light opacity-50">
                          approx. $
                          {fromXLMToUSD(
                            Number(category.pricePerUnit) ?? 0,
                          ).toFixed(2)}{" "}
                          USD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasFreighter ? (
                  <a
                    href={`/events/${id}/purchase`}
                    className="w-full bg-black text-white"
                  >
                    <Button
                      size="lg"
                      className="group w-full bg-black text-white"
                    >
                      Buy Tickets
                      <Icons.expandingArrow className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" className="w-full bg-black text-white">
                      Connect Wallet
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
