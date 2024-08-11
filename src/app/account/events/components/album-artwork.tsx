import Image from "next/image";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

import { playlists } from "../../data/playlists";
import { cn } from "~/lib/utils";
import { type Albums } from "~/app/account/data/albums";
import dayjs from "dayjs";
import { type Event } from "@prisma/client";
import Link from "next/link";
import { type LinkHTMLAttributes } from "react";

interface AlbumArtworkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  album: Albums | Event;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  showAttendance?: boolean;
  showSalesPercentage?: boolean;
  href: string;
}

export function AlbumArtwork({
  album,
  aspectRatio = "portrait",
  width,
  height,
  showAttendance,
  showSalesPercentage,
  className,
  href,
  ...props
}: AlbumArtworkProps) {
  return (
    <Link
      href={href}
      className={cn("flex-shrink-0 space-y-3", className)}
      {...props}
    >
      <div className="overflow-hidden rounded-md">
        <Image
          src={
            (album as Event).imageUrl ??
            `/images/event-placeholder-${1 + (parseInt(String(100 * Math.random()), 10) % 4)}.png`
          }
          alt={album.name}
          width={width}
          height={height}
          className={cn(
            "h-auto w-auto cursor-pointer object-cover transition-all hover:border-2",
            aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
          )}
        />
      </div>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{album.name}</h3>
        <span className="flex flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(album as Event).location}
          </p>
          <p className="text-xs text-muted-foreground">
            {dayjs(album.date).format("MMM DD")}
          </p>
        </span>
        {showAttendance && (album as Albums).attendance && (
          <p className="text-xs text-muted-foreground">
            {(album as Albums).attendance.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            tickets sold
          </p>
        )}
        {showSalesPercentage &&
          (album as Albums).attendance &&
          (album as Albums).capacity && (
            <p className="text-xs text-muted-foreground">
              {(
                ((album as Albums).attendance / (album as Albums).capacity) *
                100
              ).toFixed(1)}
              % sold
            </p>
          )}
      </div>
    </Link>
  );
}
