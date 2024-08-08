import { useEffect, useState } from "react";
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
import { noop } from "~/lib/utils";

export const useWallet = () => {
  const [hasFreighter, setHasFreighter] = useState<boolean>(false);
  const [isFreighterAllowed, setIsFreighterAllowed] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>();
  const [network, setNetwork] = useState<string>();

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
    isConnected()
      .then((connected) => {
        if (connected) {
          // Request access, if not already allowed
          isAllowed()
            .then((allowed) => {
              if (allowed) {
                setIsFreighterAllowed(true);
                // Fetch network
                getNetwork()
                  .then((network) => setNetwork(network))
                  .catch(() => toast.error("Error getting network"));
                // Fetch public key
                getPublicKey()
                  .then((k) => setPublicKey(k))
                  .catch(() => toast.error("Error getting public key"));
              }
            })
            .catch(() => toast.error("Error requesting Freighter Wallet"));
        } else {
          toast.error("Freighter extension not installed");
        }
      })
      .catch(() => toast.error("Error connecting Wallet"));

    const fetchWalletData = () => {
      isConnected()
        .then((connected) => {
          if (connected) {
            // Request access, if not already allowed
            isAllowed()
              .then((allowed) => {
                setIsFreighterAllowed(allowed);
                if (allowed) {
                  // Fetch network
                  getNetwork()
                    .then((network) => setNetwork(network))
                    .catch(() => toast.error("Error getting network"));
                  // Fetch public key
                  getPublicKey()
                    .then((k) => setPublicKey(k))
                    .catch(() => toast.error("Error getting public key"));
                }
              })
              .catch(() => toast.error("Error requesting Freighter Wallet"));
          } else {
            toast.error("Freighter extension not installed");
          }
        })
        .catch(() => toast.error("Error connecting Wallet"));
    };

    const intervalId = setInterval(fetchWalletData, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

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
  };
};
