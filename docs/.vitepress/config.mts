import { defineConfig } from "vitepress";
import { sidebar } from "./sidebar.mjs";

export default defineConfig({
  lang: "zh-CN",
  base: "/",
  title: "作品集与工作学习沉淀",
  description: "教育数字化项目作品集、AI 应用实践、工作复盘与个人学习笔记",
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
      { text: "综合作品集", link: "https://ldxh2333-spec.github.io/portfolio/general/" },
      { text: "SaaS AI 案例", link: "https://ldxh2333-spec.github.io/portfolio/" },
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
