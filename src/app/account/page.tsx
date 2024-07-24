import { type Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Music App",
  description: "Example music app using the components.",
};

export default function Component() {
  return (
    <div className="mb-24 grid gap-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
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
            <div className="text-4xl font-bold">1,234</div>
            <div className="text-sm text-muted-foreground">
              +15% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$125,678</div>
            <div className="text-sm text-muted-foreground">
              +20% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">82%</div>
            <div className="text-sm text-muted-foreground">
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
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
              <TableRow>
                <TableCell>Music Festival</TableCell>
                <TableCell>June 1, 2024</TableCell>
                <TableCell>$45,678</TableCell>
                <TableCell>92%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Art Exhibition</TableCell>
                <TableCell>July 15, 2024</TableCell>
                <TableCell>$32,456</TableCell>
                <TableCell>78%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comedy Show</TableCell>
                <TableCell>August 20, 2024</TableCell>
                <TableCell>$17,890</TableCell>
                <TableCell>85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cooking Class</TableCell>
                <TableCell>September 5, 2024</TableCell>
                <TableCell>$9,876</TableCell>
                <TableCell>68%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Dance Workshop</TableCell>
                <TableCell>October 12, 2024</TableCell>
                <TableCell>$20,123</TableCell>
                <TableCell>75%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadIcon(props) {
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
}

function SettingsIcon(props) {
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
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
