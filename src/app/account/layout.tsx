"use client";
import React, { type ReactNode } from "react";
import { useWallet } from "~/hooks/useWallet";
import { api } from "~/trpc/react";
import Loading from "~/app/account/components/loading";
import { useRouter } from "next/navigation";

export default function AuthorizedPartners({
  children,
}: {
  children?: ReactNode;
}) {
  const { isLoading, publicKey } = useWallet();
  const router = useRouter();

  const isAuthorizedPartner =
    api.stellarAccountRouter.isAllowedPartner.useQuery(
      {
        publicKey: publicKey!,
      },
      { enabled: !!publicKey },
    );

  if (isAuthorizedPartner.isLoading || isLoading) {
    return <Loading />;
  }

  if (!isAuthorizedPartner.data && publicKey) {
    void router.push("/?joinWaitlist=true");
  }

  return <>{children}</>;
}
