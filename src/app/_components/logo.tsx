import { Icons } from "~/components/icons";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { cn } from "~/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href={"/events"} className={cn("flex items-center text-gray-900")}>
      <Badge
        className={cn(
          "ml-2 border-0 bg-gradient-to-r from-black to-gray-700",
          className,
        )}
      >
        ENTRY
        <Icons.LogoNoBg className="h-5 w-5" />
      </Badge>
    </Link>
  );
}
