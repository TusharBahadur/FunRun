import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Paise → "₹149". */
export function formatInr(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}
