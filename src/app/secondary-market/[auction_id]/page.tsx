"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ClientTRPCErrorHandler, shortStellarAddress } from "~/lib/utils";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Icons } from "~/components/icons";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { MenuBreadcumb } from "~/app/events/components/menu-breadcumb";
import { useWallet } from "~/hooks/useWallet";
import Loading from "~/app/account/components/loading";
import { Input } from "~/components/ui/input";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import ConnectYourWallet from "~/app/_components/connect-your-wallet";

const AuctionCard: React.FC = () => {
  const { publicKey, signXDR } = useWallet();
  const params = useParams();
  const { auction_id } = params;
  const ctx = api.useContext();

  const [loading, setLoading] = React.useState(false);
  const [isSigning, setIsSigning] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const auction = api.marketplace.getAuction.useQuery(
    { id: auction_id as string },
    {
      enabled: !!auction_id,
      refetchInterval: 10000, // Get most recent state every 10 seconds
    },
  );

  // void api.post.getLatest.prefetch();
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      bid: undefined,
    },
  });

  const closeAuction = api.soroban.closeAuction.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const bid = api.soroban.bid.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const persistBid = api.soroban.updateAuction.useMutation({
    onSuccess: () => {
      void ctx.marketplace.getAuction.invalidate({ id: auction_id as string });
    },
  });

  const viewAuction = api.soroban.viewAuction.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const soroban = api.soroban.submitContractCall.useMutation({
    onSuccess: () => {
      reset();
      toast.success("Transaction sent to blockchain successfully");
      setLoading(false);
    },
    onError: ClientTRPCErrorHandler,
  });

  if (!auction_id) return null;

  const handleViewAuction = async () => {
    if (!publicKey) {
      return toast.error("Please connect your wallet");
    }
    const xdr = await viewAuction.mutateAsync({
      ownerPublicKey: publicKey,
      auctionId: auction_id as string,
    });
    if (xdr) {
      const signedXDR = await signXDR(xdr);
      const res = await soroban.mutateAsync({ xdr: signedXDR });
      console.log("res:", res);
    } else {
      toast.error("Error on view auction");
    }
    console.log(xdr);
  };

  const handleBid: SubmitHandler<FieldValues> = async (data) => {
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet");
        return;
      }
      if (!data.bid) {
        return toast.error("Please enter a bid amount");
      }
      if (Number(data.bid) <= Number(auction.data?.highestBid ?? "0")) {
        return toast.error("Please bid higher than the current highest bid");
      }
      setIsSigning(true);
      const xdr = await bid.mutateAsync({
        auctionId: auction_id as string,
        bid: Number(data.bid),
        bidderKey: publicKey,
      });
      const signedXDR = await signXDR(xdr);
      const res = await soroban.mutateAsync({ xdr: signedXDR });
      // TODO: This would better be handled as a multi-step transaction on database
      persistBid.mutate({
        auctionId: auction_id as string,
        highestBid: Number(data.bid),
        bidder: publicKey,
      });
      console.log("res:", res);
    } catch (error) {
      toast.error("Failed to place bid");
    } finally {
      setIsSigning(false);
    }
  };

  const handleCloseAuction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (!publicKey) {
        toast.error("Please connect your wallet");
        return;
      }
      if (!auction_id) {
        toast.error("Invalid auction");
        return;
      }
      setIsClosing(true);

      const xdr = await closeAuction.mutateAsync({
        auctionId: auction_id as string,
        publicKey,
      });
      const signedXDR = await signXDR(xdr);
      await soroban.mutateAsync({ xdr: signedXDR });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="p-4">
      <MenuBreadcumb
        id={auction.data?.asset?.eventId}
        actionSection="Auction"
      />
      {loading && <Loading />}
      {!publicKey && <ConnectYourWallet />}
      <main className="flex-1">
        <section
          className="bg-cover py-12 md:py-16 lg:py-20"
          style={{
            backgroundImage: `url(${auction.data?.asset.event.coverUrl ?? ""})`,
          }}
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12">
              <div>
                <h2 className="w-fit rounded-md bg-gray-200 bg-opacity-50 px-2 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {auction.isLoading ? (
                    <Icons.spinner className="animate-spin" />
                  ) : (
                    auction.data?.asset.event.name
                  )}
                </h2>
                <p className="w-fit rounded-md bg-gray-200 bg-opacity-50 px-2 text-lg text-black md:text-xl">
                  {dayjs(auction.data?.asset.event.date).format("MMMM D, YYYY")}
                  | {auction.data?.asset.event.location}
                </p>
              </div>
              {auction.data && (
                <div className="flex flex-col items-start gap-4">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>{auction.data.asset.label}</CardTitle>
                      <CardDescription>
                        Includes access to VIP lounge and exclusive experiences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex gap-1 text-2xl font-bold">
                            {auction.data.highestBid
                              ? Number(auction.data.highestBid)
                              : 0}{" "}
                            XLM
                            <Icons.StellarIcon />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Bid
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {dayjs(auction.data.endsAt).diff(dayjs(), "days")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Days Remaining
                          </div>
                        </div>
                      </div>

                      {auction.data.highestBidder && (
                        <div>
                          <div className="flex gap-1 text-2xl font-bold">
                            {shortStellarAddress(
                              auction.data?.highestBidder ?? "",
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Last Bid
                          </div>
                        </div>
                      )}
                      <form className="mt-4 flex gap-2">
                        <Input
                          id="bid"
                          register={register}
                          type="number"
                          placeholder="Enter your bid"
                          className="h-8 flex-1"
                          disabled={isSigning}
                        />
                        <Button
                          disabled={isSigning}
                          type="button"
                          variant="ghost"
                          className="h-8 border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black"
                          onClick={() => {
                            void handleSubmit(handleBid)();
                          }}
                        >
                          {isSigning ? (
                            <Icons.spinner className="animate-spin" />
                          ) : (
                            "Place Bid"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  {publicKey && publicKey === auction.data.owner && (
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle>Manage Auction</CardTitle>
                        <CardDescription>
                          You may close the auction at any time. Otherwise, it
                          will be closed at{" "}
                          {dayjs(auction.data?.endsAt).format("h:mm A")} and the
                          highest bidder will receive the ticket
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link
                          className="text-blue-500 underline"
                          target="_blank"
                          href={`https://stellar.expert/explorer/testnet/contract/${auction.data?.contractAddress}/storage`}
                        >
                          View full auction details
                        </Link>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="mt-4 h-8 w-full border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black"
                            onClick={handleViewAuction}
                          >
                            View Auction
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isClosing}
                            className="mt-4 h-8 w-full border-[1px] border-black bg-black px-2 text-white hover:bg-white hover:text-black"
                            onClick={handleCloseAuction}
                          >
                            {isClosing ? (
                              <Icons.spinner className="animate-spin" />
                            ) : (
                              "Close Auction"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
              <div>
                <div className="prose mt-4 max-w-[800px] text-muted-foreground">
                  <p>{auction.data?.asset.event.description}</p>
                </div>
              </div>
              <div>
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
                            {auction.data
                              ? dayjs(auction.data?.asset.event.date).format(
                                  "MMMM D, YYYY",
                                )
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Location</div>
                          <div className="text-muted-foreground">
                            {auction.data?.asset.event.location}
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
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

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

export default AuctionCard;
