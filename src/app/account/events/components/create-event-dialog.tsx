"use client";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
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
import { useEffect } from "react";

dayjs.extend(utc);

export default function CreateEventDialog() {
  function onSuccess() {
    toast.success("Event registered successfully");
    reset();
  }

  function onError() {
    return ({ message }: { message?: string }) => {
      if (message) {
        toast.error(message);
      } else {
        toast.error("Failed to register! Please try again later");
      }
    };
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
    watch,
    formState: { errors },
    setValue,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      date: "",
      venue: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    console.log('data:', data);
    createEvent.mutate({
      name: data.name as string,
      date: dayjs.utc(data.date as string).toDate(),
      venue: data.venue as string,
      description: data.description as string,
    });
  };

  useEffect(()=>{
    console.log(errors);
  },[errors])

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
        <div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                register={register}
                errors={errors}
                required
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <CalendarDatePicker
                onSetDate={(d) => {
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
          </form>
        </div>
        <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            {createEvent.isPending ? "loading..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
