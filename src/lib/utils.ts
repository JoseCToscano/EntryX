import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Plurify a string based on a quantity.
 * @param singularText
 * @param quantity
 * @param customPlural
 */
export function plurify(
  singularText: string,
  quantity: number,
  customPlural?: string,
): string {
  if (quantity === 1) return singularText;
  if (customPlural) return customPlural;
  return `${singularText}s`;
}

export const noop = () => {
  return;
};

export function fromXLMToUSD(xlm: number) {
  return xlm * 0.09;
}
