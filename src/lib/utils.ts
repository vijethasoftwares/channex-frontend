import { GlobalContext } from "@/components/providers";
import { clsx, type ClassValue } from "clsx";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SERVER_URL = import.meta.env.VITE_API;

export const useGlobalContext = () => useContext(GlobalContext);

// Additional utility functions

export function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function isEqual(obj1: any, obj2: any) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function debounce(func: Function, delay: number) {
  let debounceTimer: NodeJS.Timeout;
  return function (...args: any[]) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

export function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function (...args: any[]) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function flattenObject(ob: Record<string, any>): Record<string, any> {
  return Object.entries(ob).reduce((acc: Record<string, any>, [key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const flatObject = flattenObject(value);
      for (const [nestedKey, nestedValue] of Object.entries(flatObject)) {
        acc[`${key}.${nestedKey}`] = nestedValue;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function convertImagesToBase64(files: File[]): Promise<string[]> {
  const promises = Array.from(files).map((file) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(promises);
}
