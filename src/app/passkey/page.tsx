"use client";

import { useCorbado } from "@corbado/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StellarWallet from "~/app/passkey/components/stellar-wallet";

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

  if (!user) {
    return <Link href="passkey/signin">Sign in</Link>;
  }

  return (
    <div>
      <p>Welcome</p>
      <p>Hi {user?.name}, you are logged in.</p>
      <StellarWallet />
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default ProfilePage;
