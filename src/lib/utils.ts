import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function plurify(
  singularText: string,
  quantity: number,
  customPlural?: string,
): string {
  if (quantity === 1) return singularText;
  if (customPlural) return customPlural;
  return `${singularText}s`;
}
