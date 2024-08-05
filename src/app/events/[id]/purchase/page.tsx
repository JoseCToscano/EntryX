"use client";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import { FIXED_UNITARY_COMMISSION } from "~/constants";
import { isConnected, signTransaction } from "@stellar/freighter-api";
import useFreighter from "~/hooks/useFreighter";
import TicketCategoryCard from "~/app/events/components/ticket-category-card";
import toast from "react-hot-toast";
import TicketCard from "~/app/events/components/ticket-card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { useRouter } from "next/navigation";

function fromXLMToUSD(xlm: number) {
  return xlm * 0.11;
}

const steps = {
  overview: 0,
  purchase: 1,
};

export default function Purchase() {
  const router = useRouter();
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

  const handlePurchase = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }
    const [assetKey] = cart.keys();
    const asset = cart.get(assetKey);
    if (assetKey && asset) {
      const xdr = await purchase.mutateAsync({
        assetId: assetKey,
        userPublicKey: publicKey,
        unitsToBuy: asset,
      });
      const signedTransaction = await signTransaction(xdr, {
        network: "TESTNET",
        accountToSign: publicKey,
      });
      const result = await submitTransaction.mutateAsync({
        xdr: signedTransaction,
      });
      void ctx.asset.availability.invalidate();
      console.log(result);
      void router.push(`/events/${id}`);
    } else {
      toast.error("Please select a ticket to purchase");
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
    <div className="w-full p-4">
      <MenuBreadcumb id={id} actionSection={"Buy tickets"} />
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">{event.data?.name}</h2>
            <p className="mt-4 text-muted-foreground">
              {event.data?.description}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ticket Options</h2>
            <div className="grid gap-4">
              {ticketCategories.data?.map((category) => (
                <TicketCategoryCard
                  key={category.id}
                  category={category}
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-8">
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
                  <Button
                    onClick={handlePurchase}
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
        </div>
      </div>
    </div>
  );
}
