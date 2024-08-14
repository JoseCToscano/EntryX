"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ClientTRPCErrorHandler, fromXLMToUSD, plurify } from "~/lib/utils";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Icons } from "~/components/icons";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { RESELLER_COMMISSION } from "~/constants";
import { Separator } from "~/components/ui/separator";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import Image from "next/image";
import { useWallet } from "~/hooks/useWallet";
import Loading from "~/app/account/components/loading";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const TicketCard: React.FC = () => {
  const { publicKey, signXDR } = useWallet();
  const params = useParams();
  const { id: eventId, asset_id } = params;
  const ctx = api.useContext();

  const [showTicketManagement, setShowTicketManagement] = React.useState(false);
  const [sellAmount, setSellAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const generateQrCode = (data: string, sizeString = "200x200") => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${sizeString}&data=${encodeURIComponent(data)}`;
  };

  const event = api.event.get.useQuery(
    { id: eventId as string },
    { enabled: !!eventId },
  );

  const asset = api.asset.getAsset.useQuery(
    { id: asset_id as string },
    { enabled: !!asset_id },
  );

  const ticket = api.event.ticket.useQuery(
    {
      eventId: eventId as string,
      assetId: asset_id as string,
      userPublicKey: publicKey!,
    },
    { enabled: !!eventId && !!asset_id && !!publicKey },
  );

  const soroban = api.soroban.submitContractCall.useMutation({
    onSuccess: () => {
      setSellAmount(0);
      setShowTicketManagement(false);
      toast.success("Blockchain updated");
      setLoading(false);
    },
    onError: ClientTRPCErrorHandler,
  });

  const startAuction = api.soroban.startAuction.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const handleStartAuction = async () => {
    try {
      if (sellAmount <= 0) return;
      setLoading(true);
      if (!publicKey) {
        return toast.error("Please connect your wallet");
      }
      const xdr = await startAuction.mutateAsync({
        ownerPublicKey: publicKey,
        assetId: asset_id as string,
        quantity: sellAmount,
        startPrice: Number(asset.data?.pricePerUnit) * sellAmount,
      });
      const signedXDR = await signXDR(xdr);
      await soroban.mutateAsync({ xdr: signedXDR });
      void ctx.event.myTickets.invalidate({ eventId: eventId as string });
      void ctx.event.ticket.invalidate({
        eventId: eventId as string,
        assetId: asset_id as string,
      });
    } catch (e) {
      toast.error("Auction was not created");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const increaseSellAmount = () => {
    const availableTickets =
      Number(ticket.data?.balance ?? "0") -
      (ticket.data?.sellingLiabilities
        ? Number(ticket.data?.sellingLiabilities)
        : 0);
    if (sellAmount < availableTickets) {
      setSellAmount((p) => p + 1);
    }
  };

  const reduceSellAmount = () => {
    if (sellAmount > 0) {
      setSellAmount((p) => p - 1);
    }
  };

  useEffect(() => {
    console.log({
      eventId,
      asset_id,
      ticket: ticket.data,
    });
  }, [eventId, asset_id, ticket.data]);

  if (!asset_id || !eventId) return null;

  return (
    <div className="p-4">
      <MenuBreadcumb id={eventId as string} actionSection="My Tickets" />
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-6 lg:px-8">
        {ticket.isLoading && <Loading />}
        {ticket.data && (
          <div className="flex min-h-screen w-full flex-col items-center justify-start space-y-8 bg-background">
            <div className="mt-10 w-full max-w-md rounded-xl border-2 border-primary-foreground bg-gradient-to-br from-white to-primary-foreground p-8 shadow-lg">
              <div className="flex flex-col items-center justify-center gap-6">
                <Badge className="border-0 bg-gradient-to-br from-black to-gray-400">
                  {ticket.data?.asset.code}
                </Badge>
                <div className="rounded-xl bg-muted p-6">
                  <Image
                    src={generateQrCode(asset_id as string)}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="h-44 w-44"
                    style={{ aspectRatio: "160/160", objectFit: "cover" }}
                  />
                </div>
                <div className="grid gap-2 text-center">
                  <h2 className="text-2xl font-bold">{asset.data?.label}</h2>
                  <div className="text-sm">
                    {parseInt(ticket.data?.balance)}{" "}
                    {plurify("ticket", parseInt(ticket.data?.balance))}
                  </div>{" "}
                  {Number(ticket.data?.sellingLiabilities) > 0 && (
                    <div className="rounded-md bg-amber-600 px-2 text-sm text-white">
                      {parseInt(ticket.data?.sellingLiabilities)}{" "}
                      {plurify(
                        "ticket",
                        parseInt(ticket.data?.sellingLiabilities),
                      )}{" "}
                      on sell
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    <p className="text-sm">
                      {dayjs(event.data?.date).format("MMM D, YYYY")}
                    </p>
                    <p className="text-sm">7:00 PM - 11:00 PM</p>
                    <p className="text-sm"> {event.data?.venue}</p>
                    <p className="text-xs"> {event.data?.location}</p>
                  </div>
                </div>
                <Button
                  disabled={soroban.isPending || loading}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTicketManagement(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="group border-[1px] border-black bg-black pl-4 pr-8 text-white hover:bg-white hover:text-black"
                >
                  {soroban.isPending || loading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <p>
                      Manage{" "}
                      {plurify(
                        "Ticket",
                        parseInt(ticket.data?.sellingLiabilities ?? "0"),
                      )}
                    </p>
                  )}
                  <Icons.expandingArrow className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {ticket.data && showTicketManagement && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Place tickets for sale</CardTitle>
                <CardDescription>
                  Start an auction on the secondary market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      ({sellAmount}) {asset.data?.label}
                    </div>
                    <div className="flex-col items-center justify-between text-right">
                      <div>{Number(asset.data?.pricePerUnit ?? "0")} XLM</div>
                      <div className="text-xs font-light opacity-50">
                        Issuer&apos;s price
                      </div>
                    </div>
                  </div>
                  {sellAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild className="">
                              <span className="flex items-center justify-start">
                                Reseller Commission
                                <Icons.moreInfo className="ml-1 h-3 w-3 bg-muted" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>
                                This amount will be taken off from the
                                transaction only if completed successfully
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="flex flex-col items-end justify-end">
                        <div>{RESELLER_COMMISSION} XLM</div>
                        <div className="text-xs font-light opacity-50">
                          approx. $
                          {fromXLMToUSD(RESELLER_COMMISSION).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={soroban.isPending || loading}
                      onClick={reduceSellAmount}
                      variant="outline"
                      size="sm"
                      className="bg-black text-white hover:bg-white hover:text-black"
                    >
                      -
                    </Button>
                    <span>
                      Auction for {sellAmount} {plurify("Ticket", sellAmount)}
                    </span>
                    <Button
                      disabled={soroban.isPending || loading}
                      onClick={increaseSellAmount}
                      variant="outline"
                      size="sm"
                      className="bg-black text-white hover:bg-white hover:text-black"
                    >
                      +
                    </Button>
                  </div>

                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <div>Auction start price</div>

                    <div className="flex flex-col items-end justify-end">
                      <div>
                        {(
                          Number(asset.data?.pricePerUnit ?? 0) * sellAmount
                        ).toFixed(2)}{" "}
                        XLM
                      </div>
                      <div className="text-xs font-light opacity-50">
                        approx. $
                        {fromXLMToUSD(
                          Number(asset.data?.pricePerUnit ?? 0) * sellAmount,
                        ).toFixed(2)}{" "}
                        USD
                      </div>
                    </div>
                  </div>
                  <div className="py-4">
                    <TransactionSteps assets={[]} offerType="sell" />
                  </div>
                  <Button
                    disabled={loading || sellAmount <= 0}
                    onClick={handleStartAuction}
                    size="lg"
                    className="w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                  >
                    {loading ? (
                      <Icons.spinner className="animate-spin" />
                    ) : (
                      "Start auction"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTicketManagement(false);
                      setSellAmount(0);
                      setLoading(false);
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
