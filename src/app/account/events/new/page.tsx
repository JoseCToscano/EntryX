"use client";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MenuBreadcumb } from "~/app/account/events/components/menu-breadcumb";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";
import { ClientTRPCErrorHandler, cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { useWallet } from "~/hooks/useWallet";
import { Icons } from "~/components/icons";

dayjs.extend(utc);

export default function CreateEvent() {
  const ctx = api.useContext();
  const router = useRouter();
  const { publicKey } = useWallet();

  function onSuccess() {
    console.log("Event registered successfully");
    toast.success("Event registered successfully");
    void ctx.event.search.invalidate();
    reset();
  }

  const createEvent = api.event.create.useMutation({
    onSuccess,
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
      name: "",
      venue: "",
      description: "",
      location: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!publicKey) return toast.error("Please connect your wallet");
    const { id } = await createEvent.mutateAsync({
      name: data.name as string,
      date: dayjs.utc(data.date as string).toDate(),
      venue: data.venue as string,
      description: data.description as string,
      location: data.location as string,
      publicKey,
      imageUrl: "/images/event-placeholder-1.png",
      coverUrl: "/images/event-placeholder-1.png",
    });
    await ctx.event.search.invalidate();
    router.push(`/account/events/${id}`);
  };

  return (
    <div className="p-4">
      <MenuBreadcumb isNew />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 pt-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-0">
                <CardHeader className="pb-0">
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Insert the event details</CardDescription>
                </CardHeader>
                <CardContent className="">
                  <div className="grid gap-6 pb-4">
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
                          src={`/images/event-placeholder-1.png`}
                          alt={"album.name"}
                          width={300}
                          height={330}
                          className={cn(
                            "aspect-[3/4] h-auto w-[250px] cursor-pointer rounded-md object-cover transition-all hover:border-2",
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
                          register={register}
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
                        register={register}
                        type="text"
                        className="w-full"
                        placeholder="London, UK"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-8 border-[1px] border-black bg-black px-4 text-white hover:bg-white hover:text-black"
                    onClick={handleSubmit(onSubmit)}
                  >
                    {createEvent.isPending ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Event"
                    )}
                  </Button>
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
