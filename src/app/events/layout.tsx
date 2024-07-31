"use client";
import TeamSwitcher from "~/app/account/components/team-switcher";
import { MainNav } from "~/app/account/components/main-nav";
import { Search } from "~/app/account/components/search";
import { UserNav } from "~/app/events/components/user-nav";
import { Sidebar } from "~/app/account/components/sidebar";
import { playlists } from "~/app/account/data/playlists";
import { api } from "~/trpc/react";
import React from "react";
import { Icons } from "~/components/icons";
import Image from "next/image";
import Footer from "~/components/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchString, setSearchString] = React.useState("");

  const { data, isLoading } = api.stellarAccountRouter.details.useQuery(
    {
      id: searchString,
    },
    { enabled: searchString.length === 56, refetchInterval: 5000 },
  );
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 border-b">
        <div className="z-50 flex h-16 items-center bg-white px-4 opacity-95">
          <MainNav
            className="mx-6"
            sections={[
              { name: "Events", href: "/events" },
              { name: "Wallet", href: "/account/wallet" },
              { name: "Settings", href: "/account/settings" },
            ]}
          />
          <div className="ml-auto flex items-center space-x-4">
            <Search value={searchString} onChange={setSearchString} />
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
                XLM: {data?.xlm?.balance ?? "-"}
              </span>
            )}
            <UserNav />
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
  );
}
