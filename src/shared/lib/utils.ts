import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `${year}年${Number(month)}月`;
}

export function formatShortDate(value: string) {
  return format(new Date(value), "M月d日 EEEE", { locale: zhCN });
}

export function formatTime(value: string) {
  return format(new Date(value), "HH:mm");
}

export function formatRelativeMonth(value: string) {
  return format(new Date(`${value}-01T00:00:00`), "yyyy年M月", {
    locale: zhCN,
  });
}

export function clampCurrencyInput(value: string) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/[^\d.]/g, "");
  const [integer = "", decimal = ""] = normalized.split(".");

  return decimal ? `${integer}.${decimal.slice(0, 2)}` : integer;
}

export function copyText(value: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.reject(new Error("clipboard unavailable"));
  }

  return navigator.clipboard.writeText(value);
}
