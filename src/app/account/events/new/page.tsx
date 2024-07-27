"use client";
import { type SubmitHandler, useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { CalendarDatePicker } from "~/app/account/events/components/date-picker";
import { Icons } from "~/components/icons";
import { TRPCClientErrorLike } from "@trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MenuBreadcumb } from "~/app/account/events/components/menu-breadcumb";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";
import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

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
    <div className="p-4">
      <MenuBreadcumb isNew />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 pt-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-0">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Insert the event details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid -translate-y-10 gap-6">
                    <div className="flex flex-row items-end justify-between gap-3">
                      <div className="flex flex-grow flex-col gap-3">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Title</Label>
                          <Input
                            id="name"
                            register={register}
                            errors={errors}
                            required
                            type="text"
                            className="w-full"
                            placeholder="Stellar’s annual conference in London 2024"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="venue">Venue</Label>
                          <Input
                            id="venue"
                            register={register}
                            errors={errors}
                            required
                            placeholder="Church House"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            register={register}
                            errors={errors}
                            placeholder="The largest tech conference in the world"
                            className="min-h-32"
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="">
                        <Image
                          src={`/images/event-placeholder-${1 + (parseInt(String(100 * Math.random()), 10) % 4)}.png`}
                          alt={"album.name"}
                          width={300}
                          height={330}
                          className={cn(
                            "aspect-[3/4] h-auto w-[250px] cursor-pointer rounded-md object-cover transition-all hover:scale-105",
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-3">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          className="w-full"
                          placeholder="2024-10-15"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          className="w-full"
                          placeholder="09:00"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        className="w-full"
                        placeholder="London, UK"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card x-chunk="dashboard-07-chunk-2">
                <CardHeader>
                  <CardTitle>Event Analytics</CardTitle>
                  <CardDescription>
                    View event performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Ticket Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-4xl font-bold">1,500</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <div className="h-4 w-4 text-green-500" />
                              <span>+12%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-4xl font-bold">2,800</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <div className="h-4 w-4 text-red-500" />
                              <span>-5%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-4xl font-bold">$250,000</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <div className="h-4 w-4 text-green-500" />
                              <span>+8%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Event Status</CardTitle>
                  <Badge className="border-0 bg-gradient-to-br from-black to-gray-400">
                    Not Public
                  </Badge>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
