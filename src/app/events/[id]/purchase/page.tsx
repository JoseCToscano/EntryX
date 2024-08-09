"use client";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import { FIXED_UNITARY_COMMISSION, SERVICE_FEE } from "~/constants";
import {
  TicketCategoryCard,
  TicketCategorySkeleton,
} from "~/app/events/components/ticket-category-card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { useWallet } from "~/hooks/useWallet";
import { computeTransactionFees, fromXLMToUSD } from "~/lib/utils";
import { Asset as DBAsset } from "@prisma/client";
import { Asset, AssetType } from "@stellar/stellar-sdk";
import { BalanceLineAsset } from "~/a";

export default function Purchase() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  /* State variables */
  const { publicKey, signXDR, hasFreighter } = useWallet();
  const [processStep, setProcessStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = React.useState<
    Map<string, { asset: DBAsset; total: number }>
  >(new Map());

  /* tRPC api calls */
  const event = api.event.get.useQuery({ id: id as string }, { enabled: !!id });
  const ticketCategories = api.asset.list.useQuery(
    { eventId: id as string },
    { enabled: !!id },
  );
  const account = api.stellarAccountRouter.details.useQuery(
    { id: publicKey! },
    { enabled: !!publicKey },
  );
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

  const addToCart = (asset: DBAsset) => {
    const currentQuantity = cart.get(asset.id)?.total ?? 0;
    setCart((prev) => {
      console.log("currentQuantity", currentQuantity);
      return new Map(prev.set(asset.id, { asset, total: currentQuantity + 1 }));
    });
  };

  const removeFromCart = (asset: DBAsset) => {
    const currentQuantity = cart.get(asset.id)?.total ?? 0;
    if (currentQuantity > 0) {
      setCart((prev) => {
        return new Map(
          prev.set(asset.id, { asset, total: currentQuantity - 1 }),
        );
        return prev;
      });
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (!publicKey) {
        return toast.error("Please connect your wallet");
      }
      const [assetKey] = cart.keys();
      if (!assetKey) {
        return toast.error("Please select a ticket to purchase");
      }
      const asset = cart.get(assetKey);
      if (assetKey && asset) {
        setProcessStep(2);
        const xdr = await purchase.mutateAsync({
          userPublicKey: publicKey,
          items: Array.from(cart.entries()).map(([assetId, cartItem]) => ({
            assetId,
            unitsToBuy: cartItem.total,
          })),
        });
        const signedTransaction = await signXDR(xdr);
        setProcessStep(3);
        await submitTransaction.mutateAsync({
          xdr: signedTransaction,
        });
        setProcessStep(4);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        void ctx.asset.availability.invalidate();
      } else {
        toast.error("Please select a ticket to purchase");
      }
    } catch (e) {
      console.error(e);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessStep(1);
      setLoading(false);
    }
  };

  const secondaryItems = api.event.marketplaceCount.useQuery(
    { id: id as string },
    { enabled: !!id },
  );

  const categories = React.useMemo(() => {
    return new Map(
      ticketCategories.data?.map((category) => [category.id, category]) ?? [],
    );
  }, [ticketCategories.data]);

  const totalFees = React.useMemo(() => {
    if (!account.data) return 0;
    const itemsInCart = new Set(
      Array.from(cart.entries())
        .filter(([, { total }]) => total > 0)
        .map(([, a]) => new Asset(a.asset.code, a.asset.issuer)),
    );

    return computeTransactionFees(
      itemsInCart,
      account.data.balances as BalanceLineAsset<AssetType.credit12>[],
    );
  }, [cart, account.data]);

  const total = React.useMemo(() => {
    if (!ticketCategories.data) return 0;
    return (
      Array.from(cart.entries()).reduce((acc, [categoryId, item]) => {
        const category = categories.get(categoryId);
        const { pricePerUnit } = category ?? { pricePerUnit: 0 };
        return acc + item.total * Number(pricePerUnit);
      }, 0) + Number(totalFees)
    );
  }, [cart, ticketCategories.data, categories, totalFees]);

  const totalTickets = React.useMemo(() => {
    return Array.from(cart.values()).reduce((acc, item) => {
      return acc + item.total;
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
              {ticketCategories.isLoading &&
                Array.from({ length: 2 }).map((_, i) => (
                  <TicketCategorySkeleton key={i} />
                ))}
              {ticketCategories.data?.map((category) => (
                <TicketCategoryCard
                  processStep={processStep}
                  key={category.id}
                  category={category}
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              ))}
              <Card className="rounded-lg bg-background p-4 shadow-sm">
                <h3 className="text-lg font-bold">
                  Buy on secondary market
                  <p className="text-xs font-light">
                    Available tickets: {secondaryItems.data ?? 0}
                  </p>
                </h3>
                {/* <p className="text-muted-foreground">Desc...</p> */}
                <div className="flex w-full items-center justify-end">
                  <Link href={`/events/${id}/secondary-market`}>
                    <Button className="group w-48 border-[1px] border-black bg-black text-sm text-white hover:bg-white hover:text-black">
                      Go to marketplace
                      <Icons.expandingArrow className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
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
                  .filter(([, { total }]) => total > 0)
                  .map(([categoryId, qty]) => {
                    return (
                      <div
                        key={categoryId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          ({qty.total}) {categories.get(categoryId)?.label}
                        </div>
                        <div>
                          {Number(categories.get(categoryId)?.pricePerUnit) ??
                            0}{" "}
                          XLM
                        </div>
                      </div>
                    );
                  })}
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
                <div className="flex items-center justify-between text-muted-foreground">
                  <div>Stellar Transaction Fees</div>
                  <div>{totalFees} XLM</div>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <div>Service Fees & Commissions</div>
                  <div>
                    {SERVICE_FEE + totalTickets * FIXED_UNITARY_COMMISSION} XLM
                  </div>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <div>Total</div>
                  <div className="flex flex-col items-end justify-end">
                    <div>
                      {(
                        total +
                        SERVICE_FEE +
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
                        total +
                          SERVICE_FEE +
                          totalTickets * FIXED_UNITARY_COMMISSION,
                      ).toFixed(2)}{" "}
                      USD
                    </div>
                  </div>
                </div>
                {loading && (
                  <div className="py-4">
                    <TransactionSteps
                      assets={Array.from(cart.keys())}
                      processStep={processStep}
                    />
                  </div>
                )}
                {hasFreighter ? (
                  <Button
                    disabled={cart.size === 0 || loading}
                    onClick={() => {
                      if (processStep === 4) {
                        void router.push(`/events/${id}`);
                      } else {
                        void handlePurchase();
                      }
                    }}
                    size="lg"
                    className="w-full bg-black text-white"
                  >
                    {loading ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : cart.size <= 0 ? (
                      "Select tickets to buy"
                    ) : processStep === 4 ? (
                      "Go to Wallet"
                    ) : (
                      "Buy Tickets"
                    )}
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
