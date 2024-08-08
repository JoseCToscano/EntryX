"use client";
import React from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import TeamSwitcher from "~/app/account/components/team-switcher";
import { MainNav } from "~/app/account/components/main-nav";
import { Sidebar } from "~/app/account/components/sidebar";
import { playlists } from "~/app/account/data/playlists";
import { Icons } from "~/components/icons";
import Image from "next/image";
import { Footer } from "~/app/account/components/footer";
import { useWallet } from "~/hooks/useWallet";
import { Badge } from "~/components/ui/badge";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { account, network, isLoading } = useWallet();

  return (
    <ClerkProvider>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="flex min-h-screen flex-col">
          <div className="sticky top-0 border-b">
            <div className="z-50 flex h-16 items-center bg-white px-4 opacity-95">
              <MainNav
                className="mx-6"
                sections={[
                  { name: "Overview", href: "/account" },
                  { name: "Events", href: "/account/events" },
                  { name: "Wallet", href: "/account/wallet" },
                ]}
              />
              <div className="ml-auto flex items-center space-x-4">
                {isLoading ? (
                  <Icons.spinner className="animate-spin" />
                ) : (
                  <span className="flex flex-row items-center gap-1 font-semibold">
                    <Image
                      width={20}
                      height={20}
                      src={"/icons/stellar-xlm-logo.svg"}
                      alt={"Stellar XLM icon"}
                    />
                    XLM: {account?.xlm?.balance ?? "-"}
                    <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400 py-0.5 text-xs">
                      {network}
                    </Badge>
                  </span>
                )}
                <UserButton />
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-5">
            <Sidebar playlists={playlists} className="hidden lg:block" />
            <div className="col-span-3 lg:col-span-4 lg:border-l">
              {children}
              <Footer />
            </div>
          </div>
        </div>
      </SignedIn>
    </ClerkProvider>
  );
}
