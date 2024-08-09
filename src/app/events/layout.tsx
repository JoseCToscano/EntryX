"use client";
import React from "react";
import { MainNav } from "~/app/account/components/main-nav";
import { Search } from "~/app/account/components/search";
import { UserNav } from "~/app/events/components/user-nav";
import { Sidebar } from "~/app/account/components/sidebar";
import { Icons } from "~/components/icons";
import Image from "next/image";
import Footer from "~/components/components/footer";
import { useWallet } from "~/hooks/useWallet";
import { Badge } from "~/components/ui/badge";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchString, setSearchString] = React.useState("");
  const { account, network, isLoading } = useWallet();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 border-b">
        <div className="z-50 flex h-16 items-center bg-white px-4 opacity-95">
          <MainNav
            className="mx-6"
            sections={[
              { name: "Events", href: "/events" },
              { name: "Wallet", href: "/wallet" },
            ]}
          />
          <Search value={searchString} onChange={setSearchString} />
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
                {network && (
                  <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400 py-0.5 text-xs">
                    {network}
                  </Badge>
                )}
              </span>
            )}
            <UserNav />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-7">
        <Sidebar className="hidden lg:block" />
        <div className="col-span-5 lg:col-span-6 lg:border-l">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
