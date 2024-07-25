/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DKvSMx6UnAP
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

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
            href="#"
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure and Seamless Crypto Ticketing
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Revolutionize your event ticketing with our cutting-edge
                    crypto-based platform. Enjoy unparalleled security,
                    transparency, and a user-friendly experience.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                width="550"
                height="550"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
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
              <img
                src="/placeholder.svg"
                width="550"
                height="310"
                alt="Features"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
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
      <footer className="w-full bg-muted p-6 md:py-12">
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
              Crypto Tickets
            </Link>
            <Link href="#" prefetch={false}>
              Event Management
            </Link>
            <Link href="#" prefetch={false}>
              Blockchain Solutions
            </Link>
            <Link href="#" prefetch={false}>
              Integrations
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
            <h3 className="font-semibold">Contact</h3>
            <Link href="#" prefetch={false}>
              Sales
            </Link>
            <Link href="#" prefetch={false}>
              Support
            </Link>
            <Link href="#" prefetch={false}>
              Partnerships
            </Link>
            <Link href="#" prefetch={false}>
              Press
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TicketIcon(props) {
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
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
