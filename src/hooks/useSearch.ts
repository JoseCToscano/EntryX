import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  // Debouncing the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      router.push(pathname + "?" + createQueryString("search", searchTerm));
    }, 300); // Adjust the delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [pathname, router, createQueryString, searchTerm]);

  function addToSeacrhParams(name: string, value: string) {
    router.push(pathname + "?" + createQueryString(name, value));
  }

  return {
    debouncedSearchTerm,
    searchTerm,
    setSearchTerm,
    searchParams,
    addToSeacrhParams,
  };
};
