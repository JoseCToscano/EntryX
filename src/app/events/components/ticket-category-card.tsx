import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import React from "react";
import { type Asset } from "@prisma/client";
import { api } from "~/trpc/react";
import { Icons } from "~/components/icons";
import { Skeleton } from "~/components/ui/skeleton";

interface TicketCategoryCardProps {
  category: Asset;
  cart: Map<string, number>;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
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
    <Card className="rounded-lg bg-background p-4 shadow-sm">
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
        <span className="text-2xl font-bold">
          $
          {Number(category.pricePerUnit).toLocaleString("en-US", {
            maximumFractionDigits: 2,
            maximumSignificantDigits: 2,
          })}
        </span>
        {processStep === 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(category.id)}
            >
              -
            </Button>
            <span>{cart.get(category.id) ?? 0}</span>
            <Button
              disabled={!availability?.data}
              variant="outline"
              size="sm"
              onClick={() => {
                if (availability.data! > 1) addToCart(category.id);
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
