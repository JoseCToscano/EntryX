/**
 * v0 by Vercel.
 * @see https://v0.dev/t/eyJbJCFyU2g
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import { Icons } from "~/components/icons";

export default function Component() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex-1 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Reselling Made Easy
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Discover the benefits of reselling your tickets
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What is Reselling?</h2>
              <p className="mt-2 text-muted-foreground md:text-lg">
                Reselling is the process of purchasing tickets and then selling
                them to other interested buyers. Our decentralized ticketing
                platform allows users to easily resell their tickets, providing
                more accessibility and transparency in the ticket market.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">The Reselling Process</h2>
              <ol className="mt-2 space-y-4 text-muted-foreground md:text-lg">
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Purchase Tickets</h3>
                    <p>
                      Buy tickets for an event through our platform using your{" "}
                      <Link
                        className="text-blue-500 underline underline-offset-4"
                        href={"https://www.freighter.app"}
                      >
                        {" "}
                        Freighter wallet{" "}
                      </Link>
                      .
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">List for Resale</h3>
                    <p>
                      Start an auction for your tickets on our platform by
                      leveraging{" "}
                      <Link
                        className="text-blue-500 underline underline-offset-4"
                        href={"https://stellar.org/soroban"}
                      >
                        {" "}
                        Soroban{" "}
                      </Link>{" "}
                      Smart Contracts.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Sell to Buyers</h3>
                    <p>
                      Once a buyer is interested, they will submit their bids by
                      invoking the smart contract.
                    </p>
                    The highest bidder will win
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Receive Payment</h3>
                    <p>
                      The exchange takes place and you&apos;ll receive your
                      payment directly to your Wallet.
                    </p>
                    Ticket ownership will be automatically transferred to the
                    buyer&apos;s wallet.
                  </div>
                </li>
              </ol>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Benefits of Reselling</h2>
              <ul className="mt-2 space-y-4 text-muted-foreground md:text-lg">
                <li className="flex items-start gap-4">
                  <Icons.TicketIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Increased Earnings</h3>
                    <p>
                      Reselling tickets leverages market conditions to maximize
                      your earnings.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Icons.InfoIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Transparency</h3>
                    <p>
                      The decentralized nature of our platform ensures
                      transparent and fair ticket resale transactions.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Icons.MaximizeIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Earn Extra Income</h3>
                    <p>
                      Reselling tickets on our platform can provide an
                      additional revenue stream for ticket holders.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
