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
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { useParams } from "next/navigation";
import { FIXED_UNITARY_COMMISSION } from "~/constants";
import { Separator } from "~/components/ui/separator";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Icons } from "~/components/icons";
import dayjs from "dayjs";
import { fromXLMToUSD, plurify } from "~/lib/utils";
import { useWallet } from "~/hooks/useWallet";

const SecondaryMarket: React.FC = () => {
  const { signXDR, hasFreighter, isFreighterAllowed, publicKey } = useWallet();
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  // Extract the id from the params object
  const { id } = params;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    event: "",
    date: "",
    price: "",
  });

  const items = api.event.marketplace.useQuery(
    { id: id as string },
    {
      enabled: !!id,
    },
  );

  const tickets = [
    {
      id: 1,
      event: "Coachella Music Festival",
      date: "April 14-16, 2023",
      location: "Indio, CA",
      price: 499.99,
    },
    {
      id: 2,
      event: "Lollapalooza",
      date: "July 28-31, 2023",
      location: "Chicago, IL",
      price: 375.0,
    },
    {
      id: 3,
      event: "Bonnaroo Music & Arts Festival",
      date: "June 15-18, 2023",
      location: "Manchester, TN",
      price: 299.99,
    },
    {
      id: 4,
      event: "Austin City Limits Music Festival",
      date: "October 6-8 & 13-15, 2023",
      location: "Austin, TX",
      price: 325.0,
    },
    {
      id: 5,
      event: "Glastonbury Festival",
      date: "June 21-25, 2023",
      location: "Pilton, UK",
      price: 335.0,
    },
  ];
  const filteredTickets = useMemo(() => {
    return items.data?.filter(({ offer, ...asset }) => {
      const eventMatch = filterOptions.event
        ? asset.event?.name
            .toLowerCase()
            .includes(filterOptions.event.toLowerCase())
        : true;
      const dateMatch = filterOptions.date
        ? String(asset.event?.date ?? "")
            .toLowerCase()
            .includes(filterOptions.date.toLowerCase())
        : true;
      const priceMatch = filterOptions.price
        ? Number(offer.price) <= parseFloat(filterOptions.price)
        : true;

      return eventMatch && dateMatch && priceMatch;
    });
  }, [items.data, filterOptions]);

  const [cart, setCart] = React.useState<Map<string, number>>(new Map());
  const ctx = api.useContext();

  const submitTransaction =
    api.stellarAccountRouter.submitTransaction.useMutation({
      onError: (e) => {
        console.error(e);
      },
      onSuccess: () => {
        void ctx.stellarAccountRouter.details.invalidate();
        toast.success("Transaction sent to blockchain successfully");
      },
    });

  const purchase = api.stellarOffer.purchase.useMutation({
    onError: (e) => {
      toast.error("Error on purchase");
      console.error(e);
    },
  });

  const addToCart = (assetId: string) => {
    const currentQuantity = cart.get(assetId) ?? 0;
    setCart((prev) => new Map(prev.set(assetId, currentQuantity + 1)));
  };

  const removeFromCart = (assetId: string) => {
    const currentQuantity = cart.get(assetId) ?? 0;
    if (currentQuantity > 0) {
      setCart((prev) => new Map(prev.set(assetId, currentQuantity - 1)));
    }
  };

  const total = 10;

  const totalTickets = React.useMemo(() => {
    return Array.from(cart.values()).reduce((acc, qty) => {
      return acc + qty;
    }, 0);
  }, [cart]);

  if (!id) return null;

  return (
    <div className="w-full p-4">
      <MenuBreadcumb id={id as string} actionSection="Secondary market" />
      <div className="container mx-auto grid grid-cols-1 items-start gap-12 px-4 py-12 md:grid-cols-[1fr_350px] md:gap-16 md:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Secondary Market</h2>
            <p className="text-muted-foreground">
              Buy and sell tickets for your favorite events.
            </p>
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
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="event-filter"
                        className="mb-2 block font-medium"
                      >
                        Event
                      </label>
                      <Input
                        id="event-filter"
                        type="text"
                        placeholder="Search events..."
                        value={filterOptions.event}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            event: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="date-filter"
                        className="mb-2 block font-medium"
                      >
                        Date
                      </label>
                      <Input
                        id="date-filter"
                        type="text"
                        placeholder="Search dates..."
                        value={filterOptions.date}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="price-filter"
                        className="mb-2 block font-medium"
                      >
                        Price
                      </label>
                      <Input
                        id="price-filter"
                        type="number"
                        placeholder="Max price..."
                        value={filterOptions.price}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {(() => {
                console.log("items", filteredTickets);
                return null;
              })()}
              {filteredTickets?.map(({ event, offer, ...asset }) => (
                <Card
                  key={offer.id}
                  className="h-full bg-gradient-to-br from-white to-primary-foreground hover:scale-[1.01]"
                >
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      {dayjs(event.date).format("MMM D, YYYY")}
                      <div className="text-xs text-muted-foreground">
                        {event.venue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {parseInt(offer.amount)}{" "}
                      {plurify("ticket", parseInt(offer.amount))}
                    </p>
                    <span className="text-2xl font-bold">
                      $
                      {Number(offer.price).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        maximumSignificantDigits: 2,
                      })}
                    </span>
                  </CardContent>
                  <CardFooter className="">
                    <Button className="group w-full border-[1.5px] border-black py-4">
                      Make offer
                      <Icons.expandingArrow className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {cart.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your purchase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(cart.entries())
                    .filter(([, total]) => total > 0)
                    .map(([categoryId, qty]) => {
                      return (
                        <div
                          key={categoryId}
                          className="flex items-center justify-between"
                        >
                          <div>({qty}) ABC</div>
                          <div>{0} XLM</div>
                        </div>
                      );
                    })}
                  <div className="flex items-center justify-between">
                    <div>Service Fee</div>
                    <div>{totalTickets * FIXED_UNITARY_COMMISSION} XLM</div>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <div>Subtotal</div>
                    <div>
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5,
                      })}{" "}
                      XLM
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <div>Total</div>
                    <div className="flex flex-col items-end justify-end">
                      <div>
                        {(
                          total +
                          totalTickets * FIXED_UNITARY_COMMISSION
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 5,
                          maximumFractionDigits: 5,
                        })}{" "}
                        XLM
                      </div>
                      <div className="text-xs font-light opacity-50">
                        approx. $
                        {fromXLMToUSD(
                          total + totalTickets * FIXED_UNITARY_COMMISSION,
                        ).toFixed(2)}{" "}
                        USD
                      </div>
                    </div>
                  </div>
                  <div className="py-4">
                    <TransactionSteps assets={Array.from(cart.keys())} />
                  </div>
                  {hasFreighter ? (
                    <Button
                      disabled={cart.size === 0}
                      size="lg"
                      className="w-full bg-black text-white"
                    >
                      Buy Tickets
                    </Button>
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
          )}
          <Card>
            <CardHeader>
              <CardTitle>Sell your tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="py-2 text-muted-foreground">
                  List your tickets on the secondary market and earn money by
                  selling them to other users.
                </p>
                <Button size="lg" className="group w-full bg-black text-white">
                  List your Tickets
                  <Icons.expandingArrow className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>List Your Tickets</Button>
      </div>
    </div>
  );
};

export default SecondaryMarket;
