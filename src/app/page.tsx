/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DKvSMx6UnAP
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Image from "next/image";
import { PhotoAttributes } from "~/app/account/components/photo-attributes";
import JoinWaitlistDialog from "~/app/_components/join-waitlist-dialog";
import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/icons";

function Section() {
  return (
    <section className="mt-6 w-full bg-gradient-to-b from-white to-muted">
      <div className="container grid items-center gap-8 px-4 md:grid-cols-2 md:px-6">
        <div className="space-y-4">
          <Badge className="ml-2 border-0 bg-gradient-to-br from-black to-gray-400">
            Beta Sign-up
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Be Among the First to Experience Secure Decentralized Ticketing
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join our exclusive beta program and be the first revolutionize your
            event ticketing with our cutting-edge crypto-based platform. Unlock
            early access, exclusive perks, and the opportunity to shape the
            future of event ticketing.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <JoinWaitlistDialog />
            <div className="flex w-full items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CompassIcon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Early Access</div>
                <div className="text-sm text-muted-foreground">
                  Be the first to experience crypto ticketing with our platform.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WandIcon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Shape the Future</div>
                <div className="text-sm text-muted-foreground">
                  Provide feedback to help us build the best peer-to-peer
                  ticketing solution.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GiftIcon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Exclusive Perks</div>
                <div className="text-sm text-muted-foreground">
                  Enjoy special rewards and benefits as a beta tester.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AwardIcon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Become a Trailblazer</div>
                <div className="text-sm text-muted-foreground">
                  Be part of the journey to revolutionize event ticketing.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div>
            <Image
              src="/images/milad-fakurian-Di6Fcl7GCMk-unsplash.jpg"
              width={600}
              height={600}
              alt="sardo.ai"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center"
            />
            <PhotoAttributes
              className="pr-10 text-neutral-200"
              author={"Milad Fakurian"}
              url={
                "https://unsplash.com/photos/a-black-and-white-photo-of-a-cube-Di6Fcl7GCMk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
              }
            />
          </div>
          <div className="absolute bottom-4 left-4 rounded-md bg-background/80 px-3 py-2 text-sm font-medium">
            <ClockIcon className="mr-1 inline-block h-4 w-4" />
            <span>Launching Soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const AwardIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
};

const CalendarIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
};

const ClockIcon: React.FC<{ className?: string }> = (props) => {
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

const CompassIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

const GiftIcon: React.FC<{ className?: string }> = (props) => {
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
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
};

const WandIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
};

export default function Component() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <Section />
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">
                  Key Features
                </div>
                <h2 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose{" "}
                  <span className="flex w-fit items-center justify-center rounded-lg bg-gradient-to-br from-black to-gray-400 py-0 pl-4 text-white">
                    ENTRY
                    <Icons.LogoNoBg className="h-16 w-16" />
                  </span>
                  ?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our blockchain-based ticketing platform offers unparalleled
                  security and transparency, leveraging Soroban Smart Contracts
                  to ensure secure transactions and provide a frictionless
                  ticketing experience.
                </p>
                <Badge className="border-0 bg-gradient-to-br from-black to-gray-400">
                  What you sign is what you get, no hidden fees or surprises.
                </Badge>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Secure Transactions</h3>
                      <p className="text-muted-foreground">
                        Leverage the power of Stellar blockchain technology to
                        ensure secure and transparent ticket sales.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">
                        Easy Event Management
                      </h3>
                      <p className="text-muted-foreground">
                        Our intuitive platform simplifies event creation, ticket
                        distribution, and attendance tracking.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">
                        Seamless User Experience
                      </h3>
                      <p className="text-muted-foreground">
                        Manage your tickets, view event details, and access all
                        within your Web3 Wallet
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <Image
                  src="/images/milad-fakurian-Jv5Nbe3uLPI-unsplash.jpg"
                  width="550"
                  height="310"
                  alt="Foto de Milad Fakurian en Unsplash en Unsplash"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                />
                <PhotoAttributes
                  author="Milad Fakurian"
                  url="https://unsplash.com/es/fotos/un-grupo-de-objetos-flotando-en-el-aire-Jv5Nbe3uLPI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
