import { Icons } from "~/components/icons";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link
      href={"/events"}
      className="flex items-center font-medium text-gray-900"
    >
      <Icons.Logo className="h-8 w-8 rounded-full hover:scale-[1.01]" />
      <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400">
        Entry•X
      </Badge>
    </Link>
  );
}
