"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/z79vPeCkNek
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/ui/table";
import { useParams, useRouter } from "next/navigation";
import { ClientTRPCErrorHandler, cn } from "~/lib/utils";
import Image from "next/image";
import { MenuBreadcumb } from "~/app/account/events/components/menu-breadcumb";
import { TicketTypeToAssetForm } from "~/app/account/events/[id]/components/ticket-type-to-asset-form";
import { api } from "~/trpc/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Icons } from "~/components/icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useWallet } from "~/hooks/useWallet";
import Loading from "~/app/account/components/loading";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";

export default function EventEditor() {
  const { publicKey, isLoading } = useWallet();
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  const router = useRouter();
  // Extract the id from the params object
  const { id } = params;
  const ctx = api.useContext();

  const event = api.organizer.event.useQuery(
    { eventId: id as string, publicKey: publicKey! },
    { enabled: !!id && !!publicKey },
  );

  const deleteEvent = api.organizer.delete.useMutation({
    onError: ClientTRPCErrorHandler,
    onSuccess: () => router.push("/account/events"),
  });

  const categories = api.asset.listForOwner.useQuery(
    { eventId: id as string, publicKey: publicKey! },
    { enabled: !!id && Boolean(event.data?.id) && !!publicKey },
  );
  const [pendingForms, setPendingForms] = React.useState<number[]>([]);

  const update = api.event.update.useMutation({
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update event");
    },
    onSuccess: () => {
      toast.success("Event updated successfully");
    },
  });

  // void api.post.getLatest.prefetch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      ...event.data,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!publicKey) return toast.error("Please connect your wallet");
    if (!id) return toast.error("Event not found");
    if (!event.data) return toast.error("Event not found");

    await update.mutateAsync({
      ...event.data,
      name: data.name as string,
      date: dayjs.utc(data.date as string).toDate(),
      venue: data.venue as string,
      description: data.description as string,
      location: data.location as string,
      publicKey,
      imageUrl: event.data.imageUrl ?? "/images/event-placeholder-1.png",
      coverUrl: event.data.coverUrl ?? "/images/event-placeholder-1.png",
    });
    await ctx.event.search.invalidate();
  };

  if (!id) return null;

  if (event.isLoading || isLoading) {
    return <Loading />;
  }

  if (event.error) {
    void router.push("/account/events");
    toast.error("Event not found");
  }

  if (!event.data) {
    return <>No data</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4">
      <MenuBreadcumb name={event.data?.name} />

      <main className="grid flex-1 items-start gap-4 p-4 pb-10 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 pt-4 md:gap-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {event.data?.name}
            </h1>
            <Badge variant="outline" className="ml-auto sm:ml-0">
              {dayjs(event.data?.date).format("MMM D, YYYY")}
            </Badge>
            <Badge variant="outline" className="ml-auto sm:ml-0">
              {event.data?.location ?? event.data?.venue}
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button
                onClick={() =>
                  window.confirm(
                    "Are you sure you want to delete this event?",
                  ) &&
                  publicKey &&
                  id &&
                  deleteEvent.mutate({ publicKey, id: id as string })
                }
                variant="outline"
                size="sm"
              >
                {deleteEvent.isPending ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Event"
                )}
              </Button>
              <Button size="sm">Save Event</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-0">
                <CardHeader className="pb-0">
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Update the event details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="flex flex-row items-end justify-between gap-3">
                      <div className="flex flex-grow flex-col gap-3">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Title</Label>
                          <Input
                            register={register}
                            id="name"
                            type="text"
                            className="w-full"
                            defaultValue={event.data?.name}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="venue">Venue</Label>
                          <Input
                            register={register}
                            id="venue"
                            value={event.data?.venue}
                            defaultValue="Join us for the annual Acme Tech Conference, where industry leaders and innovators come together to share their insights and shape the future of technology."
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            register={register}
                            id="description"
                            value={
                              event.data?.description ??
                              "Join us for the annual Acme Tech Conference, where industry leaders and innovators come together to share their insights and shape the future of technology."
                            }
                            className="min-h-32"
                          />
                        </div>
                      </div>
                      <Image
                        src={
                          event.data?.imageUrl ??
                          `/images/event-placeholder-${1 + (parseInt(String(100 * Math.random()), 10) % 4)}.png`
                        }
                        alt={"album.name"}
                        width={300}
                        height={330}
                        className={cn(
                          "aspect-[3/4] h-auto w-[250px] cursor-pointer rounded-md object-cover transition-all hover:border-2",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-3">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          register={register}
                          type="date"
                          value={dayjs(event.data?.date).format("YYYY-MM-DD")}
                          className="w-full"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          register={register}
                          value={dayjs(event.data?.date).format("HH:mm")}
                          type="time"
                          className="w-full"
                          defaultValue="09:00"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        register={register}
                        value={event.data?.location ?? "TBD"}
                        type="text"
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card x-chunk="dashboard-07-chunk-1">
                <CardHeader>
                  <CardTitle>
                    Ticket Management
                    <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400">
                      Crypto
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Each ticket Type is represented by a Tokenized Asset on the{" "}
                    <a
                      href="https://stellar.org/"
                      className="font-semibold underline"
                    >
                      Stellar
                    </a>{" "}
                    Blockchain with a fixed price and quantity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild className="">
                                <span className="flex items-center justify-start">
                                  Fee
                                  <Icons.moreInfo className="ml-1 h-3 w-3 bg-muted" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  Fixed service fee per ticket purchased(XLM)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild className="">
                                <span className="flex items-center justify-start">
                                  Commission
                                  <Icons.moreInfo className="ml-1 h-3 w-3 bg-muted" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  Relative commission, percentage-based on the
                                  ticket price
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.data?.map((asset, index) => (
                        <TicketTypeToAssetForm
                          key={index}
                          eventId={id as string}
                          asset={asset}
                        />
                      ))}
                      {pendingForms.map((formId) => (
                        <TicketTypeToAssetForm
                          key={formId}
                          eventId={id as string}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                  <Button
                    onClick={() => {
                      setPendingForms((prev) => [...prev, 1]);
                    }}
                    size="sm"
                    variant="ghost"
                    className="bg-black text-white"
                  >
                    Add Ticket Type
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Event Status</CardTitle>
                  <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400">
                    {event.data?.status}
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
