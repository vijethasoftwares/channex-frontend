import { GlobalContext } from "@/components/providers";
import { clsx, type ClassValue } from "clsx";
import { differenceInCalendarDays } from "date-fns";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SERVER_URL = import.meta.env.VITE_API;

export const useGlobalContext = () => useContext(GlobalContext);

export function deepClone(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export function isEqual(obj1: unknown, obj2: unknown) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// export function debounce(func: Function, delay: number) {
//   let debounceTimer: NodeJS.Timeout;
//   return  (...args: any[]) => {
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     const context = this as any;
//     clearTimeout(debounceTimer);
//     debounceTimer = setTimeout(() => func.apply(context, args), delay);
//   };
// }

// export function throttle(func: Function, limit: number) {
//   let inThrottle: boolean;
//   return function (...args: any[]) {
//     const context = this;
//     if (!inThrottle) {
//       func.apply(context, args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// }

export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenObject(ob: Record<string, any>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy<T, K extends keyof any>(
  list: T[],
  keyGetter: (input: T) => K
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  list.forEach((item) => {
    const key = keyGetter(item);
    let collection = map.get(key);
    if (!collection) {
      collection = [];
      map.set(key, collection);
    }
    collection.push(item);
  });
  return map;
}

export function groupByProperties<T>(
  items: T[],
  keys: (keyof T)[]
): Array<{ [K in keyof T]?: T[K] } & { data: T[] }> {
  const groups = items.reduce((result, item) => {
    const groupKey = keys
      .map((key) => item[key])
      .join("-")
      .replace(/\s/g, "-");
    if (!result[groupKey]) {
      result[groupKey] = keys.reduce(
        (group, key) => ({ ...group, [key]: item[key] }),
        {} as T & { data: T[] } // Update the type of `result` to include the `data` property
      );
      result[groupKey].data = [];
    }
    result[groupKey].data.push(item);
    return result;
  }, {} as Record<string, T & { data: T[] }>);

  return Object.values(groups);
}

export const getDifferenceInMonthsAndDays = (from: Date, to: Date) => {
  let diffInDays = differenceInCalendarDays(to, from);
  const diffInMonths = Math.floor(diffInDays / 30);
  diffInDays = diffInDays % 30;

  let result = "";

  if (diffInMonths > 0) {
    result += `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;
  }

  if (diffInDays > 0) {
    result += `${result ? " and " : ""}${diffInDays} day${
      diffInDays > 1 ? "s" : ""
    } stay`;
  }

  return result || "Same day stay";
};
