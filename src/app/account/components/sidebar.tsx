import { type Playlist } from "../data/playlists";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Icons } from "~/components/icons";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  playlists: Playlist[];
}

export function Sidebar({ className, playlists }: SidebarProps) {
  return (
    <div className={cn("top-0 pb-8", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="h-8 w-full justify-start">
              <Icons.browseGrid className="mx-2 h-4 w-4" />
              Browse
            </Button>
            <Button variant="ghost" className="h-8 w-full justify-start">
              <Icons.market className="mx-2 h-4 w-4" />
              Secondary Market
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            My Account
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="h-8 w-full justify-start">
              <Icons.ticket className="mx-2 h-4 w-4" />
              Tickets
            </Button>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="h-8 w-full justify-start">
              <Icons.wallet className="mx-2 h-4 w-4" />
              Wallet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
