"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/z79vPeCkNek
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from "react";
import { Button } from "~/components/ui/button";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "~/components/ui/chart";
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
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import { useParams } from "next/navigation";
import { cn } from "~/lib/utils";
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

export default function EventEditor() {
  // Use the useParams hook to access the dynamic parameters
  const params = useParams();
  // Extract the id from the params object
  const { id } = params;
  const categories = api.asset.list.useQuery(
    { eventId: id as string },
    { enabled: !!id },
  );
  const event = api.event.get.useQuery({ id: id as string }, { enabled: !!id });
  const [pendingForms, setPendingForms] = React.useState<number[]>([]);

  if (!id) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4">
      <MenuBreadcumb id={id as string} />

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
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
              <Button variant="outline" size="sm">
                Discard
              </Button>
              <Button size="sm">Save Event</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card x-chunk="dashboard-07-chunk-0">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Update the event details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid -translate-y-10 gap-6">
                    <div className="flex flex-row items-end justify-between gap-3">
                      <div className="flex flex-grow flex-col gap-3">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Title</Label>
                          <Input
                            id="name"
                            type="text"
                            className="w-full"
                            defaultValue={event.data?.name}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="venue">Venue</Label>
                          <Input
                            id="venue"
                            value={event.data?.venue}
                            defaultValue="Join us for the annual Acme Tech Conference, where industry leaders and innovators come together to share their insights and shape the future of technology."
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={
                              event.data?.description ??
                              "Join us for the annual Acme Tech Conference, where industry leaders and innovators come together to share their insights and shape the future of technology."
                            }
                            className="min-h-32"
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
                          defaultValue="2024-06-15"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
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
                        type="text"
                        className="w-full"
                        defaultValue="San Francisco, CA"
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
                                  Commission
                                  <Icons.moreInfo className="ml-1 h-3 w-3 bg-muted" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Fixed commission per ticket sold</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
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
                                  Transaction-based fee, additional to Stellar
                                  Network&lsquo;s fee.
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
                    className="gap-1"
                  >
                    <div className="h-3.5 w-3.5" />
                    Add Ticket Type
                  </Button>
                </CardFooter>
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
                    <div className="grid gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Ticket Sales by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <BarchartChart className="aspect-[9/4]" />
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

const BarchartChart: React.FC<{ className?: string }> = (props) => {
  return (
    <div {...props}>
      <ChartContainer
        config={{
          desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="min-h-[300px]"
      >
        <BarChart
          accessibilityLayer
          data={[
            { month: "January", desktop: 186 },
            { month: "February", desktop: 305 },
            { month: "March", desktop: 237 },
            { month: "April", desktop: 73 },
            { month: "May", desktop: 209 },
            { month: "June", desktop: 214 },
          ]}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: string) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
