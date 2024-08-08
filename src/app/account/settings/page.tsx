"use client";
import React from "react";
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
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import {
  getPublicKey,
  isConnected,
  signTransaction,
  signAuthEntry,
} from "@stellar/freighter-api";
import { Icons } from "~/components/icons";

export default function Component() {
  const [loading, setLoading] = React.useState(false);
  const validation = api.stellarAccountRouter.validateSignature.useMutation({
    onError: () => toast.error("Invalid Signature"),
    onSuccess: () => toast.success("Valid Signature"),
  });

  const verifySignature = async () => {
    setLoading(true);
    try {
      if (await isConnected()) {
        const publicKey = await getPublicKey();
        const signedXDR = await signTransaction("lorem-ipsum", {
          accountToSign: publicKey,
          network: "TESTNET",
        });
        await validation.mutateAsync({ xdr: signedXDR, publicKey });
      }
    } catch (e) {
      console.error(e);
      toast.error("Error getting public key");
    } finally {
      setLoading(false);
    }
  };

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
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="border-[1.5px] border-black bg-black px-4 text-white hover:bg-white hover:text-black"
                      disabled={loading}
                      onClick={verifySignature}
                    >
                      {loading ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
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
                    <Button className="border-[1.5px] border-black bg-black px-4 text-white hover:bg-white hover:text-black">
                      Change Password
                    </Button>
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
                          <h3 className="text-md font-semibold">
                            New offers on your listings
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when new offers are made on
                            your listings.
                          </p>
                        </div>
                        <Switch id="new-event-invitations" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-semibold">
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
                          <h3 className="text-md font-semibold">
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
        </div>
      </main>
    </div>
  );
}
