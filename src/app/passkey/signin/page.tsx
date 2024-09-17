"use client";

import { CorbadoAuth, useCorbado } from "@corbado/react";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const { user } = useCorbado();
  const router = useRouter();
  const onLoggedIn = () => {
    void router.push("/passkey");
  };

  if (user) {
    onLoggedIn();
  }

  return <CorbadoAuth onLoggedIn={onLoggedIn} />;
};

export default AuthPage;
