import React from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { plurify } from "~/lib/utils";
import Link from "next/link";
import { Icons } from "~/components/icons";

interface TicketCardProps {
  eventId: string;
  id: string;
  title: string;
  date: string;
  venue: string;
  location: string;
  numOfEntries: number;
  sellingLiabilities: number;
  handleCardClick?: () => void;
}
const TicketCard: React.FC<TicketCardProps> = ({
  eventId,
  id,
  venue,
  location,
  title,
  date,
  numOfEntries,
  sellingLiabilities,
}) => {
  const generateQrCode = (data: string) => {
    const size = "100x100";
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
  };

  return (
    <Card className="w-full min-w-60 max-w-xl bg-gradient-to-br from-white to-primary-foreground hover:scale-[1.01]">
      <Link href={`/events/${eventId}/${id}`}>
        <CardHeader className="p-4">
          <div className="flex w-full items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icons.ticket className="h-4 w-4" />
            </div>
            {title}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex-1 space-y-1 text-center">
            <div className="text-sm">
              {numOfEntries} {plurify("ticket", numOfEntries)}
            </div>{" "}
            {sellingLiabilities > 0 && (
              <div className="rounded-md bg-amber-600 px-2 text-sm text-white">
                {sellingLiabilities} {plurify("ticket", sellingLiabilities)} on
                sell
              </div>
            )}
            <div className="text-sm text-muted-foreground">{date}</div>
            <div className="text-sm text-muted-foreground">{venue}</div>
            <div className="text-xs text-muted-foreground">{location}</div>
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
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default TicketCard;
