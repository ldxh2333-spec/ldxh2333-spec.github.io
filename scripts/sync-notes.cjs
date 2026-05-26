const fs = require("fs");
const path = require("path");

const sourceRoot =
  process.env.NOTES_ROOT ||
  process.argv[2] ||
  "";

if (!sourceRoot) {
  console.error("Missing NOTES_ROOT. Set NOTES_ROOT to your exported notes folder.");
  process.exit(1);
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`Notes source not found: ${sourceRoot}`);
  process.exit(1);
}

const docsRoot = path.resolve(__dirname, "..", "docs");
const notesRoot = path.join(docsRoot, "notes");
const vitepressRoot = path.join(docsRoot, ".vitepress");
const sidebarFile = path.join(vitepressRoot, "sidebar.mjs");
const notesIndexFile = path.join(notesRoot, "index.md");
const homeFile = path.join(docsRoot, "index.md");
const siteDataFile = path.join(vitepressRoot, "site-data.json");

const allowedTopLevels = new Set([
  "前端学习笔记",
  "前端实习记录",
  "自学项目知识碎片",
  "八股项目",
  "面试题目记忆复盘",
  "刷题app项目"
]);

const excludedKeywords = [
  "项目账号密码",
  "敏感",
  "每日总结",
  "计划",
  "草稿",
  "无标题markdown",
  "冲突笔记",
  "初中数学",
  "我的资源",
  "短计划",
  "毕设计划",
  "markdown使用"
];

const assetExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".pdf"
]);

const groupOrder = [
  "学习笔记",
  "项目实践",
  "专题速记",
  "面试准备"
];

const sectionOrder = {
  "学习笔记": ["前端基础", "框架学习", "工程协作"],
  "项目实践": ["实习项目", "问题解决", "需求理解", "个人项目", "开发总结", "刷题 App"],
  "专题速记": ["Vue", "Axios", "JavaScript", "CSS", "异步编程", "TypeScript", "组件封装", "其他"],
  "面试准备": ["八股整理", "手撕题", "项目讲解", "项目复盘"]
};

const groupSummaries = {
  "学习笔记": "把基础知识和框架学习单独收拢，方便快速展示学习路线。",
  "项目实践": "集中放实习记录、需求理解和项目踩坑，更像真实经历输出。",
  "专题速记": "把零散语法和高频知识点整理成速记目录，便于查阅和复习。",
  "面试准备": "单独收纳八股、手撕题、项目讲解和复盘，更适合简历展示。"
};

const sectionSummaries = {
  "学习笔记": {
    "前端基础": "CSS、HTML 等基础内容。",
    "框架学习": "Vue 等前端框架相关内容。",
    "工程协作": "Git、版本管理和协作相关内容。"
  },
  "项目实践": {
    "实习项目": "实习期间参与的具体项目记录。",
    "问题解决": "开发中遇到的问题和解决方案。",
    "需求理解": "对业务需求和页面功能的理解记录。",
    "个人项目": "个人项目中的疑问、总结和复盘。",
    "开发总结": "阶段性开发总结和学习沉淀。",
    "刷题 App": "刷题 App 相关的想法和记录。"
  },
  "专题速记": {
    "Vue": "Vue 高频知识点和路由等速记内容。",
    "Axios": "Axios 使用和配置速记。",
    "JavaScript": "JavaScript 基础与数组等高频速记。",
    "CSS": "CSS 常忘知识点速记。",
    "异步编程": "Promise、Proxy 等内容速记。",
    "TypeScript": "TypeScript 速记内容。",
    "组件封装": "组件设计和封装相关记录。",
    "其他": "未归类但仍值得保留的技术速记。"
  },
  "面试准备": {
    "八股整理": "面试八股和基础巩固内容。",
    "手撕题": "手撕题和算法练习记录。",
    "项目讲解": "面试时如何讲项目的整理内容。",
    "项目复盘": "项目自我介绍和面试复盘记录。"
  }
};

