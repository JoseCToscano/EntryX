import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import Link from "next/link";

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("pb-8", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            <Link href="/events">
              <Button variant="ghost" className="h-8 w-full justify-start">
                <Icons.browseGrid className="mx-2 h-4 w-4" />
                Browse
              </Button>
            </Link>
            <Link href="/secondary-market">
              <Button variant="ghost" className="h-8 w-full justify-start">
                <Icons.market className="mx-2 h-4 w-4" />
                Secondary Market
              </Button>
            </Link>
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
