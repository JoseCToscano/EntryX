"use client";
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { plurify } from "~/lib/utils";
import Link from "next/link";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import {
  getPublicKey,
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";
import { Icons } from "~/components/icons";
import { useParams } from "next/navigation";
import useFreighter from "~/hooks/useFreighter";
import dayjs from "dayjs";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { FIXED_UNITARY_COMMISSION, SERVICE_FEE } from "~/constants";
import { Separator } from "~/components/ui/separator";
import { TransactionSteps } from "~/app/events/components/transaction-steps";
import Image from "next/image";

function fromXLMToUSD(xlm: number) {
  return xlm * 0.09;
}
const TicketCard: React.FC = () => {
  const { publicKey } = useFreighter();
  const params = useParams();
  const { id: eventId, asset_id } = params;
  const ctx = api.useContext();

  const [showTicketManagement, setShowTicketManagement] = React.useState(false);
  const [sellAmount, setSellAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const generateQrCode = (data: string) => {
    const size = "200x200";
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
    return url;
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

  const sell = api.stellarOffer.sell.useMutation({
    onError: () => toast.error("Error on sell"),
  });

  const ledger = api.stellarAccountRouter.submitTransaction.useMutation({
    onSuccess: () => {
      setSellAmount(0);
      setShowTicketManagement(false);
      toast.success("Transaction sent to blockchain successfully");
      setLoading(false);
    },
    onError: (e) => toast.error("Error on ledger"),
  });

  const handleSell = async () => {
    try {
      if (sellAmount <= 0) return;
      setLoading(true);
      const isWalletConnected = await isConnected();
      if (!isWalletConnected) {
        toast.error("Please connect your wallet");
      }
      const userPublicKey = await getPublicKey();
      if (!userPublicKey) toast.error("Error getting public key");
      const xdr = await sell.mutateAsync({
        assetId: asset_id as string,
        unitsToSell: sellAmount,
        userPublicKey,
      });
      const signedXDR = await signTransaction(xdr, {
        network: "TESTNET",
        accountToSign: userPublicKey,
      });
      const result = await ledger.mutateAsync({ xdr: signedXDR });
      void ctx.event.myTickets.invalidate({ eventId: eventId as string });
      void ctx.event.ticket.invalidate({
        eventId: eventId as string,
        assetId: asset_id as string,
      });
      console.log(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const total = useMemo(() => {
    return sellAmount * Number(asset.data?.pricePerUnit);
  }, [sellAmount, asset.data?.pricePerUnit]);

  const increaseSellAmount = () => {
    const availableTickets =
      Number(ticket.data?.balance ?? "0") - ticket.data?.sellingLiabilities;
    if (sellAmount < availableTickets) {
      setSellAmount((p) => p + 1);
    }
  };

  const reduceSellAmount = () => {
    if (sellAmount > 0) {
      setSellAmount((p) => p - 1);
    }
  };

  if (!asset_id || !eventId) return null;

  if (!ticket.data) return null;

  return (
    <div className="p-4">
      <MenuBreadcumb id={eventId} actionSection="My Tickets" />
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[1fr_400px] md:gap-16 md:px-6 lg:px-8">
        {/* <div className="space-y-8"> */}
        <div className="flex min-h-screen w-full flex-col items-center justify-start space-y-8 bg-background">
          <div className="mt-10 w-full max-w-md rounded-xl border-2 border-primary-foreground bg-gradient-to-br from-white to-primary-foreground p-8 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-6">
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
                  {parseInt(ticket.data?.balance as string)}{" "}
                  {plurify("ticket", parseInt(ticket.data?.balance as string))}
                </div>{" "}
                {ticket.data?.sellingLiabilities > 0 && (
                  <div className="rounded-md bg-amber-600 px-2 text-sm text-white">
                    {parseInt(ticket.data?.sellingLiabilities as string)}{" "}
                    {plurify(
                      "ticket",
                      parseInt(ticket.data?.sellingLiabilities as string),
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
                onClick={() => setShowTicketManagement(true)}
                variant="outline"
                size="sm"
                className="group border-[1px] border-black bg-black pl-4 pr-8 text-white hover:bg-white hover:text-black"
              >
                {sell.isPending || ledger.isPending ? (
                  "..."
                ) : (
                  <p>
                    Manage{" "}
                    {plurify(
                      "Ticket",
                      parseInt(ticket.data?.sellingLiabilities as string),
                    )}
                  </p>
                )}
                <Icons.expandingArrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {showTicketManagement && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Place tickets for sale</CardTitle>
                <CardDescription>Sell on the secondary market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      ({sellAmount}) {asset.data?.label}
                    </div>
                    <div>{Number(asset.data?.pricePerUnit ?? "0")} XLM</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>Unitary commission</div>
                    <div>{FIXED_UNITARY_COMMISSION} XLM</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Service Fee</div>
                    <div>{SERVICE_FEE} XLM</div>
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
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={reduceSellAmount}
                      variant="outline"
                      size="sm"
                    >
                      -
                    </Button>
                    <span>
                      Selling {sellAmount} {plurify("Ticket", sellAmount)}
                    </span>
                    <Button
                      onClick={increaseSellAmount}
                      variant="outline"
                      size="sm"
                    >
                      +
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <div>Total</div>
                    <div className="flex flex-col items-end justify-end">
                      <div>
                        {(
                          total -
                          (SERVICE_FEE * sellAmount > 0 ? 1 : 0) -
                          sellAmount * FIXED_UNITARY_COMMISSION
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 5,
                          maximumFractionDigits: 5,
                        })}{" "}
                        XLM
                      </div>
                      <div className="text-xs font-light opacity-50">
                        approx. $
                        {fromXLMToUSD(
                          total -
                            (SERVICE_FEE * sellAmount > 0 ? 1 : 0) -
                            sellAmount * FIXED_UNITARY_COMMISSION,
                        ).toFixed(2)}{" "}
                        USD
                      </div>
                    </div>
                  </div>

                  <div className="py-4">
                    <TransactionSteps assets={[]} />
                  </div>
                  <Button
                    disabled={loading || sellAmount <= 0}
                    onClick={handleSell}
                    size="lg"
                    className="w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                  >
                    {loading ? (
                      <Icons.spinner className="animate-spin" />
                    ) : (
                      "Sell"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTicketManagement(false);
                      setSellAmount(0);
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
