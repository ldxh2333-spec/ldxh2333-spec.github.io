# 切换分支 vs 合并/推送的关系

| 操作                 | 作用             | 是否需要        |
| ------------------ | -------------- | ----------- |
| `git checkout 分支名` | 切换本地代码版本       | **只做这个**    |
| `git merge`        | 合并其他分支的代码到当前分支 | 只有需要合并时才做   |
| `git push`         | 把本地提交上传到远程     | 只有本地有新提交时才做 |

# 目前开发中常用到的命令

## 1.日常开发流程（必会）

### `1. 开始工作前 —— 拉取最新代码`

`git pull origin dev`

### `2. 查看改了哪些文件`

`git status`

### `3. 添加到暂存区（准备提交）`

`git add .                    # 添加所有改动
git add src/views/park.vue   # 只添加某个文件`

### `4. 提交到本地仓库`

`git commit -m "feat: 公园设施列表增加导出功能"`

### `5. 推送到远程`

`git push origin 分支名`

## 2.分支操作

### 查看分支

git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支

### 切换分支

git checkout 分支名
git switch 分支名       # 新版本推荐

### 创建并切换分支

git checkout -b 新分支名
git switch -c 新分支名  # 新版本推荐

### 基于远程分支创建本地分支

git checkout -b 本地分支名 origin/远程分支名

## 3.合并与同步

### 拉取 = fetch + merge

git pull origin dev

### 单独步骤（想看改了什么再合并）

git fetch origin dev    # 下载远程代码
git merge origin/dev    # 合并到当前分支

### 合并其他分支到当前分支

git merge origin/feature/xxx

### 推送到远程

git push origin 分支名

## 4.撤销与回退

### 撤销工作区修改（改错了，恢复文件）

git checkout -- 文件名

### 撤销暂存区（add 错了）

git reset HEAD 文件名

### 回退到上一次提交（本地回退）

git reset --hard HEAD\~1

### 回退后强制推送（远程也回退，慎用）

git push origin 分支名 --force

## 查看与对比

### 查看提交历史

git log --oneline -10     # 简洁版最近10条
git log --graph           # 图形化分支图

### 查看文件改动

git diff                  # 工作区 vs 暂存区
git diff --cached         # 暂存区 vs 本地仓库
git diff HEAD\~1           # 上次提交 vs 当前

### 查看某文件修改历史

git log -p 文件名

## 项目中最常用的组合

### 场景：每天开始工作

git checkout dev
git pull origin dev
git checkout -b feature/今日开发\_你的名字

### 场景：提交今日代码

git add .
git commit -m "feat: 体育设施审批增加权限过滤"
git push origin feature/今日开发\_你的名字

### 场景：合并到测试分支

git checkout test-deploy-bj
git pull origin test-deploy-bj
git merge origin/feature/今日开发\_你的名字
git push origin test-deploy-bj
