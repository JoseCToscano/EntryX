"use client";
import { DisplayEvents } from "../_components/events/display-events";
import { useWallet } from "~/hooks/useWallet";
import { ConnectWallet } from "~/app/wallet/connect/connect-component";
import React from "react";
import Loading from "~/app/account/components/loading";

export default function MyEventPage() {
  const { publicKey, isLoading } = useWallet();

  if (!publicKey) {
    return <ConnectWallet redirectTarget="/my-tickets" />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return <DisplayEvents fromUserKey={publicKey} />;
}
