import { GlobalContext } from "@/components/providers";
import { clsx, type ClassValue } from "clsx";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SERVER_URL = import.meta.env.VITE_API;

export const useGlobalContext = () => useContext(GlobalContext);
