"use client";

import { useCorbado } from "@corbado/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StellarWallet from "~/app/passkey/components/stellar-wallet";
import { Button } from "~/components/ui/button";

const ProfilePage: React.FC = () => {
  const { loading, isAuthenticated, user, logout } = useCorbado();
  const router = useRouter();

  if (loading) {
    // Render loading state
  }

  if (!isAuthenticated || !user) {
    // Render not logged in state
  }

  const onLogout = () => {
    void logout();
    router.push("/passkey/signin");
  };

  // if (!user) {
  //   return <Link href="passkey/signin">Sign in</Link>;
  // }

  return (
    <div>
      <StellarWallet />
    </div>
  );
};

export default ProfilePage;
