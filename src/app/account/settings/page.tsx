/**
 * v0 by Vercel.
 * @see https://v0.dev/t/KTwTv1OSwQC
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";

export default function Component() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 bg-muted/40 p-4 md:p-10">
        <div className="mx-auto grid max-w-6xl gap-8">
          <section>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[300px_1fr]">
              <nav className="grid gap-4 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="font-semibold text-primary"
                  prefetch={false}
                >
                  Profile
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Security
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Notifications
                </Link>
              </nav>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter a new password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button>Change Password</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Notification Settings</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[300px_1fr]">
              <nav className="grid gap-4 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="font-semibold text-primary"
                  prefetch={false}
                >
                  General
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Email Notifications
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Push Notifications
                </Link>
              </nav>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage your notification settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            New Event Invitations
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when you&apos;re invited to
                            new events.
                          </p>
                        </div>
                        <Switch id="new-event-invitations" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Event Reminders
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Get reminders for upcoming events you&apos;re
                            attending.
                          </p>
                        </div>
                        <Switch id="event-reminders" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Event Updates
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about changes to events
                            you&apos;re attending.
                          </p>
                        </div>
                        <Switch id="event-updates" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold">Billing</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[300px_1fr]">
              <nav className="grid gap-4 text-sm text-muted-foreground">
                <Link
                  href="#"
                  className="font-semibold text-primary"
                  prefetch={false}
                >
                  Payment Method
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Subscription
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground"
                  prefetch={false}
                >
                  Invoices
                </Link>
              </nav>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Update your payment information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="expiry-date">Expiry Date</Label>
                          <Input id="expiry-date" placeholder="MM/YY" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Payment Method</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                      View your current subscription details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Event Manager Pro
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Billed monthly
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$19.99</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Next Billing Date
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            August 1, 2023
                          </p>
                        </div>
                        <Button variant="outline">Cancel Subscription</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View your past invoices and payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Invoice #12345
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            July 1, 2023
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$19.99</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Invoice #12344
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            June 1, 2023
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$19.99</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function CalendarIcon(props) {
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
