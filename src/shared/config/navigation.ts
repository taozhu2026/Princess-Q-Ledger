import {
  ChartColumnBig,
  House,
  ReceiptText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "首页",
    icon: House,
  },
  {
    href: "/ledger",
    label: "账单",
    icon: ReceiptText,
  },
  {
    href: "/statistics",
    label: "统计",
    icon: ChartColumnBig,
  },
  {
    href: "/settings",
    label: "设置",
    icon: Settings,
  },
];
