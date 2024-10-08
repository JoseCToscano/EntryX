import React from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";
import { Badge } from "~/components/ui/badge";

const Footer = () => (
  <footer className="bottom-0 hidden w-full flex-col items-center justify-center bg-muted p-6 sm:flex md:py-12">
    <div className="container grid max-w-7xl grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:grid-cols-4">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">
          <Badge
            className={cn("border-0 bg-gradient-to-r from-black to-gray-700")}
          >
            ENTRY
            <Icons.LogoNoBg className="color h-5 w-5 text-black" />
          </Badge>
        </h1>
        <p className="text-xs font-light">
          Decentralized platform designed to distribute and manage digital
          tickets.
        </p>
        <p className="text-xs font-light text-muted-foreground">
          A transparent, secure and reliable solution for event organizers and
          ticket buyers.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Resources</h3>
        <Link href="/how-to-resell" prefetch={false}>
          How to resell tickets
        </Link>

        <Link href="/pricing" prefetch={false}>
          Pricing
        </Link>
        <Link href="/account?joinWaitlist=true" prefetch={false}>
          Partner with us
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Legal</h3>
        <Link href="/privacy-policy" prefetch={false}>
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" prefetch={false}>
          Terms of Service
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Connect</h3>
        <Link href="/contact" prefetch={false}>
          Contact us
        </Link>
      </div>
    </div>
    <div className="mt-10 text-xs font-light">
      <p>© 2024 Entry•X | All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
