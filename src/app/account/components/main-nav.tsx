import Link from "next/link";
import { cn } from "~/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/account"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        href="/account/events"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Events
      </Link>
      <Link
        href="/account/wallet"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Wallet
      </Link>
      <Link
        href="/account/settings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Settings
      </Link>
    </nav>
  );
}
