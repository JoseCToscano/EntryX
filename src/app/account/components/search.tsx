"use client";
import React from "react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface SearchProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
}
export const Search: React.FC<SearchProps> = ({
  className,
  value,
  onChange,
}) => {
  return (
    <div>
      <Input
        id="search"
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("md:w-[100px] lg:w-[500px]", className)}
      />
    </div>
  );
};
