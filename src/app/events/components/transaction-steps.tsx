"use client";
import React from "react";
import { api } from "~/trpc/react";
import { Icons } from "~/components/icons";
import { ClientTRPCErrorHandler, cn } from "~/lib/utils";
import { useWallet } from "~/hooks/useWallet";
interface TransactionStepsProps {
  assets: string[];
  processStep?: number;
  offerType?: "buy" | "sell";
}

export const TransactionSteps: React.FC<TransactionStepsProps> = ({
  assets,
  processStep,
  offerType = "buy",
}) => {
  const { publicKey } = useWallet();

  const trustline =
    api.stellarAccountRouter.createTrustlineTransaction.useMutation({
      onError: ClientTRPCErrorHandler,
    });

  const { data: hasTrustline, isLoading: isTrustlineLoading } =
    api.stellarAccountRouter.hasTrustline.useQuery(
      { id: publicKey!, items: assets },
      { enabled: !!publicKey && assets.length > 0 },
    );

  return (
    <div className="flex flex-row items-center justify-center px-6 text-xs">
      <div className="z-0 h-28 translate-x-2.5 border-[1px] border-black" />
      <div className="z-10 grid w-full max-w-md grid-cols-1 gap-4">
        {/* STEP 1: Manage Trustline */}
        <div className="flex items-center gap-4">
          <div
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
              <Icons.lock className="h-3 w-3" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              {offerType === "sell"
                ? "Verifying asset ownership"
                : hasTrustline
                  ? "Existing trustline"
                  : "Establishing Trustline"}
            </p>
          </div>
        </div>
        {/* STEP 2: OFFER */}
        <div className="flex items-center gap-4">
          <div
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
              <Icons.creditCard className="h-3 w-3" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <div className="text-muted-foreground">
              {offerType === "sell"
                ? "Building offer"
                : processStep && processStep > 2
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
              <Icons.settings className="h-3 w-3" />
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
              <Icons.check className="h-3 w-3" />
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
