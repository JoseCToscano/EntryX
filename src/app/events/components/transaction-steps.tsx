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
import { cn } from "~/lib/utils";
import { useWallet } from "~/hooks/useWallet";
interface TransactionStepsProps {
  assets: string[];
  processStep?: number;
}

export const TransactionSteps: React.FC<TransactionStepsProps> = ({
  assets,
  processStep,
}) => {
  const ctx = api.useContext();
  const { publicKey } = useWallet();

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

  const { data: hasTrustline, isLoading: isTrustlineLoading } =
    api.stellarAccountRouter.hasTrustline.useQuery(
      { id: publicKey as string, assetId: assets.at(0)! },
      { enabled: !!publicKey && assets.length > 0 },
    );

  const submitTransaction =
    api.stellarAccountRouter.submitTransaction.useMutation({
      onError,
      onSuccess: () => {
        void ctx.stellarAccountRouter.details.invalidate();
        toast.success("Transaction sent to blockchain successfully");
      },
    });

  const buy = api.stellarOffer.buy.useMutation({
    onError,
  });

  /**
   * Create a buy offer for the asset
   * @param assetId
   */
  const createBuyOffer = async (assetId: string) => {
    try {
      console.log("Buying asset:", assetId);
      if (!(await isConnected())) {
        await requestAccess();
      }
      if (!publicKey) {
        toast.error("Public key not found");
        return;
      }
      const xdr = await buy.mutateAsync({
        assetId,
        userPublicKey: publicKey,
        unitsToBuy: 1,
      });
      const signedXDR = await signTransaction(xdr, {
        network: "TESTNET",
        accountToSign: publicKey,
      });
      console.log("Signed XDR:", signedXDR);

      const res = await submitTransaction.mutateAsync({ xdr: signedXDR });
      void ctx.asset.availability.invalidate();
      console.log("Transaction submitted successfully:", res);
      toast.success("Offer created successfully");
    } catch (error) {
      toast.error("Failed to send buy offer");
      console.error("Error sending buy offer:", JSON.stringify(error));
    }
  };

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
      const signedXDR = await signTransaction(xdr, {
        network: "TESTNET",
        accountToSign: publicKey,
      });

      await submitTransaction.mutateAsync({ xdr: signedXDR });
      toast.success("Trustline established successfully");
    } catch (error) {
      toast.error("Failed to establish trustline");
      console.error("Error establishing trustline:", JSON.stringify(error));
    }
  };

  return (
    <div className="flex flex-row items-center justify-center px-6 text-xs">
      <div className="z-0 h-28 translate-x-2.5 border-[1px] border-black" />
      <div className="z-10 grid w-full max-w-md grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
          <button
            disabled={hasTrustline}
            onClick={() => {
              void establishTrustline(assets[0]);
            }}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground",
              hasTrustline &&
                "border-green-500 bg-green-500 p-0 text-green-500",
            )}
          >
            {hasTrustline ? (
              <Icons.checkCircleFill className="h-4 w-4 text-green-500" />
            ) : trustline.isPending || isTrustlineLoading ? (
              <Icons.spinner className="h-2 w-2 animate-spin" />
            ) : (
              <LockIcon className="h-3 w-3" />
            )}
          </button>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              {hasTrustline ? "Existing trustline" : "Establishing Trustline"}
            </p>
          </div>
        </div>
        {/* STEP 2: OFFER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              void createBuyOffer(assets[0]);
            }}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground",
              processStep &&
                processStep > 2 &&
                "border-green-500 bg-green-500 p-0 text-green-500",
            )}
          >
            {processStep && processStep > 2 ? (
              <Icons.checkCircleFill className="h-4 w-4 text-green-500" />
            ) : processStep === 2 ? (
              <Icons.spinner className="h-2 w-2 animate-spin" />
            ) : (
              <CreditCardIcon className="h-3 w-3" />
            )}
          </button>
          <div className="flex flex-1 flex-col">
            <div className="text-muted-foreground">
              {processStep && processStep > 2
                ? "Existing offer"
                : "Processing offer"}
            </div>
          </div>
        </div>
        {/* Step 3: Transaction */}
        <div className="flex items-center gap-4">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {processStep && processStep > 3 ? (
              <Icons.checkCircleFill className="h-4 w-4 text-green-500" />
            ) : processStep && processStep === 3 ? (
              <Icons.spinner className="h-2 w-2 animate-spin" />
            ) : (
              <SettingsIcon className="h-3 w-3" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              {processStep && processStep === 3
                ? "Executing the transaction"
                : "Transactional processing"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {processStep && processStep > 3 ? (
              <Icons.checkCircleFill className="h-4 w-4 text-green-500" />
            ) : (
              <CheckIcon className="h-3 w-3" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            {processStep && processStep > 3 ? (
              <p className="text-muted-foreground">
                You can now access your tickets on your wallet
              </p>
            ) : (
              <p className="text-muted-foreground">
                Waiting for the transaction to be confirmed on the blockchain
              </p>
            )}
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
