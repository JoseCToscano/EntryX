"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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

const TicketCard: React.FC = () => {
  const { publicKey } = useFreighter();
  const params = useParams();
  const { id: eventId, asset_id } = params;
  const ctx = api.useContext();
  const generateQrCode = (data: string) => {
    const size = "100x100";
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

  const sell = api.stellarOffer._sell.useMutation({
    onError: (e) => toast.error("Error on sell"),
  });

  const ledger = api.stellarAccountRouter.submitTransaction.useMutation({
    onSuccess: () =>
      toast.success("Transaction sent to blockchain successfully"),
    onError: (e) => toast.error("Error on ledger"),
  });

  const handleSell = async () => {
    const isWalletConnected = await isConnected();
    if (!isWalletConnected) {
      toast.error("Please connect your wallet");
    }
    const userPublicKey = await getPublicKey();
    if (!userPublicKey) toast.error("Error getting public key");
    const xdr = await sell.mutateAsync({
      assetId: asset_id as string,
      unitsToSell: 1,
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
  };

  if (!asset_id || !eventId) return null;

  if (!ticket.data) return null;

  return (
    <div className="p-4">
      <MenuBreadcumb id={eventId} actionSection="My Tickets" />
      <div className="flex min-h-screen flex-col items-center justify-start bg-background pt-10">
        <div className="mt-10 w-full max-w-md rounded-xl bg-gradient-to-br from-white to-primary-foreground p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="rounded-xl bg-muted p-6">
              <img
                src={generateQrCode(asset_id as string)}
                alt="QR Code"
                width={160}
                height={160}
                className="h-40 w-40"
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
              onClick={handleSell}
              variant="outline"
              size="sm"
              className="border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
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
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
