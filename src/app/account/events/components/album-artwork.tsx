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
import TicketCategoryDialog from "~/app/account/events/components/ticket-category-dialog";
import Link from "next/link";
import { LinkHTMLAttributes } from "react";

interface AlbumArtworkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  album: Albums | Event;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  showAttendance?: boolean;
  showSalesPercentage?: boolean;
}

export function AlbumArtwork({
  album,
  aspectRatio = "portrait",
  width,
  height,
  showAttendance,
  showSalesPercentage,
  className,
  ...props
}: AlbumArtworkProps) {
  return (
    <Link
      href={"/account/events/" + (album as Event).id ?? "#"}
      className={cn("space-y-3", className)}
      {...props}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">
            <Image
              src={
                (album as Albums).cover ??
                `/images/event-placeholder-${1 + (parseInt(String(100 * Math.random()), 10) % 4)}.png`
              }
              alt={album.name}
              width={width}
              height={height}
              className={cn(
                "h-auto w-auto cursor-pointer object-cover transition-all hover:scale-105",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
              )}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <PlusCircledIcon className="mr-2 h-4 w-4" />
                New Playlist
              </ContextMenuItem>
              <ContextMenuSeparator />
              {playlists.map((playlist) => (
                <ContextMenuItem key={playlist}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                  </svg>
                  {playlist}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>Play Next</ContextMenuItem>
          <ContextMenuItem>Play Later</ContextMenuItem>
          <ContextMenuItem>Create Station</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Like</ContextMenuItem>
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{album.name}</h3>
        <span className="flex flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">{album.venue}</p>
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
        {(album as Event).id && (
          <TicketCategoryDialog eventId={(album as Event).id} />
        )}
      </div>
    </Link>
  );
}
