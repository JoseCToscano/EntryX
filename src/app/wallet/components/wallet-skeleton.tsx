"use client";
import { Icons } from "~/components/icons";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function WalletSkeleton() {
  return (
    <div className="flex w-full flex-col">
      <main className="flex-1 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <Icons.StellarIcon />
                Stellar Account
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex gap-8">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-40" />
              </div>{" "}
              <div className="flex gap-8">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-40" />
              </div>{" "}
              <div className="flex gap-8">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="mt-10 h-6 w-40" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
