/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DKvSMx6UnAP
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import Image from "next/image";
import { PhotoAttributes } from "~/app/account/components/photo-attributes";

function Section() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-muted py-12 md:py-24 lg:py-32">
      <div className="container grid items-center gap-8 px-4 md:grid-cols-2 md:px-6">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
            Beta Sign-up
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Be Among the First to Experience Secure Crypto Ticketing
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join our exclusive beta program and be the first revolutionize your
            event ticketing with our cutting-edge crypto-based platform. Unlock
            early access, exclusive perks, and the opportunity to shape the
            future of event ticketing.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Join the Waitlist
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              className="pr-6 text-neutral-200"
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
      <div className="container mt-8 px-4 md:px-6">
        <div className="flex items-center gap-4 rounded-md bg-background p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            <blockquote>
              &ldquo;We&apos;re thrilled to bring fair, secure, and transparent
              ticketing to the world. No more fraud or abusive fees, just
              peer-to-peer ticketing powered by the blockchain!&rdquo;
            </blockquote>
            <div className="mt-2 font-medium">
              - The entryx.me Development Team
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing" className="text-sm">
              I agree to receive marketing communications.
            </Label>
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
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <TicketIcon className="h-6 w-6" />
          <span className="sr-only">Crypto Tickets</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-sm font-medium underline-offset-4 hover:underline"
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="/account/events"
            className="text-sm font-medium underline-offset-4 hover:underline"
            prefetch={false}
          >
            Events
          </Link>
          <Link
            href="#"
            className="text-sm font-medium underline-offset-4 hover:underline"
            prefetch={false}
          >
            About
          </Link>
          <Link
            href="#"
            className="text-sm font-medium underline-offset-4 hover:underline"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <Section />
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose Crypto Tickets?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our crypto-based ticketing platform offers unparalleled
                  security, transparency, and a seamless user experience for
                  event organizers and attendees alike.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Secure Transactions</h3>
                      <p className="text-muted-foreground">
                        Leverage the power of blockchain technology to ensure
                        secure and transparent ticket sales.
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
                        Provide your attendees with a frictionless ticketing
                        experience, from purchase to entry.
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Past Events
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Events Powered by Crypto Tickets
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the events that have successfully leveraged
                  our crypto-based ticketing platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              <div className="rounded-lg bg-background p-4 shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="550"
                  height="310"
                  alt="Event 1"
                  className="mx-auto aspect-video overflow-hidden rounded-lg object-cover object-center"
                />
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold">Music Festival 2023</h3>
                  <p className="text-muted-foreground">
                    Successful crypto-powered ticketing for a 3-day music
                    festival with over 20,000 attendees.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="rounded-lg bg-background p-4 shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="550"
                  height="310"
                  alt="Event 2"
                  className="mx-auto aspect-video overflow-hidden rounded-lg object-cover object-center"
                />
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold">Tech Conference 2024</h3>
                  <p className="text-muted-foreground">
                    Seamless crypto ticketing for a 2-day tech conference with
                    over 5,000 attendees.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="rounded-lg bg-background p-4 shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="550"
                  height="310"
                  alt="Event 3"
                  className="mx-auto aspect-video overflow-hidden rounded-lg object-cover object-center"
                />
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold">Art Exhibit 2023</h3>
                  <p className="text-muted-foreground">
                    Successful crypto ticketing for a 2-week art exhibit with
                    over 10,000 visitors.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Trusted by Event Organizers
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from our satisfied customers about their experience with
                Crypto Tickets.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-background p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">
                      Event Organizer, Music Festival 2023
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  &quot;Crypto Tickets made our music festival a huge success.
                  The\n platform&apos;s security and seamless user experience
                  were\n crucial in delivering a great event for our
                  attendees.&quot;
                </p>
              </div>
              <div className="rounded-lg bg-background p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Jane Lee</p>
                    <p className="text-sm text-muted-foreground">
                      Event Organizer, Tech Conference 2024
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  &quot;Crypto Tickets&apos; platform was a game-changer for our
                  tech\n conference. The easy event management tools and\n
                  crypto-powered ticketing made our lives so much easier.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const TicketIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
};