const titleOverrides = {
  "30天牢固基础": "30 天基础巩固",
  "手撕题": "手撕题整理",
  "面试八股": "前端面试八股",
  "blog(简记)": "博客项目讲解",
  "云盘": "云盘项目讲解",
  "前端学习笔记/css笔记/css常用容易记混的属性样式": "CSS 常用易混属性",
  "git版本管理使用": "Git 版本管理使用",
  "Vue3": "Vue3 学习笔记",
  "vue2学习笔记": "Vue2 学习笔记",
  "vue3学习笔记（快速上手）": "Vue3 快速上手",
  "1.7公园基础数据管理": "公园基础数据管理",
  "1.开发中常用的数组方法": "开发中常用的数组方法",
  "12.30-文件下载导出": "文件下载导出",
  "2.1-12.31-git命令": "Git 命令速记",
  "2.git命令使用记忆": "Git 命令使用记忆",
  "Element-UI 表头自定义渲染函数": "Element-UI 表头自定义渲染",
  "elementui-show-overflow-tooltip": "ElementUI 文本溢出提示",
  "some,every用法速记": "some 和 every 用法速记",
  "养护考核管理": "养护考核管理需求",
  "开发日记总结": "开发日记总结",
  "做项目时的疑问": "做项目时的疑问",
  "1.1vue路由速记笔记": "Vue 路由速记",
  "1.2vue易忘知识点疑难点": "Vue 易忘知识点",
  "2.1axios速记笔记": "Axios 速记",
  "2.2axios—config使用速记": "Axios Config 使用速记",
  "3.1js容易遗忘的知识": "JavaScript 易忘知识",
  "3.2js中常用的数组速记": "JavaScript 数组速记",
  "4.1css易忘知识": "CSS 易忘知识",
  "5.1promise速记笔记": "Promise 速记",
  "5.2proxy速记笔记": "Proxy 速记",
  "6.1ts速记笔记": "TypeScript 速记",
  "vue组件封装": "Vue 组件封装",
  "博客": "博客项目复盘",
  "简介要求": "项目自我介绍",
  "面试题目记忆复盘/云盘": "云盘项目复盘"
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resetNotesRoot() {
  fs.rmSync(notesRoot, { recursive: true, force: true });
  ensureDir(notesRoot);
  ensureDir(vitepressRoot);
}

function walk(dir, visitor) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, visitor);
    } else if (entry.isFile()) {
      visitor(fullPath);
    }
  }
}

function normalizeParts(relativePath) {
  return relativePath.split(path.sep).filter(Boolean);
}

