"use client";
import TeamSwitcher from "~/app/account/components/team-switcher";
import { MainNav } from "~/app/account/components/main-nav";
import { Search } from "~/app/account/components/search";
import { PartnerNav } from "~/app/account/components/partner-nav";
import { Sidebar } from "~/app/account/components/sidebar";
import { playlists } from "~/app/account/data/playlists";
import Link from "next/link";
import { api } from "~/trpc/react";
import React from "react";
import { Icons } from "~/components/icons";
import Image from "next/image";
import useFreighter from "~/hooks/useFreighter";

const Footer = () => (
  <footer className="bottom-0 flex w-full flex-col items-center justify-center bg-muted p-6 md:py-12">
    <div className="container grid max-w-7xl grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:grid-cols-5">
      <div className="grid gap-1">
        <h3 className="font-semibold">Company</h3>
        <Link href="#" prefetch={false}>
          About Us
        </Link>
        <Link href="#" prefetch={false}>
          Our Team
        </Link>
        <Link href="#" prefetch={false}>
          Careers
        </Link>
        <Link href="#" prefetch={false}>
          News
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Products</h3>
        <Link href="#" prefetch={false}>
          Wallet
        </Link>
        <Link href="#" prefetch={false}>
          Swap
        </Link>
        <Link href="#" prefetch={false}>
          Earn
        </Link>
        <Link href="#" prefetch={false}>
          NFTs
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Resources</h3>
        <Link href="#" prefetch={false}>
          Blog
        </Link>
        <Link href="#" prefetch={false}>
          Documentation
        </Link>
        <Link href="#" prefetch={false}>
          Support
        </Link>
        <Link href="#" prefetch={false}>
          FAQs
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Legal</h3>
        <Link href="#" prefetch={false}>
          Privacy Policy
        </Link>
        <Link href="#" prefetch={false}>
          Terms of Service
        </Link>
        <Link href="#" prefetch={false}>
          Cookie Policy
        </Link>
      </div>
      <div className="grid gap-1">
        <h3 className="font-semibold">Connect</h3>
        <Link href="#" prefetch={false}>
          Twitter
        </Link>
        <Link href="#" prefetch={false}>
          Discord
        </Link>
        <Link href="#" prefetch={false}>
          Telegram
        </Link>
        <Link href="#" prefetch={false}>
          Medium
        </Link>
      </div>
    </div>
    <div className="mt-10 text-xs font-light">
      <p>© 2024 Entry•X | All rights reserved.</p>
    </div>
  </footer>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchString, setSearchString] = React.useState("");
  const { publicKey } = useFreighter();

  const { data, isLoading } = api.stellarAccountRouter.details.useQuery(
    {
      id: publicKey!,
    },
    { enabled: !!publicKey, refetchInterval: 5000 },
  );
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 border-b">
        <div className="z-50 flex h-16 items-center bg-white px-4 opacity-95">
          <TeamSwitcher />
          <MainNav
            className="mx-6"
            sections={[
              { name: "Overview", href: "/account" },
              { name: "Events", href: "/account/events" },
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
            <PartnerNav />
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
