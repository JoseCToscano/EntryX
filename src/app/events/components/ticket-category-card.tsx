import { Card } from "~/components/ui/card";
import React from "react";
import { api } from "~/trpc/react";
import { Icons } from "~/components/icons";
import { Skeleton } from "~/components/ui/skeleton";
import { type Asset as DBAsset } from "@prisma/client";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

interface TicketCategoryCardProps {
  category: DBAsset;
  addToCart: (item: DBAsset) => void;
  selected: boolean;
}
export const TicketCategoryCard: React.FC<TicketCategoryCardProps> = ({
  category,
  addToCart,
  selected,
}) => {
  const availability = api.asset.availability.useQuery(
    { assetId: category.id },
    { enabled: !!category.id },
  );

  return (
    <Card
      onClick={() => {
        addToCart(category);
      }}
      className={cn(
        "cursor-pointer rounded-lg bg-gradient-to-br from-white to-primary-foreground p-4 shadow-sm hover:shadow-md",
        selected && "bg-gradient-to-br from-white to-muted-foreground",
      )}
    >
      <h3 className="text-lg font-bold">
        {category.label}
        <Badge className="ml-2">{category.code}</Badge>
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
            minimumFractionDigits: 2,
            maximumSignificantDigits: 2,
          })}{" "}
          XLM
        </span>
      </div>
    </Card>
  );
};

export const TicketCategorySkeleton: React.FC = () => {
  return <Skeleton className="h-28 w-full" />;
};