function hasExcludedKeyword(parts) {
  const lower = parts.join("/").toLowerCase();
  return excludedKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function isAllowedMarkdown(relativePath) {
  const parts = normalizeParts(relativePath);
  if (!parts.length) return false;
  if (!allowedTopLevels.has(parts[0])) return false;
  if (hasExcludedKeyword(parts)) return false;
  return path.extname(relativePath).toLowerCase() === ".md";
}

function isAllowedAsset(relativePath) {
  const parts = normalizeParts(relativePath);
  if (!parts.length) return false;
  if (!allowedTopLevels.has(parts[0])) return false;
  if (hasExcludedKeyword(parts)) return false;
  return assetExtensions.has(path.extname(relativePath).toLowerCase());
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function fileTitle(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function firstHeading(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function isRemoteLink(target) {
  return /^(?:[a-z]+:)?\/\//i.test(target) || target.startsWith("mailto:") || target.startsWith("#");
}

function sanitizeMarkdown(markdown, sourceFile) {
  return markdown.replace(/(!)?\[([^\]]*)\]\(([^)]+)\)/g, (full, bang, alt, rawTarget) => {
    const target = rawTarget.trim();
    if (!target || isRemoteLink(target)) {
      return full;
    }

    const cleanTarget = target.split("?")[0].split("#")[0];
    const resolvedPath = path.resolve(path.dirname(sourceFile), cleanTarget);

    if (fs.existsSync(resolvedPath)) {
      return full;
    }

    if (bang) {
      const label = alt || cleanTarget;
      return `> 注：原始笔记中的图片资源“${label}”未导出，公开版已省略。`;
    }

    return `\`${alt || cleanTarget}\`（原始附件未导出）`;
  });
}

function cleanTitle(rawTitle, relativePath = "") {
  const normalizedRelative = toPosix(relativePath).replace(/\.[^.]+$/i, "");

  if (titleOverrides[normalizedRelative]) {
    return titleOverrides[normalizedRelative];
  }

  if (titleOverrides[rawTitle]) {
    return titleOverrides[rawTitle];
  }

  let title = rawTitle
    .replace(/^\d+(?:\.\d+)*(?:[-_. ]*)/, "")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/[()（）]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!title) {
    return rawTitle;
  }

  return title;
}

function pickCheatsheetSection(title) {
  const lower = title.toLowerCase();

  if (lower.includes("vue")) return "Vue";
  if (lower.includes("axios")) return "Axios";
  if (lower.includes("js") || lower.includes("javascript") || title.includes("数组")) return "JavaScript";
  if (lower.includes("css")) return "CSS";
  if (lower.includes("promise") || lower.includes("proxy")) return "异步编程";
  if (lower.includes("ts") || title.includes("TypeScript")) return "TypeScript";
  if (title.includes("组件")) return "组件封装";
  return "其他";
}

function classifyPath(relativePath) {
  const parts = normalizeParts(relativePath);
  const topLevel = parts[0];
  const dirParts = parts.slice(1, -1);
  const baseName = fileTitle(parts[parts.length - 1]);
  const displayTitle = cleanTitle(baseName, relativePath);
  const ext = path.extname(relativePath);

  let group = "学习笔记";
  let section = "前端基础";

  if (topLevel === "前端学习笔记") {
    if (dirParts.includes("css笔记")) {
      group = "学习笔记";
      section = "前端基础";
    } else if (baseName.toLowerCase().includes("git")) {
      group = "学习笔记";
      section = "工程协作";
    } else {
      group = "学习笔记";
      section = "框架学习";
    }
  } else if (topLevel === "前端实习记录") {
    group = "项目实践";
    if (dirParts.includes("需求理解")) {
      section = "需求理解";
    } else if (dirParts.includes("实习过程中遇到的问题以及解决方法与知识点")) {
      section = "问题解决";
    } else {
      section = "实习项目";
    }
  } else if (topLevel === "自学项目知识碎片") {
    if (dirParts.includes("项目开发易忘语法知识")) {
      group = "专题速记";
      section = pickCheatsheetSection(displayTitle);
    } else if (dirParts.includes("做项目时的疑难记忆理解")) {
      group = "项目实践";
      section = "个人项目";
    } else {
      group = "项目实践";
      section = "开发总结";
    }
  } else if (topLevel === "八股项目") {
    group = "面试准备";
    if (dirParts.includes("两个项目的整体理解思路")) {
      section = "项目讲解";
    } else if (displayTitle.includes("手撕")) {
      section = "手撕题";
    } else {
      section = "八股整理";
    }
  } else if (topLevel === "面试题目记忆复盘") {
    group = "面试准备";
    section = "项目复盘";
  } else if (topLevel === "刷题app项目") {
    group = "项目实践";
    section = "刷题 App";
  }

  return {
    group,
    section,
    displayTitle,
    targetRelativePath: path.join("notes", group, section, `${displayTitle}${ext}`)
  };
}

function copySelectedFiles() {
  const collected = [];
  walk(sourceRoot, (fullPath) => {
    const relativePath = path.relative(sourceRoot, fullPath);
    const ext = path.extname(relativePath).toLowerCase();

    if (ext === ".md" && isAllowedMarkdown(relativePath)) {
      const classification = classifyPath(relativePath);
      const targetPath = path.join(docsRoot, classification.targetRelativePath);
      ensureDir(path.dirname(targetPath));

      const text = fs.readFileSync(fullPath, "utf8");
      const sanitized = sanitizeMarkdown(text, fullPath);
      fs.writeFileSync(targetPath, sanitized, "utf8");

      collected.push({
        group: classification.group,
        section: classification.section,
        sourceRelativePath: relativePath,
        targetRelativePath: classification.targetRelativePath,
        title: classification.displayTitle,
        heading: firstHeading(sanitized, classification.displayTitle),
        url: `/${toPosix(classification.targetRelativePath).replace(/\.md$/i, "")}`
      });
      return;
    }

    if (isAllowedAsset(relativePath)) {
      const classification = classifyPath(relativePath);
      const targetPath = path.join(docsRoot, classification.targetRelativePath);
      ensureDir(path.dirname(targetPath));
      fs.copyFileSync(fullPath, targetPath);
    }
  });

  return collected.sort((a, b) => {
    const groupDiff = groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group);
    if (groupDiff !== 0) return groupDiff;

    const aSectionOrder = sectionOrder[a.group] || [];
    const bSectionOrder = sectionOrder[b.group] || [];
    const sectionDiff = aSectionOrder.indexOf(a.section) - bSectionOrder.indexOf(b.section);
    if (sectionDiff !== 0) return sectionDiff;

    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function buildSidebar(entries) {
  const groupMap = new Map();

  for (const entry of entries) {
    if (!groupMap.has(entry.group)) {
      groupMap.set(entry.group, new Map());
    }

    const sectionMap = groupMap.get(entry.group);
    if (!sectionMap.has(entry.section)) {
      sectionMap.set(entry.section, []);
    }

    sectionMap.get(entry.section).push({
      text: entry.title,
      link: entry.url
    });
  }

  return groupOrder
    .filter((group) => groupMap.has(group))
    .map((group) => {
      const sectionMap = groupMap.get(group);
      const sections = (sectionOrder[group] || [])
        .filter((section) => sectionMap.has(section))
        .map((section) => ({
          text: section,
          collapsed: false,
          items: sectionMap.get(section)
        }));

      return {
        text: group,
        collapsed: false,
        items: sections
      };
    });
}

function writeSidebar(sidebar) {
  const content =
    "export const sidebar = " +
    JSON.stringify({ "/notes/": sidebar }, null, 2) +
    ";\n";
  fs.writeFileSync(sidebarFile, content, "utf8");
}

function writeNotesIndex(entries) {
  const totalNotes = entries.length;
  const lines = [
    "# 笔记导航",
    "",
    `当前公开整理了 **${totalNotes}** 篇笔记，按“学习笔记、项目实践、专题速记、面试准备”四条主线重新分组。`,
    "",
    "## 推荐阅读顺序",
    "",
    "1. 先看 `学习笔记`，了解基础和框架学习路线。",
    "2. 再看 `项目实践`，体现真实开发过程和问题解决能力。",
    "3. 用 `专题速记` 快速查看高频知识点。",
    "4. 最后看 `面试准备`，方便面试场景下快速复习。",
    ""
  ];

  for (const group of groupOrder) {
    const groupEntries = entries.filter((entry) => entry.group === group);
    if (!groupEntries.length) continue;

    lines.push(`## ${group}`);
    lines.push("");
    lines.push(groupSummaries[group] || "技术学习和实践沉淀。");
    lines.push("");

    for (const section of sectionOrder[group] || []) {
      const sectionEntries = groupEntries.filter((entry) => entry.section === section);
      if (!sectionEntries.length) continue;

      lines.push(`### ${section}`);
      lines.push(sectionSummaries[group]?.[section] || "相关主题整理。");
      lines.push("");
      lines.push(`- 共 ${sectionEntries.length} 篇`);
      lines.push("");
    }
  }

  fs.writeFileSync(notesIndexFile, lines.join("\n"), "utf8");
}

function writeHome(entries) {
  const totalNotes = entries.length;
  const totalGroups = new Set(entries.map((entry) => entry.group)).size;

  const lines = [
    "---",
    "layout: home",
    "",
    "hero:",
    "  name: 个人学习笔记",
    "  text: 面向简历展示的公开技术知识库",
    "  tagline: 把零散笔记重新整理成学习路线、项目实践、专题速记和面试准备四条主线。",
    "  actions:",
    "    - theme: brand",
    "      text: 浏览笔记",
    "      link: /notes/",
    "    - theme: alt",
    "      text: GitHub 仓库",
    "      link: https://github.com/ldxh2333-spec/ldxh2333-spec.github.io",
    "",
    "features:",
    "  - title: 结构更清晰",
    "    details: 不再直接暴露原始导出目录，而是按展示视角重新编排层级。",
    "  - title: 保留持续更新能力",
    "    details: 你继续在原笔记里写内容，重新同步后站点会自动落到新的分组结构。",
    "  - title: 更适合简历外链",
    "    details: 招聘方可以先看学习路线，再看项目实践和面试准备，阅读成本更低。",
    "---",
    "",
    "## 站点概览",
    "",
    `- 当前公开 ${totalNotes} 篇笔记`,
    `- 已整理为 ${totalGroups} 个一级栏目`,
    "- 内容由同步脚本自动筛选并生成",
    "",
    "## 当前一级栏目",
    "",
    "- 学习笔记：基础知识、框架学习、工程协作",
    "- 项目实践：实习项目、问题解决、需求理解、个人项目",
    "- 专题速记：Vue、Axios、JavaScript、CSS、TypeScript 等速查内容",
    "- 面试准备：八股、手撕题、项目讲解、项目复盘",
    ""
  ];

  fs.writeFileSync(homeFile, lines.join("\n"), "utf8");
}

function writeSiteData(entries) {
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRoot,
    totalNotes: entries.length,
    groups: groupOrder.filter((group) => entries.some((entry) => entry.group === group)),
    sections: Object.fromEntries(
      groupOrder.map((group) => [
        group,
        (sectionOrder[group] || []).filter((section) =>
          entries.some((entry) => entry.group === group && entry.section === section)
        )
      ])
    )
  };

  fs.writeFileSync(siteDataFile, JSON.stringify(payload, null, 2), "utf8");
}

function main() {
  resetNotesRoot();
  const entries = copySelectedFiles();
  const sidebar = buildSidebar(entries);
  writeSidebar(sidebar);
  writeNotesIndex(entries);
  writeHome(entries);
  writeSiteData(entries);

  console.log(`Synced ${entries.length} public notes from ${sourceRoot}`);
}

main();
