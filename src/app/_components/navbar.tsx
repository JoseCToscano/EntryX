"use client";
import React from "react";
import Logo from "~/app/_components/logo";
import { MainNav } from "~/app/account/components/main-nav";
import { Icons } from "~/components/icons";
import Image from "next/image";
import { shortStellarAddress } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { useWallet } from "~/hooks/useWallet";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const { publicKey, network, isLoading } = useWallet();

  return (
    <div className="sticky top-0 hidden border-b sm:block">
      <div className="z-50 flex h-16 items-center bg-white px-4 opacity-95">
        <Logo />
        <MainNav
          className="mx-6"
          sections={[
            { name: "Events", href: "/events" },
            { name: "Wallet", href: "/wallet" },
            { name: "Pricing", href: "/pricing" },
          ]}
        />
        <div className="ml-auto flex items-center space-x-4">
          {isLoading ? (
            <Icons.spinner className="animate-spin" />
          ) : (
            <span className="flex flex-row items-center gap-1 font-semibold">
              {publicKey && (
                <Image
                  width={20}
                  height={20}
                  src={"/icons/stellar-xlm-logo.svg"}
                  alt={"Stellar XLM icon"}
                />
              )}
              {publicKey ? (
                shortStellarAddress(publicKey)
              ) : (
                <Link href="/wallet" className="flex items-center">
                  <Button className="group border-[1px] border-black bg-black px-4 pr-8 text-sm text-white hover:bg-white hover:text-black">
                    Connect wallet
                    <Icons.expandingArrow className="" />
                  </Button>
                </Link>
              )}
              {publicKey && network && (
                <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400 py-0.5 text-xs">
                  {network}
                </Badge>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
