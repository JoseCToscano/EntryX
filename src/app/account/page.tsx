"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/IWvCvVPjv8O
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { useWallet } from "~/hooks/useWallet";
import { Icons } from "~/components/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Component() {
  const { publicKey } = useWallet();
  const router = useRouter();

  const analytics = api.analytics.sales.useQuery(
    { publicKey: publicKey! },
    { enabled: !!publicKey },
  );

  const myEvents = api.event.myEvents.useQuery(
    { publicKey: publicKey! },
    { enabled: !!publicKey },
  );

  return (
    <div className="mb-24 grid gap-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="flex items-center gap-4">
          <Button disabled variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button disabled variant="outline" size="sm">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {analytics.isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                analytics.data?.sales.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              +0% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {" "}
              {analytics.isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : analytics.data?.earnings ? (
                `$${analytics.data?.earnings.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              ) : (
                "-"
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              +0% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">0%</div>
            <div className="text-sm text-muted-foreground">
              +0% from last month
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Occupation Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myEvents.data?.map((event) => (
                <TableRow
                  className="cursor-pointer"
                  key={event.id}
                  onClick={() =>
                    void router.push(`/account/events/${event.id}`)
                  }
                >
                  <TableCell>{event.name}</TableCell>
                  <TableCell>
                    {dayjs(event.date).format("MMMM D, YYYY")}
                  </TableCell>
                  <TableCell>$5,678</TableCell>
                  <TableCell>81%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const DownloadIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
};

const SettingsIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};
