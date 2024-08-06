"use client";
import React from "react";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { TRPCClientErrorLike } from "@trpc/client";
import { type SubmitHandler, useForm } from "react-hook-form";
import { TableRow, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Asset } from "@prisma/client";
import { Icons } from "~/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  getPublicKey,
  signTransaction,
  signAuthEntry,
} from "@stellar/freighter-api";
import { Server } from "@stellar/stellar-sdk/lib/horizon";

interface ITicketCategory {
  code: string;
  totalUnits: number;
  pricePerUnit: number;
}

export const TicketTypeToAssetForm: React.FC<{
  eventId: string;
  asset?: Asset;
  onSubmitted?: () => void;
}> = ({ eventId, asset, onSubmitted }) => {
  const [isLocked, setIsLocked] = React.useState(!!asset?.address);
  const [loadingSignature, setLoadingSignature] = React.useState(false);
  const ctx = api.useContext();
  function onSuccess() {
    setIsLocked(true);
    void ctx.asset.list.invalidate({ eventId });
    toast.success("Tokenized ticket saved successfully to the blockchain");
  }

  function onError({ data, message }: TRPCClientErrorLike<any>) {
    console.log("data:", data);
    console.log("message:", message);
    const errorMessage = data?.zodError?.fieldErrors;
    if (errorMessage) {
      toast.error(errorMessage?.description);
    } else {
      if (data?.code === "INTERNAL_SERVER_ERROR") {
        toast.error("We are facing some issues. Please try again later");
      } else if (data?.code === "BAD_REQUEST") {
        toast.error("Invalid request. Please try again later");
      } else if (data?.code === "UNAUTHORIZED") {
        toast.error("Unauthorized request. Please try again later");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Failed to register! Please try again later");
      }
    }
  }
  const createTicketCategory = api.event.addTicketCategory.useMutation({
    onSuccess: () => {
      if (onSubmitted) onSubmitted();
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Category saved successfully");
    },
    onError,
  });
  const updateTicketCategory = api.event.updateTicketCategory.useMutation({
    onSuccess: () => {
      if (onSubmitted) onSubmitted();
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Category updated successfully");
    },
    onError,
  });
  const removeTicketCategory = api.event.removeTicketCategory.useMutation({
    onSuccess: () => {
      if (onSubmitted) onSubmitted();
      void ctx.asset.list.invalidate({ eventId });
      toast.success("Category removed successfully");
    },
    onError,
  });

  // void api.post.getLatest.prefetch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<ITicketCategory>({
    defaultValues: {
      code: asset?.label ?? "",
      totalUnits: asset?.totalUnits,
      pricePerUnit: asset?.pricePerUnit,
    },
  });

  const onSubmit: SubmitHandler<ITicketCategory> = (data) => {
    if (asset?.id) {
      updateTicketCategory.mutate({
        id: asset.id,
        code: data.code,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
      });
    } else {
      createTicketCategory.mutate({
        code: data.code,
        totalUnits: Number(data.totalUnits),
        pricePerUnit: Number(data.pricePerUnit),
        eventId,
      });
    }
  };

  const addToLedger = api.asset.addToLedger.useMutation({
    onError,
  });
  const tokenize = api.stellarAccountRouter.submitTransaction.useMutation({
    onError,
    onSuccess,
  });
  const createSellOffer = api.stellarOffer.sell.useMutation({
    onError,
    onSuccess,
  });

  async function saveInLedger() {
    if (!asset?.id) return;
    const publicKey = await getPublicKey();
    if (!publicKey) toast.error("Error getting public key");
    setLoadingSignature(true);
    console.log("publicKey", publicKey);
    const xdr = await addToLedger.mutateAsync({
      assetId: asset?.id,
      distributorKey: publicKey,
    });
    console.log("xdr", xdr, "signed with ", publicKey);
    const signedXDR = await signTransaction(xdr, {
      network: "TESTNET",
      accountToSign: publicKey,
    }).catch(() => setLoadingSignature(false));
    console.log("signedXDR", signedXDR);
    if (signedXDR) {
      const result = await tokenize.mutateAsync({
        xdr: signedXDR,
      });
      console.log(result);
    }
    setLoadingSignature(false);
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
        <Label htmlFor="code" className="sr-only">
          Code
        </Label>
        <Input
          id="code"
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                  className="group bg-gradient-to-br from-black to-gray-400 hover:from-gray-400"
                  onClick={() => {
                    if (!isLocked) void saveInLedger();
                  }}
                  variant="outline"
                  size="icon"
                >
                  {loadingSignature ? (
                    <Icons.spinner className="h-4 w-4 animate-spin fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
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
                  className="group bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    void createSellOffer.mutate({ assetId: asset.id });
                  }}
                  variant="outline"
                  size="icon"
                >
                  <Icons.chain className="h-4 w-4 fill-gray-200 text-gray-200 group-hover:fill-zinc-700 group-hover:text-zinc-700" />
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
