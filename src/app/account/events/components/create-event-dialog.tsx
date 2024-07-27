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
import { Textarea } from "~/components/ui/textarea";
import { CalendarDatePicker } from "~/app/account/events/components/date-picker";
import { Icons } from "~/components/icons";
import { TRPCClientErrorLike } from "@trpc/client";
import { ZodError } from "zod";
import { TRPCError } from "@trpc/server";

dayjs.extend(utc);

interface INewEvent {
  name: string;
  date?: Date;
  venue: string;
  description: string;
}

export default function CreateEventDialog() {
  const ctx = api.useContext();
  function onSuccess() {
    console.log("Event registered successfully");
    toast.success("Event registered successfully");
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
  const createEvent = api.event.create.useMutation({
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
  } = useForm<INewEvent>({
    defaultValues: {
      name: "",
      date: "",
      venue: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<INewEvent> = (data) => {
    console.log("data:", data);
    createEvent.mutate({
      name: data.name,
      date: dayjs.utc(data.date as string).toDate(),
      venue: data.venue,
      description: data.description,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-10">
          Create New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Title</Label>
              <Input
                id="name"
                register={register}
                errors={errors}
                required
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <CalendarDatePicker
                className="h-9 rounded-md border border-input px-3"
                onSetDate={(d: Date) => {
                  setValue("date", d);
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                register={register}
                errors={errors}
                required
                type="text"
                placeholder="Enter venue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                register={register}
                errors={errors}
                placeholder="Enter event description"
                className="min-h-[100px]"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit">Capacity</Label>
              <Input
                id="limit"
                type="number"
                placeholder="Enter ticket limit"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Event Image</Label>
              <Input id="image" type="file" />
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
              {createEvent.isPending ? <Icons.spinner /> : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
