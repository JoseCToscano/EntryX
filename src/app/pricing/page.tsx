import { Card } from "~/components/ui/card";
import { Fees } from "~/constants";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Pricing() {
  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto py-12">
        <div className="mx-4 space-y-12 md:mx-6 lg:mx-8">
          <div>
            <h1 className="mb-4 text-4xl font-bold">Transparent Pricing</h1>
            <p className="text-muted-foreground">
              Our event ticketing platform offers a fair and transparent pricing
              structure for all stakeholders.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="flex flex-col space-y-4 rounded-lg bg-card p-6">
              <h2 className="text-2xl font-bold">For Users</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-medium">{Fees.SERVICE_FEE} XLM</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We charge a fixed transparent service fee to cover the cost of
                processing your ticket purchase. That all goes to platform
                maintenance and to further development of the{" "}
                <span className="text-sm font-semibold text-black">
                  ENTRY
                  <Icons.Logo className="-mt-1 inline h-5 w-5" />
                </span>{" "}
                platform.
              </p>
              <Link href="/events" className="mt-4 pt-4">
                <Button
                  variant="ghost"
                  className="group h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                >
                  Browse events
                  <Icons.expandingArrow className="ml-2 inline h-4 w-4" />
                </Button>
              </Link>
            </Card>
            <Card className="flex flex-col space-y-4 rounded-lg bg-card p-6">
              <h2 className="text-2xl font-bold">For Event Organizers</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Publishing Fee</span>
                  <span className="font-medium">
                    {Fees.SELLER_PUBLISHING_FEE} XLM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Commission</span>
                  <span className="font-medium">
                    {Fees.SELLER_UNITARY_COMMISSION_PERCENTAGE}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-medium">{Fees.SERVICE_FEE} XLM</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We charge a publishing fee to list your event and a commission
                on each ticket sold to cover our operating costs. The service
                fee is fixed and goes to platform maintenance and development.
              </p>
              <Link href="/account" className="mt-4 pt-4">
                <Button
                  variant="ghost"
                  className="group h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                >
                  Request access
                  <Icons.expandingArrow className="ml-2 inline h-4 w-4" />
                </Button>
              </Link>
            </Card>
            <Card className="flex flex-col space-y-4 rounded-lg bg-card p-6">
              <h2 className="text-2xl font-bold">For Resellers</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Publishing Fee</span>
                  <span className="font-medium">
                    {Fees.RESELLER_PUBLISHING_FEE} XLM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Commission</span>
                  <span className="font-medium">
                    {Fees.RESELLER_UNITARY_COMMISSION_PERCENTAGE}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We charge a one-time auction opening fee and a significant
                commission on each ticket sold, but don&apos;t worry, your
                earnings may be maximized by our auction-based reselling system.
              </p>
              <Link href="/reselling" className="mt-4 pt-4">
                <Button
                  variant="ghost"
                  className="group h-8 w-full border-[1px] border-black bg-black text-white hover:bg-white hover:text-black"
                >
                  Learn more
                  <Icons.expandingArrow className="ml-2 inline h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
      <div className="mx-12 flex rounded-md bg-muted p-4 text-center text-muted-foreground">
        <p>
          Stellar stands out as one of the most cost-effective blockchain
          networks, offering exceptionally low transaction fees. On our
          platform, each user is responsible for covering their own network
          fees, ensuring transparency and fairness.{" "}
          <Link
            className="text-blue-500 underline"
            href="https://stellar.org/learn/the-power-of-stellar"
            target="_blank"
          >
            Learn more about why we chose Stellar.
          </Link>
        </p>
      </div>
    </div>
  );
}
