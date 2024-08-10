"use client";
import React from "react";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { TableRow, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn, ClientTRPCErrorHandler } from "~/lib/utils";
import { type Asset } from "@prisma/client";
import { Icons } from "~/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useWallet } from "~/hooks/useWallet";

export const TicketTypeToAssetForm: React.FC<{
  eventId: string;
  asset?: Asset;
  onSubmitted?: () => void;
}> = ({ eventId, asset, onSubmitted }) => {
  const { isFreighterAllowed, isLoading, hasFreighter, publicKey, signXDR } =
    useWallet();
  // React state
  const [isLocked, setIsLocked] = React.useState(!!asset?.address);
  const [loadingSignature, setLoadingSignature] = React.useState(false);
  const [loadingIPO, setLoadingIPO] = React.useState(false);
  const ctx = api.useContext();

  const createTicketCategory = api.event.addTicketCategory.useMutation({
    onSuccess: () => {
      if (onSubmitted) onSubmitted();
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Category saved successfully");
    },
    onError: ClientTRPCErrorHandler,
  });

  const updateTicketCategory = api.event.updateTicketCategory.useMutation({
    onSuccess: () => {
      if (onSubmitted) onSubmitted();
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Category updated successfully");
    },
    onError: ClientTRPCErrorHandler,
  });

  // void api.post.getLatest.prefetch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      label: asset?.label ?? "",
      totalUnits: asset?.totalUnits,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!hasFreighter || !isFreighterAllowed) {
      return toast.error("Please connect your Freighter wallet");
    }
    if (!publicKey) {
      return toast.error(
        "Invalid or missing public key. Make sure your wallet is connected",
      );
    }

    if (asset?.id) {
      updateTicketCategory.mutate({
        id: asset.id,
        label: data.label as string,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
      });
    } else {
      createTicketCategory.mutate({
        label: data.label as string,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
        eventId,
        size: "medium",
        distributorPublicKey: publicKey,
      });
    }
    reset();
  };

  /**
   * Transfer new Assets into ledger. From issuer account (saved in server) into
   * the distributor account (user's account)
   */
  const addToLedger = api.asset.addToLedger.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  /**
   * Sends signed transaction to the server to tokenize the asset
   */
  const tokenize = api.asset.tokenize.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      setIsLocked(true);
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Tokenized ticket saved successfully to the blockchain");
    },
  });

  /**
   * Generic router to submit signed transactions to the Stellar network
   */
  const submitXDR = api.stellarAccountRouter.submitTransaction.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => {
      setIsLocked(true);
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Tokenized ticket saved successfully to the blockchain");
    },
  });

  /**
   * Publishes Initial Public Offering (IPO) for the asset
   * to be sold on the Stellar network
   */
  const publishIPO = api.stellarOffer.sell.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  /**
   * Signs the transaction with the user's private key
   */
  async function saveInLedger() {
    try {
      if (!asset?.id) return;
      if (!hasFreighter || !isFreighterAllowed) {
        return toast.error("Please connect your Freighter wallet");
      }
      if (!publicKey) {
        return toast.error(
          "Invalid or missing public key. Make sure your wallet is connected",
        );
      }
      setLoadingSignature(true);

      // Get un-signed XDR from the server
      const xdr = await addToLedger.mutateAsync({
        assetId: asset.id,
        distributorKey: publicKey,
      });
      const signedXDR = await signXDR(xdr);
      // Submit signed XDR to the server
      await tokenize.mutateAsync({
        xdr: signedXDR,
        id: asset.id,
      });
    } catch (e) {
      console.error(e);
      toast.error("Error saving ticket to the blockchain");
    } finally {
      setLoadingSignature(false);
    }
  }

  /**
   * Publishes Initial Public Offering (IPO) for the asset
   * @constructor
   */
  async function IPO() {
    try {
      if (!asset) return;
      if (!hasFreighter || !isFreighterAllowed) {
        return toast.error("Please connect your Freighter wallet");
      }
      if (!publicKey) {
        return toast.error(
          "Invalid or missing public key. Make sure your wallet is connected",
        );
      }
      setLoadingIPO(true);

      const xdr = await publishIPO.mutateAsync({
        assetId: asset.id,
        userPublicKey: publicKey,
        unitsToSell: asset.totalUnits,
      });
      const signedXDR = await signXDR(xdr);
      const result = await submitXDR.mutateAsync({
        xdr: signedXDR,
      });
      if (result?.successful) {
        toast.success(
          "Ticket offering published successfully to the blockchain",
        );
      } else {
        toast.error("Error publishing ticket offering to the blockchain");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error publishing ticket offering to the blockchain");
    } finally {
      setLoadingIPO(false);
    }
  }

  return (
    <TableRow>
      {/*<form /!* onSubmit={handleSubmit(onSubmit)} *!/>*/}
      <TableCell className="flex flex-row items-center font-semibold">
        {isLocked && (
          <Badge className="mr-1 border-0 bg-gradient-to-br from-black to-gray-400">
            <Icons.chain className="my-1 h-4 w-4 fill-gray-200 text-gray-200" />
          </Badge>
        )}
        <Label htmlFor="label" className="sr-only">
          Code
        </Label>
        <Input
          id="label"
          register={register}
          disabled={isLocked}
          errors={errors}
          required
          type="text"
          placeholder="General Admission"
          className={cn(isLocked && "w-[130px] border-0 px-0 text-black")}
        />
      </TableCell>
      <TableCell>
        <Label htmlFor="pricePerUnit" className="sr-only">
          Price
        </Label>

        <Input
          id="pricePerUnit"
          register={register}
          disabled={isLocked}
          errors={errors}
          required
          type="number"
          defaultValue="99.99"
        />
      </TableCell>
      <TableCell>
        <Label htmlFor="totalUnits" className="sr-only">
          Quantity
        </Label>
        <Input
          id="totalUnits"
          register={register}
          disabled={isLocked}
          errors={errors}
          required
          type="number"
          defaultValue="500"
        />
      </TableCell>
      <TableCell>
        <div className="flex w-full items-center justify-center gap-1 rounded-l-md py-1 text-center">
          <p className="text-sm font-light">$0.99</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex w-full items-center justify-center gap-1 rounded-l-md py-1 text-center">
          <p className="text-sm font-light">1%</p>
        </div>
      </TableCell>
      <TableCell>
        {!isLocked && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="">
                <Button
                  disabled={isLocked || isLoading}
                  onClick={() => {
                    if (!isLocked) void handleSubmit(onSubmit)();
                  }}
                  variant="outline"
                  size="icon"
                >
                  <Icons.save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Save changes: Ticket type can still be edited before locking.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {/*{!isLocked && (*/}
        {/*  <TooltipProvider>*/}
        {/*    <Tooltip>*/}
        {/*      <TooltipTrigger asChild className="">*/}
        {/*        <Button*/}
        {/*          disabled={isLocked}*/}
        {/*          onClick={() => {*/}
        {/*            if (!asset?.id) return;*/}
        {/*            if (!isLocked)*/}
        {/*              void removeTicketCategory.mutate({ id: asset?.id });*/}
        {/*          }}*/}
        {/*          variant="outline"*/}
        {/*          size="icon"*/}
        {/*        >*/}
        {/*          <Icons.trash className="h-4 w-4 text-red-900" />*/}
        {/*        </Button>*/}
        {/*      </TooltipTrigger>*/}
        {/*      <TooltipContent side="bottom">*/}
        {/*        <p>Remove ticket type.</p>*/}
        {/*      </TooltipContent>*/}
        {/*    </Tooltip>*/}
        {/*  </TooltipProvider>*/}
        {/*)}*/}
        {asset && !isLocked && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="">
                <Button
                  disabled={isLocked || isLoading}
                  className="group bg-gradient-to-br from-black to-gray-400 hover:from-gray-400"
                  onClick={() => {
                    if (!isLocked) void saveInLedger();
                  }}
                  variant="outline"
                  size="icon"
                >
                  {loadingSignature ? (
                    <Icons.spinner className="h-4 w-4 animate-spin text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  ) : (
                    <Icons.chain className="h-4 w-4 fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Lock changes into the blockchain&apos;s Ledger. This action is
                  irreversible.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {}
        {asset?.address && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="">
                <Button
                  disabled={isLoading}
                  className="group bg-blue-600 hover:bg-blue-700"
                  onClick={IPO}
                  variant="outline"
                  size="icon"
                >
                  {loadingIPO ? (
                    <Icons.spinner className="h-4 w-4 animate-spin text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  ) : (
                    <Icons.chain className="h-4 w-4 fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Create sell Offer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};
