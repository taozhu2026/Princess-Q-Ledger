import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "公主Q的账本",
    short_name: "公主Q账本",
    description: "情侣共享记账，支持结算、统计和离线草稿。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#f7f3ec",
    lang: "zh-CN",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
