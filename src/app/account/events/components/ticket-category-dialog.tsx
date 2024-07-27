"use client";
import { type SubmitHandler, useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Icons } from "~/components/icons";
import { TRPCClientErrorLike } from "@trpc/client";

dayjs.extend(utc);

interface ITicketCategory {
  code: string;
  totalUnits: number;
  pricePerUnit: number;
}

export default function TicketCategoryDialog({ eventId }: { eventId: string }) {
  const ctx = api.useContext();
  function onSuccess() {
    toast.success("Tcket cateogry registered successfully");
    void ctx.event.search.invalidate();
    reset();
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
    onSuccess,
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
      code: "",
      totalUnits: 0,
      pricePerUnit: 0,
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-10">
          Add Ticket Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Ticket Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Categoery Code</Label>
              <Input
                id="code"
                register={register}
                errors={errors}
                required
                placeholder="General access, VIP, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalUnits">
                Total tickets for this category
              </Label>
              <Input
                id="totalUnits"
                register={register}
                errors={errors}
                required
                type="number"
                step={1}
                placeholder="Enter total tickets"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerUnit">Price per ticket</Label>
              <Input
                id="pricePerUnit"
                register={register}
                errors={errors}
                placeholder="Enter price per ticket"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <div>
              <Button className="border-[0.5px] border-black px-2">
                Cancel
              </Button>
            </div>
            <Button
              type="submit"
              className="border-[0.5px] border-black bg-black px-2 text-white"
            >
              {createTicketCategory.isPending ? <Icons.spinner /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
