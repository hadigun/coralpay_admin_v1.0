import type { KeyValuePair, ToolType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { format, isValid } from "date-fns";
import Image, { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getId = (() => {
  return () => crypto.randomUUID();
})();

export function formatEntryDate(
  entryDate?: string,
  formatType?: string
): string {
  let formatString = "MMMM do, yyyy, HH:mm:ss";
  if (formatType === "short") formatString = "MMM d, yyyy";
  if (formatType === "long") formatString = "MMMM do, yyyy, HH:mm:ss";
  if (!entryDate || typeof entryDate !== "string") return "-";

  const parsed = new Date(entryDate);

  if (!isValid(parsed)) return "-";

  return format(parsed, formatString);
}

export const determineToolColor = (toolType: ToolType) => {
  switch (toolType) {
    case "display_text":
      return "text-green-600";
    case "plugin_router":
    case "plugin_apicall":
    case "plugin_payment":
      return "text-blue-600";
    case "input_text":
    case "input_number":
    case "input_email":
    case "input_phone":
    case "input_website":
      return "text-red-600";
    case "logic_set_variable":
      return "text-purple-600";
    default:
      return "";
  }
};

export const objectToKeyValuePairs = (
  obj?: Record<string, string>
): KeyValuePair[] => {
  if (!obj) return [{ key: "", value: "", id: getId() }];
  const pairs = Object.entries(obj).map(([key, value]) => ({
    key,
    value: value || "",
    id: getId(),
  }));

  return pairs.length > 0 ? pairs : [{ key: "", value: "", id: getId() }];
};

export const keyValuePairsToObject = (
  pairs: KeyValuePair[]
): Record<string, string> | undefined => {
  const filtered = pairs.filter((pair) => pair.key.trim() !== "");
  if (filtered.length === 0) return undefined;
  return filtered.reduce((acc, pair) => {
    acc[pair.key] = pair.value;
    return acc;
  }, {} as Record<string, string>);
};

export async function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function createImageIcon(src: StaticImageData, alt: string) {
  return (props?: React.ComponentProps<any>) => (
    <Image src={src} alt={alt} {...props} width={300} height={300} />
  );
}
