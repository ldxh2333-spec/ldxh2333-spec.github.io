import { defineConfig } from "vitepress";
import { sidebar } from "./sidebar.mjs";

export default defineConfig({
  lang: "zh-CN",
  base: "/",
  title: "个人学习笔记",
  description: "公开版学习笔记与项目实践总结",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  markdown: {
    config(md) {
      md.set({ html: false });
    }
  },
  head: [
    ["meta", { name: "theme-color", content: "#0f766e" }]
  ],
  themeConfig: {
    logo: "/favicon.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "笔记", link: "/notes/" },
      { text: "GitHub", link: "https://github.com/ldxh2333-spec/ldxh2333-spec.github.io" }
    ],
    sidebar,
    outline: {
      level: [2, 3],
      label: "本页目录"
    },
    search: {
      provider: "local"
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇"
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/ldxh2333-spec/ldxh2333-spec.github.io" }
    ]
  }
});
