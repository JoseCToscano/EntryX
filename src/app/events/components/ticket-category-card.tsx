import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import React from "react";
import { api } from "~/trpc/react";
import { Icons } from "~/components/icons";
import { Skeleton } from "~/components/ui/skeleton";
import { type Asset as DBAsset } from "@prisma/client";
import Image from "next/image";

interface TicketCategoryCardProps {
  category: DBAsset;
  cart: Map<string, { asset: DBAsset; total: number }>;
  addToCart: (item: DBAsset) => void;
  removeFromCart: (item: DBAsset) => void;
  processStep: number;
}
export const TicketCategoryCard: React.FC<TicketCategoryCardProps> = ({
  category,
  processStep,
  addToCart,
  removeFromCart,
  cart,
}) => {
  const availability = api.asset.availability.useQuery(
    { assetId: category.id },
    { enabled: !!category.id },
  );

  return (
    <Card className="rounded-lg bg-gradient-to-br from-white to-primary-foreground p-4 shadow-sm hover:scale-[1.01]">
      <h3 className="text-lg font-bold">
        {category.label} {category.code}
        <p className="text-xs font-light">
          Available tickets:{" "}
          {availability.isLoading && (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          )}
          {availability.data?.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </h3>
      {/* <p className="text-muted-foreground">Desc...</p> */}
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center justify-start gap-2 text-2xl font-bold">
          <Image
            width={20}
            height={20}
            src={"/icons/stellar-xlm-logo.svg"}
            alt={"Stellar XLM icon"}
          />
          {Number(category.pricePerUnit).toLocaleString("en-US", {
            maximumFractionDigits: 2,
            maximumSignificantDigits: 2,
          })}{" "}
          XLM
        </span>
        {processStep === 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(category)}
            >
              -
            </Button>
            <span>{cart.get(category.id)?.total ?? 0}</span>
            <Button
              disabled={!availability?.data}
              variant="outline"
              size="sm"
              onClick={() => {
                if (availability.data! > 1) addToCart(category);
              }}
            >
              +
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export const TicketCategorySkeleton: React.FC = () => {
  return <Skeleton className="h-28 w-full" />;
};
