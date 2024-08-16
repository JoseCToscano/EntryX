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
import { Fees } from "~/constants";

export const TicketTypeToAssetForm: React.FC<{
  eventId: string;
  asset?: Asset;
  onSubmitted?: () => void;
}> = ({ eventId, asset, onSubmitted }) => {
  const { isFreighterAllowed, isLoading, hasFreighter, publicKey, signXDR } =
    useWallet();
  // React state
  const [isLocked, setIsLocked] = React.useState(!!asset?.address);
  const [isSaving, setisSaving] = React.useState(false);
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
      pricePerUnit: asset?.pricePerUnit,
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
    setisSaving(true);

    if (asset?.id) {
      await updateTicketCategory.mutateAsync({
        id: asset.id,
        label: data.label as string,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
      });
    } else {
      await createTicketCategory.mutateAsync({
        label: data.label as string,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
        eventId,
        size: "medium",
        distributorPublicKey: publicKey,
      });
    }
    setisSaving(false);
    reset();
  };

  /**
   * Minting process: Transfer new Assets into ledger. From issuer account (saved in server) into
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
      toast.success("Assets minted successfully");
    },
  });

  const soroban = api.soroban.submitContractCall.useMutation({
    onSuccess: () => {
      toast.success("Blockchain updated");
    },
    onError: ClientTRPCErrorHandler,
  });

  const publish = api.soroban.publish.useMutation({
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

  async function handlePublish() {
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
      setLoadingIPO(true);

      // Get un-signed XDR from the server
      let xdr = await publish.mutateAsync({
        assetId: asset.id,
        ownerPublicKey: publicKey,
      });
      xdr = await signXDR(xdr);
      // Submit signed XDR to the server
      await soroban.mutateAsync({
        xdr,
        // requiresSignature: true,
      });
    } catch (e) {
      console.error(e);
      toast.error("Tickets where not published for sale");
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
          <p className="text-sm font-light">{Fees.SERVICE_FEE}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex w-full items-center justify-center gap-1 rounded-l-md py-1 text-center">
          <p className="text-sm font-light">
            {Fees.SELLER_UNITARY_COMMISSION_PERCENTAGE}%
          </p>
        </div>
      </TableCell>
      <TableCell>
        {!isLocked && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="">
                <Button
                  disabled={isLocked || isLoading || isSaving}
                  onClick={() => {
                    if (!isLocked) void handleSubmit(onSubmit)();
                  }}
                  variant="outline"
                  size="icon"
                >
                  {isSaving ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.save className="h-4 w-4" />
                  )}
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
        {asset && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="">
                <Button
                  disabled={isLoading || loadingSignature || loadingIPO}
                  className="group bg-gradient-to-br from-black to-gray-400 hover:from-gray-400"
                  onClick={() => {
                    void saveInLedger();
                    // if (!isLocked) void saveInLedger();
                  }}
                  variant="outline"
                  size="icon"
                >
                  {loadingSignature ? (
                    <Icons.spinner className="h-4 w-4 animate-spin text-gray-200 group-hover:text-zinc-700" />
                  ) : (
                    <Icons.Hammer className="h-4 w-4 fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Mints Assets in Stellar Blockchain. New Assets will be
                  transferred to your Wallet
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
                  disabled={isLoading || loadingSignature || loadingIPO}
                  className="group bg-blue-600 hover:bg-blue-700"
                  onClick={handlePublish}
                  variant="outline"
                  size="icon"
                >
                  {loadingIPO ? (
                    <Icons.spinner className="h-4 w-4 animate-spin text-gray-200 group-hover:text-zinc-700" />
                  ) : (
                    <Icons.Publish className="h-4 w-4 fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Sign Soroban Smart Contract to start sale</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};
