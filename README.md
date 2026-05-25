# GitHub Pages Notes Site

这个目录是公开版学习笔记站点，适合部署到 GitHub Pages。

## 本地使用

```bash
npm install
$env:NOTES_ROOT="H:\\有道云笔记\\你的导出目录"; npm run docs:dev
```

## 发布到 GitHub Pages

1. 新建仓库，优先使用 `你的用户名.github.io`
2. 先执行一次同步，把公开版笔记生成到 `docs/notes`
3. 把这个目录内容推到仓库根目录
4. 在 GitHub 仓库 `Settings > Pages` 中确认来源为 `GitHub Actions`
5. 推送到 `main` 分支后会自动构建并部署

## 公开内容规则

- 默认收录技术学习、项目理解、实习问题总结、面试复盘
- 默认排除账号密码、敏感信息、每日总结、纯计划、草稿、无标题内容
- 如需调整规则，编辑 `scripts/sync-notes.cjs`

## 常用命令

```bash
$env:NOTES_ROOT="H:\\有道云笔记\\你的导出目录"; npm run docs:sync
npx -y node@20 npm run docs:dev
npx -y node@20 npm run docs:build
```

## 环境说明

- 当前本机 `Node` 版本如果低于 `18`，`VitePress` 可能无法本地构建
- GitHub Actions 已固定使用 `Node 20`，线上部署不受影响
