import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useCart = () => {
  const [assetId, setAssetId] = useState("");
  const [amount, setAmount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with provided key/value pairs
  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        params.set(key, value);
      });

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    if (searchParams.has("assetId")) {
      setAssetId(searchParams.get("assetId") ?? "");
    }
    if (searchParams.has("amount")) {
      setAmount(Number(searchParams.get("amount")) || 0);
    }
  }, [searchParams]);

  function addToSearchParams(params: Record<string, string>) {
    console.log("params", params);
    void router.push(pathname + "?" + createQueryString(params));
  }

  return {
    assetId,
    amount,
    addToSearchParams,
  };
};
