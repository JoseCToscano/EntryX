"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { plurify } from "~/lib/utils";
import Link from "next/link";

interface TicketCardProps {
  eventId: string;
  id: string;
  title: string;
  date: string;
  location: string;
  numOfEntries: number;
}
const TicketCard: React.FC<TicketCardProps> = ({
  eventId,
  id,
  location,
  title,
  date,
  numOfEntries,
}) => {
  const generateQrCode = (data: string) => {
    const size = "100x100";
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
    return url;
  };

  return (
    <Link
      className="w-full max-w-xl hover:scale-105"
      href={`/events/${eventId}/${id}`}
    >
      <Card>
        <CardHeader className="p-4">
          <div className="flex w-full items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TicketIcon className="h-4 w-4" />
            </div>
            {title}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex-1 space-y-1 text-center">
            <div className="text-sm">
              {numOfEntries} {plurify("ticket", numOfEntries)}
            </div>
            <div className="text-sm text-muted-foreground">{date}</div>
            <div className="text-sm text-muted-foreground">{location}</div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <img
              src={generateQrCode(id)}
              width="100"
              height="100"
              alt="QR Code"
              className="rounded-md"
              style={{ aspectRatio: "200/200", objectFit: "cover" }}
            />
            <Button variant="outline" size="sm">
              Manage Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

function TicketIcon(props) {
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
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

export default TicketCard;
