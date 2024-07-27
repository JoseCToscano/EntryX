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
  const [isLocked, setIsLocked] = React.useState(asset?.address);
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
      toast.success("Tokenized ticket saved successfully to the blockchain");
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
      code: asset?.code ?? "",
      totalUnits: asset?.totalUnits ?? 0,
      pricePerUnit: asset?.totalUnits ?? 0,
    },
  });

  const onSubmit: SubmitHandler<ITicketCategory> = (data) => {
    console.log("data:", data);
    createTicketCategory.mutate({
      code: data.code,
      totalUnits: Number(data.totalUnits),
      pricePerUnit: Number(data.pricePerUnit),
      eventId,
    });
  };

  const addToLedger = api.asset.addToLedger.useMutation({
    onError,
    onSuccess,
  });

  return (
    <TableRow>
      {/*<form /!* onSubmit={handleSubmit(onSubmit)} *!/>*/}
      <TableCell className="flex flex-row items-center font-semibold">
        {isLocked && (
          <Badge className="mr-1 border-0 bg-gradient-to-br from-black to-gray-400">
            D
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
          type="text"
          placeholder="General Admission"
          className={cn(isLocked && "w-[50px] border-0 text-black")}
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
          type="number"
          defaultValue="500"
        />
      </TableCell>
      <TableCell>
        <div className="flex h-8 flex-row items-center justify-end rounded-md border-[0.5px] border-gray-300 bg-muted">
          <div className="flex w-full items-center justify-center gap-1 rounded-l-md py-1 text-center">
            <p className="text-sm font-light">$0.99</p>
          </div>
          <div className="w-[100px] rounded-r-md bg-neutral-500 py-1 text-center opacity-70">
            <p className="text-sm font-light">1%</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {!isLocked && (
          <Button
            disabled={isLocked}
            onClick={() => {
              console.log("click");
              if (!isLocked) void handleSubmit(onSubmit)();
            }}
            className="bg-blue-600"
            variant="outline"
            size="icon"
          >
            <div className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
        {asset && (
          <Button
            className="bg-gradient-to-br from-black to-gray-400"
            onClick={() => {
              void addToLedger.mutate({ assetId: asset.id });
            }}
            variant="outline"
            size="icon"
          >
            <div className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};
