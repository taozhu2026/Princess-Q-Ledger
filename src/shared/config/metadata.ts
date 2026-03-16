import type { Metadata } from "next";

import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/app";

export const ROOT_METADATA: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export function createPageMetadata(
  title: string,
  description = APP_DESCRIPTION,
): Metadata {
  return {
    title,
    description,
  };
}

export function createAbsolutePageMetadata(
  title: string,
  description = APP_DESCRIPTION,
): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
  };
}
