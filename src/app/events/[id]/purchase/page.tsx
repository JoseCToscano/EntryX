"use client";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useParams } from "next/navigation";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { api } from "~/trpc/react";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import { Fees } from "~/constants";
import {
  TicketCategoryCard,
  TicketCategorySkeleton,
} from "~/app/events/components/ticket-category-card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { useWallet } from "~/hooks/useWallet";
import { ClientTRPCErrorHandler, fromXLMToUSD, plurify } from "~/lib/utils";
import { type Asset as DBAsset } from "@prisma/client";

export default function Purchase() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  /* State variables */
  const { publicKey, signXDR, hasFreighter, trustline, isFreighterAllowed } =
    useWallet();
  const [processStep, setProcessStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assetToBuy, setAssetToBuy] = useState<string | null>(null);
  const [unitsToBuy, setUnitsToBuy] = useState<number>(0);

  /* tRPC api calls */
  const event = api.event.get.useQuery({ id: id as string }, { enabled: !!id });
  const ticketCategories = api.asset.list.useQuery(
    { eventId: id as string },
    { enabled: !!id },
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

  const contractPurchase = api.soroban.contractPurchase.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const soroban = api.soroban.submitContractCall.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      toast.success("Transaction completed");
    },
  });

  const addToCart = (asset: DBAsset) => {
    if (assetToBuy !== asset.id) {
      setAssetToBuy(asset.id);
      setUnitsToBuy(1);
    }
  };

  const handleContractPurchase = async () => {
    setLoading(true);
    try {
      if (!publicKey) {
        return toast.error("Please connect your wallet");
      }
      if (!assetToBuy || !unitsToBuy) {
        return toast.error("Please select a ticket to purchase");
      }
      setProcessStep(2);
      const xdr = await contractPurchase.mutateAsync({
        userPublicKey: publicKey,
        quantity: unitsToBuy,
        assetId: assetToBuy,
      });
      const signedTransaction = await signXDR(xdr);
      setProcessStep(3);
      await soroban.mutateAsync({
        xdr: signedTransaction,
      });
      if (typeof id === "string") {
        router.push(`/events/${id}`);
      }
      setProcessStep(4);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      void ctx.asset.availability.invalidate();
    } catch (e) {
      console.error(e);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessStep(1);
      setUnitsToBuy(0);
      setAssetToBuy(null);
      setLoading(false);
    }
  };

  const secondaryItems = api.event.marketplaceCount.useQuery(
    { id: id as string },
    { enabled: !!id },
  );

  const addToTrustline = api.stellarAccountRouter.addTrustline.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const categories = React.useMemo(() => {
    return new Map(
      ticketCategories.data?.map((category) => [category.id, category]) ?? [],
    );
  }, [ticketCategories.data]);

  const total = React.useMemo(() => {
    const price = categories.get(assetToBuy ?? "")?.pricePerUnit ?? 0;
    return Number(price) * unitsToBuy;
  }, [categories, unitsToBuy, assetToBuy]);

  const increaseSellAmount = () => {
    setUnitsToBuy((p) => p + 1);
  };

  const reduceSellAmount = () => {
    if (unitsToBuy > 0) {
      setUnitsToBuy((p) => p - 1);
    }
  };

  const addAssetToTrustline = async () => {
    if (!assetToBuy) {
      return toast("Please select a ticket to buy");
    }
    if (!publicKey || !hasFreighter || !isFreighterAllowed) {
      return toast("Please connect your wallet");
    }
    setLoading(true);
    try {
      let xdr = await addToTrustline.mutateAsync({
        publicKey,
        assetId: assetToBuy,
      });
      xdr = await signXDR(xdr);
      await submitTransaction.mutateAsync({ xdr });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (typeof id !== "string") return null;

  return (
    <div className="w-full p-4">
      <MenuBreadcumb id={id} actionSection={"Buy tickets"} />
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 pt-0 md:grid-cols-[1fr_400px] md:gap-16 md:px-6 lg:px-8">
        <div className="h-[100vh] space-y-8 pt-10">
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
                  key={category.id}
                  category={category}
                  addToCart={addToCart}
                  selected={category.id === assetToBuy}
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
                  <Link href={`/secondary-market?eventId=${id}`}>
                    <Button className="group w-48 border-[1px] border-black bg-black pl-0 text-sm text-white hover:bg-white hover:text-black">
                      Go to marketplace
                      <Icons.expandingArrow className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
        <div className="flex-grow space-y-8">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Your purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {assetToBuy && (
                    <div>
                      ({unitsToBuy}) {categories.get(assetToBuy)?.label}
                    </div>
                  )}
                  <div>
                    {assetToBuy &&
                      Number(categories.get(assetToBuy)?.pricePerUnit)}{" "}
                    {assetToBuy && "XLM"}
                  </div>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <div>Subtotal</div>
                  <div>
                    {unitsToBuy
                      ? total.toLocaleString("en-US", {
                          minimumFractionDigits: 5,
                          maximumFractionDigits: 5,
                        })
                      : 0}{" "}
                    XLM
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!assetToBuy || soroban.isPending || loading}
                    onClick={reduceSellAmount}
                    variant="outline"
                    size="sm"
                    className="bg-black text-white hover:bg-white hover:text-black"
                  >
                    -
                  </Button>
                  <span>
                    {unitsToBuy} {plurify("ticket", unitsToBuy)}
                  </span>
                  <Button
                    disabled={!assetToBuy || soroban.isPending || loading}
                    onClick={increaseSellAmount}
                    variant="outline"
                    size="sm"
                    className="bg-black text-white hover:bg-white hover:text-black"
                  >
                    +
                  </Button>
                </div>

                <Separator />
                <div className="flex items-center justify-between text-muted-foreground">
                  <div>Service Fee</div>
                  <div>{Fees.SERVICE_FEE} XLM</div>
                </div>

                <div className="flex items-center justify-between font-bold">
                  <div>Total</div>
                  <div className="flex flex-col items-end justify-end">
                    <div>
                      {(total + Fees.SERVICE_FEE).toLocaleString("en-US", {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5,
                      })}{" "}
                      XLM
                    </div>
                    <div className="text-xs font-light opacity-50">
                      approx. $
                      {fromXLMToUSD(total + Fees.SERVICE_FEE).toFixed(2)} USD
                    </div>
                  </div>
                </div>
                {loading && (
                  <div className="py-4">
                    <TransactionSteps
                      assets={[assetToBuy ?? ""]}
                      processStep={processStep}
                    />
                  </div>
                )}
                {hasFreighter ? (
                  assetToBuy &&
                  !Object.hasOwn(
                    trustline,
                    categories.get(assetToBuy)?.code ?? "",
                  ) ? (
                    <Button
                      disabled={!assetToBuy || loading}
                      onClick={addAssetToTrustline}
                      className="h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                    >
                      {loading ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        "Add to Trustline"
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled={
                        !assetToBuy ||
                        !Object.hasOwn(
                          trustline,
                          categories.get(assetToBuy)?.code ?? "",
                        ) ||
                        !unitsToBuy ||
                        loading
                      }
                      onClick={() => {
                        if (processStep === 4) {
                          void router.push(`/events/${id}`);
                        } else {
                          void handleContractPurchase();
                        }
                      }}
                      size="lg"
                      className="h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                    >
                      {loading ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : unitsToBuy <= 0 ? (
                        "Select tickets to buy"
                      ) : processStep === 4 ? (
                        "Go to Wallet"
                      ) : (
                        "Buy Tickets"
                      )}
                    </Button>
                  )
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
