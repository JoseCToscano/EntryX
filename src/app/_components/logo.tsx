import { Icons } from "~/components/icons";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href={"/events"} className="flex items-center text-gray-900">
      <Badge className="ml-2 border-0 bg-gradient-to-r from-black to-gray-700">
        ENTRY
        <Icons.LogoNoBg className="h-5 w-5" />
      </Badge>
    </Link>
  );
}
