# ldxh2333-spec.github.io

我的个人笔记，从有道云中同步到此。

## 一键更新

以后更新公开笔记，直接在仓库根目录执行：

```powershell
npm run notes:publish
```

这条命令会自动完成：

1. 找到 `H:\有道云笔记` 下最新的有道导出目录
2. 同步公开版笔记到 `docs/notes`
3. 本地构建 VitePress，先帮你检查一遍
4. 自动 `git add`、`git commit`、`git push`
5. 触发 GitHub Pages 自动部署

如果这次想手动指定导出目录或提交信息，也可以直接运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-notes.ps1 -SourceRoot "H:\有道云笔记\你的导出目录" -Message "更新实习总结"
```

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

- 默认收录技术学习、项目理解、问题解决、面试复盘，以及相对完整的实习总结
- 默认排除账号密码、敏感信息、纯计划、草稿、明显未完成的半成品内容
- 如需调整筛选规则，编辑 `scripts/sync-notes.cjs`

## 常用命令

```bash
$env:NOTES_ROOT="H:\\有道云笔记\\你的导出目录"; npm run docs:sync
npx -y node@20 npm run docs:build
npm run notes:publish
```

## 环境说明

- 当前本机 Node 版本低于 18 时，VitePress 可能无法本地构建
- GitHub Actions 已固定使用 Node 20，线上部署不受影响
