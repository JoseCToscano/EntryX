"use client";
import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { TRPCClientErrorLike } from "@trpc/client";
import { Icons } from "~/components/icons";
import useFreighter from "~/hooks/useFreighter";
import {
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";
import { Networks, Horizon, TransactionBuilder } from "@stellar/stellar-sdk";
interface TransactionStepsProps {
  assets: string[];
}

const userSignTransaction = async (
  xdr: string,
  network: string,
  signWith: string,
) => {
  let signedTransaction = "";
  let error = "";

  try {
    console.log('"hello from userSignTransaction"');
    signedTransaction = await signTransaction(xdr, {
      network,
      accountToSign: signWith,
    });
    console.log("World");
  } catch (e) {
    console.error("Error signing transaction:", e);
    error = e;
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};

export const TransactionSteps: React.FC<TransactionStepsProps> = ({
  assets,
}) => {
  const ctx = api.useContext();
  const { publicKey } = useFreighter();

  function onError({ data, message }: TRPCClientErrorLike<any>) {
    console.log("data:", data);
    console.log("message:", message);
    const errorMessage = data?.zodError?.fieldErrors;
    if (message) {
      toast.error(message);
    } else if (errorMessage) {
      toast.error(errorMessage?.description);
    } else {
      if (data?.code === "INTERNAL_SERVER_ERROR") {
        toast.error("We are facing some issues. Please try again later");
      } else if (data?.code === "BAD_REQUEST") {
        toast.error("Invalid request. Please try again later");
      } else if (data?.code === "UNAUTHORIZED") {
        toast.error("Unauthorized request. Please try again later");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Failed to register! Please try again later");
      }
    }
  }
  const trustline =
    api.stellarAccountRouter.createTrustlineTransaction.useMutation({
      onError,
    });

  const submitTransaction =
    api.stellarAccountRouter.submitTransaction.useMutation({
      onError,
      onSuccess: () => {
        void ctx.stellarAccountRouter.details.invalidate();
        toast.success("Buy offer created successfully");
      },
    });

  const buy = api.stellarOffer.buy.useMutation({
    onError,
    onSuccess: () => {
      void ctx.stellarAccountRouter.details.invalidate();
      toast.success("Buy offer created successfully");
    },
  });

  const establishTrustline = async (assetId: string) => {
    try {
      if (!(await isConnected())) {
        await requestAccess();
      }
      if (!publicKey) {
        toast.error("Public key not found");
        return;
      }
      const xdr = await trustline.mutateAsync({
        assetId,
        userPublicKey: publicKey,
      });
      console.log("unsignedTransaction:", xdr);
      console.log("publicKey:", publicKey);
      console.log(Networks.TESTNET);
      const signedXDR = await signTransaction(xdr, {
        network: "TESTNET",
        accountToSign: publicKey,
      });
      console.log("Signed XDR:", signedXDR);

      // await submitTransaction.mutateAsync({ xdr: signedXDR });
      toast.success("Trustline established successfully");
    } catch (error) {
      toast.error("Failed to establish trustline");
      console.error("Error establishing trustline:", JSON.stringify(error));
    }
  };

  return (
    <div className="flex flex-row items-center justify-center px-6 text-xs">
      <div className="z-0 h-32 translate-x-2.5 border-[1px] border-black" />
      <div className="z-10 grid w-full max-w-md grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              void establishTrustline(assets[0]);
            }}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {trustline.isPending ? (
              <Icons.spinner className="h-2 w-2 animate-spin" />
            ) : (
              <UserIcon className="h-3 w-3" />
            )}
          </button>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Establishing Trustline</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              void buy.mutateAsync({ assetId: assets[0] });
            }}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {buy.isPending ? (
              <Icons.spinner className="h-2 w-2 animate-spin" />
            ) : (
              <LockIcon className="h-3 w-3" />
            )}
          </button>
          <div className="flex flex-1 flex-col">
            <div className="text-muted-foreground">
              Creating buy offer for the asset.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CreditCardIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Processing offer</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SettingsIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Executing the transaction</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              You&apos;re all set! You can now access your tickets on your{" "}
              <a href="/wallet">wallet</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
};

const CreditCardIcon: React.FC<{ className?: string }> = (props) => {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
};

const LockIcon: React.FC<{ className?: string }> = (props) => {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
};

const SettingsIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

const UserIcon: React.FC<{ className?: string }> = (props) => {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};
