import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "ja-JP",
  base: "/kcg-wiki/",
  title: "神椿TCG非公式Wiki",
  description: "KCG Unofficial Wiki",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "1600x1600",
        href: "/kcg-wiki/paper_camellia.png",
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "カードリスト", link: "/cardlist" },
      { text: "ルール", link: "/rules" },
      { text: "裁定リスト", link: "/judgment" },
    ],

    socialLinks: [
      { icon: "x", link: "https://x.com/kamitsubakicard" },
      { icon: "discord", link: "https://discord.gg/WkN2n9Whe2" },
    ],
  },
});
