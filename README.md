# lidexin.github.io

公开版个人学习笔记站，适合部署到 GitHub Pages 并作为简历作品链接展示。

## 本地使用

```bash
npm install
$env:NOTES_ROOT="H:\\有道云笔记\\你的导出目录"; npm run docs:sync
npx -y node@20 npm run docs:dev
```

## 部署说明

1. 先执行一次同步，把公开版笔记生成到 `docs/notes`
2. 推送到 `main` 分支
3. GitHub Actions 会自动构建并部署到 GitHub Pages

## 公开内容规则

- 默认收录技术学习、项目理解、实习问题总结、面试复盘
- 默认排除账号密码、敏感信息、每日总结、纯计划、草稿和无标题内容
- 如需调整筛选规则，编辑 `scripts/sync-notes.cjs`

## 常用命令

```bash
$env:NOTES_ROOT="H:\\有道云笔记\\你的导出目录"; npm run docs:sync
npx -y node@20 npm run docs:build
```

## 环境说明

- 当前本机 Node 版本低于 18 时，VitePress 可能无法本地构建
- GitHub Actions 已固定使用 Node 20，线上部署不受影响
