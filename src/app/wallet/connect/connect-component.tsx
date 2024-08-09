"use client";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/5kauP3P5N9W
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useWallet } from "~/hooks/useWallet";
import { useRouter } from "next/navigation";

export const ConnectWallet: React.FC = () => {
  const { isFreighterAllowed, hasFreighter } = useWallet();
  const router = useRouter();

  if (isFreighterAllowed) {
    void router.push("/wallet");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <section className="w-full border-y pt-12 md:pt-24 lg:pt-32">
          <div className="container space-y-10 xl:space-y-16">
            <div className="mx-auto grid max-w-[1300px] gap-4 px-4 sm:px-6 md:grid-cols-2 md:gap-16 md:px-10">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  Connect Your Crypto Wallet
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Securely connect your Stellar wallet to our platform and
                  unlock a world of secure and transparent ticketing
                  opportunities.
                </p>
                <div className="m-6">
                  {hasFreighter ? (
                    <Button
                      onClick={() => void router.push("/wallet")}
                      className="h-10 rounded-md border-2 bg-black p-2 text-white hover:bg-white hover:text-black"
                    >
                      Connect Wallet
                    </Button>
                  ) : (
                    <Link href="https://www.freighter.app/" target="_blank">
                      Install Freighter wallet
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <Image
                  src="/images/mason-supply-AtWvvGw1Yig-unsplash.jpg"
                  width={330}
                  height={330}
                  alt="Wallet connection image"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-bottom sm:w-full lg:order-last lg:aspect-square"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Benefits of Connecting Your Wallet
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Unlock a world of secure and transparent ticket trading (buy
                  and sell) by securely connecting your Stellar wallet to our
                  platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <WalletIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Secure Storage</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Store your tickets securely in your own wallet, with full
                  control over your private keys.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <ShuffleIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">
                    Decentralized Ticket Management
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage and transfer your tickets directly from your wallet,
                  without the need for a centralized intermediary.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <BadgeIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Event participation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easily buy and sell tickets for events, ensuring authenticity
                  and preventing fraud.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <GlobeIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">
                    Transparent transactions
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Benefit from the transparency of blockchain technology with a
                  clear record of all ticket transactions.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <NfcIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">NFT Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  View, manage, and trade your ticket NFTs directly from your
                  connected wallet.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-primary p-3">
                    <CoinsIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Transaction History</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access a comprehensive history of all your ticket
                  transactions, making it easy to track your activity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const BadgeIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    </svg>
  );
};

const CoinsIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
};

const GlobeIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
};

const NfcIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
      <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
      <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
      <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
    </svg>
  );
};

const ShuffleIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>
  );
};

const WalletIcon: React.FC<{ className?: string }> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
};
