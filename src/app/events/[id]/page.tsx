"use client";
import { Button } from "~/components/ui/button";
import React from "react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import TicketCard from "~/app/events/components/ticket-card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Icons } from "~/components/icons";
import { useWallet } from "~/hooks/useWallet";
import { fromXLMToUSD } from "~/lib/utils";
import Banner from "~/components/components/banner";

export default function Component() {
  const { publicKey, hasFreighter } = useWallet();
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
    { eventId: id as string, userPublicKey: publicKey! },
    { enabled: !!id && !!publicKey },
  );

  if (typeof id !== "string") return null;
  return (
    <div className="w-full">
      {event.data?.distributorKey === publicKey && (
        <Banner
          title={"It seems you are using the event's distributor's Wallet"}
          content={
            <>
              <p className="text-sm text-gray-500">
                You are connected to the event&apos;s distributor&apos;s wallet.
                If your intention is to purchase tickets, please connect your
                personal wallet.
              </p>
              <p className="text-sm text-gray-500">
                If your intention was to edit the event, please go to the
                event&apos;s
                <a
                  href={`/account/events/${id}`}
                  className="text-blue-500 underline"
                >
                  {" "}
                  edit page{" "}
                </a>
              </p>
            </>
          }
          buttonText={"Understood"}
          defaultOpen
        />
      )}
      <main className="flex-1">
        <section
          className={`w-full bg-cover bg-center py-10`}
          style={{
            backgroundImage: `url(${event.data?.coverUrl ?? ""})`,
          }}
        >
          <MenuBreadcumb id={id} className="ml-8" />
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <h1 className="bg-gray-200 bg-opacity-25 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
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
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dates</div>
                      <div className="text-muted-foreground">
                        {event.data
                          ? dayjs(event.data?.date).format("MMMM D, YYYY")
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-muted-foreground">
                        {event.data?.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Times</div>
                      <div className="text-muted-foreground">
                        12:00 PM - 12:00 AM
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {myTickets.data && myTickets.data?.length > 0 && (
              <div>
                <h2 className="my-4 text-2xl font-bold">Your tickets</h2>
                <div className="overflow-x-scroll">
                  <div className="flex max-w-[30vw] space-x-4 p-2 pb-4">
                    {myTickets.data?.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        eventId={id}
                        code={ticket.code ?? ""}
                        numOfEntries={Number(ticket.balance.balance)}
                        id={ticket.id!}
                        title={ticket.label!}
                        location={event?.data?.location ?? ""}
                        venue={event?.data?.venue ?? ""}
                        date={dayjs(ticket.createdAt).format("MMM D, YYYY")}
                        sellingLiabilities={parseInt(ticket.sellingLiabilities)}
                      />
                    ))}{" "}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-8">
            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Event Status</CardTitle>
                <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400">
                  {event.data?.status}
                </Badge>
              </CardHeader>
            </Card>
            {dayjs().isBefore(dayjs(event.data?.date), "hours") && (
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Tickets</CardTitle>
                  <CardDescription>Available ticket categories</CardDescription>
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
                              {(
                                Number(category.pricePerUnit) ?? 0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 5,
                                maximumFractionDigits: 5,
                              })}{" "}
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
                          variant="ghost"
                          className="group h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                        >
                          {!!myTickets.data?.length
                            ? "Purchase additional Tickets"
                            : "Proceed to ticket selection"}
                          <Icons.expandingArrow className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <a
                        href="https://freighter.app"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="lg"
                          className="w-full bg-black text-white"
                        >
                          Connect Wallet
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const CalendarIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
};

const ClockIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

const MapPinIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};
