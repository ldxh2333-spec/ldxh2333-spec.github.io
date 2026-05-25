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

const categorySummaries = {
  "前端学习笔记": "Vue、CSS、Git 等前端基础学习记录。",
  "前端实习记录": "实习期间遇到的问题、需求理解与解决方法。",
  "自学项目知识碎片": "项目开发中的易忘语法、封装技巧与踩坑总结。",
  "八股项目": "面试准备、知识框架与项目讲解思路。",
  "面试题目记忆复盘": "常见面试题和复盘记录。",
  "刷题app项目": "刷题 App 相关的思路与实现记录。"
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

function copySelectedFiles() {
  const collected = [];
  walk(sourceRoot, (fullPath) => {
    const relativePath = path.relative(sourceRoot, fullPath);
    const ext = path.extname(relativePath).toLowerCase();

    if (ext === ".md" && isAllowedMarkdown(relativePath)) {
      const targetPath = path.join(notesRoot, relativePath);
      ensureDir(path.dirname(targetPath));
      const text = fs.readFileSync(fullPath, "utf8");
      const sanitized = sanitizeMarkdown(text, fullPath);
      fs.writeFileSync(targetPath, sanitized, "utf8");
      const parts = normalizeParts(relativePath);
      collected.push({
        category: parts[0],
        relativePath,
        title: firstHeading(sanitized, fileTitle(relativePath)),
        url: `/notes/${toPosix(relativePath).replace(/\.md$/i, "")}`
      });
      return;
    }

    if (isAllowedAsset(relativePath)) {
      const targetPath = path.join(notesRoot, relativePath);
      ensureDir(path.dirname(targetPath));
      fs.copyFileSync(fullPath, targetPath);
    }
  });

  return collected.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category, "zh-CN");
    }
    return a.relativePath.localeCompare(b.relativePath, "zh-CN");
  });
}

function buildSidebar(entries) {
  const grouped = new Map();

  for (const entry of entries) {
    if (!grouped.has(entry.category)) {
      grouped.set(entry.category, []);
    }
    grouped.get(entry.category).push({
      text: entry.title,
      link: entry.url
    });
  }

  const sections = [];
  for (const [category, items] of grouped.entries()) {
    sections.push({
      text: category,
      collapsed: false,
      items
    });
  }

  return sections;
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
  const counts = [...new Set(entries.map((entry) => entry.category))].map((category) => ({
    category,
    count: entries.filter((entry) => entry.category === category).length
  }));

  const lines = [
    "# 笔记总览",
    "",
    `当前公开收录 **${totalNotes}** 篇技术笔记，适合直接作为 GitHub Pages 作品集展示。`,
    "",
    "## 分类",
    ""
  ];

  for (const item of counts) {
    lines.push(`### ${item.category}`);
    lines.push(categorySummaries[item.category] || "技术学习与实践记录。");
    lines.push("");
    lines.push(`- 共 ${item.count} 篇`);
    lines.push("");
  }

  fs.writeFileSync(notesIndexFile, lines.join("\n"), "utf8");
}

function writeHome(entries) {
  const totalNotes = entries.length;
  const totalCategories = new Set(entries.map((entry) => entry.category)).size;

  const lines = [
    "---",
    "layout: home",
    "",
    "hero:",
    "  name: 个人学习笔记",
    "  text: 面向简历展示的公开技术知识库",
    "  tagline: 从前端学习、项目实践到面试复盘，把零散笔记整理成结构化输出。",
    "  actions:",
    "    - theme: brand",
    "      text: 开始阅读",
    "      link: /notes/",
    "    - theme: alt",
    "      text: GitHub Pages 部署说明",
    "      link: https://docs.github.com/pages",
    "",
    "features:",
    "  - title: 内容筛选后公开",
    "    details: 默认排除敏感信息、账号密码、每日总结和草稿，减少简历外链风险。",
    "  - title: 按主题自动归档",
    "    details: 自动生成导航和目录结构，后续只要同步笔记即可更新站点。",
    "  - title: 适合写进简历",
    "    details: 页面结构清晰，招聘方可以直接浏览你的学习路线、项目理解和问题总结。",
    "---",
    "",
    "## 站点概览",
    "",
    `- 当前公开 ${totalNotes} 篇笔记`,
    `- 覆盖 ${totalCategories} 个主题分类`,
    "- 内容来自有道云笔记导出后的公开版整理",
    "",
    "## 推荐你后续继续补充的内容",
    "",
    "- 每个项目补一篇“项目介绍 / 技术栈 / 难点 / 收获”总结",
    "- 每周新增 1 到 2 篇质量较高的专题文章，而不是继续堆草稿",
    "- GitHub 仓库首页再补一个简洁 README，和这个站点互相跳转",
    ""
  ];

  fs.writeFileSync(homeFile, lines.join("\n"), "utf8");
}

function writeSiteData(entries) {
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRoot,
    totalNotes: entries.length,
    categories: [...new Set(entries.map((entry) => entry.category))]
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
