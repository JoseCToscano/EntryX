"use client";
import { useEffect, useMemo, useState } from "react";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getNetwork,
  getPublicKey,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { Horizon } from "@stellar/stellar-sdk";

export const useWallet = () => {
  const [hasFreighter, setHasFreighter] = useState<boolean>(false);
  const [isFreighterAllowed, setIsFreighterAllowed] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>();
  const [network, setNetwork] = useState<string>();
  const [trustline, setTrustline] = useState<{ [key: string]: number }>({});

  const { data, isLoading } = api.stellarAccountRouter.details.useQuery(
    {
      id: publicKey!,
    },
    {
      enabled: !!publicKey,
      refetchIntervalInBackground: true,
      refetchInterval: 5000,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  useEffect(() => {
    console.log("data", data?.balances);
    const tl = trustline;
    data?.balances?.forEach((b) => {
      if (b.asset_type === "credit_alphanum12") {
        tl[b.asset_code] = Number(b.balance);
      }
    });
    console.log("trustline", tl);
    setTrustline(tl);
  }, [data]);

  useEffect(() => {
    const fetchWalletData = () => {
      isConnected()
        .then((connected) => {
          if (connected) {
            setHasFreighter(true);
            // Request access, if not already allowed
            isAllowed()
              .then((allowed) => {
                setIsFreighterAllowed(allowed);
                if (allowed) {
                  setIsFreighterAllowed(true);
                  // Fetch network
                  getNetwork()
                    .then((network) => setNetwork(network))
                    .catch(() => toast.error("Error getting network"));
                  // Fetch public key
                  getPublicKey()
                    .then((k) => {
                      if (k) setPublicKey(k);
                    })
                    .catch(() => toast.error("Error getting public key"));
                } else {
                  setIsFreighterAllowed(false);
                }
              })
              .catch(() => toast.error("Error requesting Freighter Wallet"));
          } else {
            console.log("is not connected");
            setHasFreighter(false);
          }
        })
        .catch(() => toast.error("Error connecting Wallet"));
    };
    fetchWalletData();

    const intervalId = setInterval(fetchWalletData, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  async function connect() {
    setAllowed()
      .then((allowed) => {
        if (allowed) {
          setIsFreighterAllowed(true);
          // Fetch network
          getNetwork()
            .then((network) => setNetwork(network))
            .catch(() => toast.error("Error getting network"));
          // Fetch public key
          requestAccess()
            .then((k) => {
              if (k) {
                setPublicKey(k);
              } else {
                setPublicKey(undefined);
              }
            })
            .catch(() => toast.error("Error getting public key"));
        } else {
          setIsFreighterAllowed(false);
        }
      })
      .catch(() => toast.error("Error requesting Freighter Wallet"));
  }

  useEffect(() => {
    console.log("hasFreighter", hasFreighter);
  }, [hasFreighter]);

  async function signXDR(xdr: string) {
    if (!isFreighterAllowed) {
      await setAllowed()
        .then((allowed) => setIsFreighterAllowed(allowed))
        .catch(() => toast.error("Error requesting access"));
    }
    const publicKey = await requestAccess().catch(() =>
      toast.error("Error requesting access"),
    );
    setPublicKey(publicKey);
    const currentNetwork = await getNetwork();
    setNetwork(currentNetwork);
    return signTransaction(xdr, {
      accountToSign: publicKey,
      network: currentNetwork,
    });
  }

  return {
    publicKey,
    network,
    isLoading,
    account: data,
    signXDR,
    hasFreighter,
    isFreighterAllowed,
    connect,
    trustline,
  };
};
