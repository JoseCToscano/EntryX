"use client";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import React, { useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import { FIXED_UNITARY_COMMISSION } from "~/constants";
import { isConnected } from "@stellar/freighter-api";
import useFreighter from "~/hooks/useFreighter";

function fromXLMToUSD(xlm: number) {
  return xlm * 0.11;
}
export default function Component() {
  const { data: session } = useSession();
  const { hasFreighter, setHasFreighter } = useFreighter();
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  // Extract the id from the params object
  const { id } = params;
  const event = api.event.get.useQuery({ id: id as string }, { enabled: !!id });
  const ticketCategories = api.asset.list.useQuery(
    { eventId: id as string },
    { enabled: !!id },
  );

  const [cart, setCart] = React.useState<Map<string, number>>(new Map());

  useEffect(() => {
    isConnected().then(setHasFreighter).catch(console.error);
  }, []);

  const addToCart = (categoryId: string) => {
    const currentQuantity = cart.get(categoryId) ?? 0;
    setCart((prev) => new Map(prev.set(categoryId, currentQuantity + 1)));
  };

  const removeFromCart = (categoryId: string) => {
    const currentQuantity = cart.get(categoryId) ?? 0;
    if (currentQuantity > 0) {
      setCart((prev) => new Map(prev.set(categoryId, currentQuantity - 1)));
    }
  };

  const categories = React.useMemo(() => {
    return new Map(
      ticketCategories.data?.map((category) => [category.id, category]) ?? [],
    );
  }, [ticketCategories.data]);

  const total = React.useMemo(() => {
    if (!ticketCategories.data) return 0;
    return Array.from(cart.entries()).reduce((acc, [categoryId, qty]) => {
      const category = categories.get(categoryId);
      const { pricePerUnit } = category ?? { pricePerUnit: 0 };
      return acc + qty * Number(pricePerUnit);
    }, 0);
  }, [cart, ticketCategories.data, categories]);

  const totalTickets = React.useMemo(() => {
    return Array.from(cart.values()).reduce((acc, qty) => {
      return acc + qty;
    }, 0);
  }, [cart]);

  if (typeof id !== "string") return null;
  return (
    <div className="w-full">
      <section className="w-full bg-[url('/images/event-placeholder-3.png')] bg-cover bg-center py-20 md:py-32 lg:py-40">
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

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ticket Options</h2>
            <div className="grid gap-4">
              {ticketCategories.data?.map((category) => (
                <Card
                  key={category.id}
                  className="rounded-lg bg-background p-4 shadow-sm"
                >
                  <h3 className="text-lg font-bold">{category.label}</h3>
                  {/* <p className="text-muted-foreground">Desc...</p> */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      $
                      {Number(category.pricePerUnit).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        maximumSignificantDigits: 2,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(category.id)}
                      >
                        -
                      </Button>
                      <span>{cart.get(category.id) ?? 0}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(category.id)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-row items-center justify-between">
                <p>Your account</p>
                {session && <p>{session?.user?.name}</p>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>John Doe</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>john.doe@email.com</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <div>Total</div>
                  <div>12345 XLM</div>
                </div>
                <Button size="lg" className="w-full bg-black text-white">
                  Fund Account
                </Button>
              </div>
            </CardContent>
          </Card>
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
                        <div>
                          ({qty}) {categories.get(categoryId)?.label}
                        </div>
                        <div>
                          {Number(categories.get(categoryId)?.pricePerUnit) ??
                            0}{" "}
                          XLM
                        </div>
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
                  <Button size="lg" className="w-full bg-black text-white">
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
        </div>
      </div>
    </div>
  );
}
