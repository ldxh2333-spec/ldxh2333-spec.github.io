**所有命令均可在项目根目录直接复制粘贴。**

***

### 1. 只是撤销最后一次本地提交（**保留修改**）

bash复制

    git reset --soft HEAD~1

*   最后一次提交被“拆掉”，改动全部回到“已暂存”状态。
*   可重新修改、重新 commit 或放弃修改（`git restore .`）。

***

### 2. 撤销最后一次提交并**扔掉所有改动**

bash复制

    git reset --hard HEAD~1

*   提交记录 + 工作区改动全部消失，**真正回到上一次提交时的干净状态**。
*   **危险操作**，确认不再需要这些代码再执行。

***

### 3. 撤销**最近 N 次**提交（示例 N=3）

bash复制

    # 保留改动
    git reset --soft HEAD~3

    # 扔掉改动
    git reset --hard HEAD~3

***

### 4. 已经 push 到远程，要**回退远程分支**

bash复制

    # 本地先回退（假设扔掉改动）
    git reset --hard HEAD~1
    # 强制推送到远程（会重写历史，团队慎用）
    git push origin HEAD --force

**团队共享分支慎用！** 先沟通或改用 `git revert`（生成反向提交，不 rewrite 历史）。

***

### 5. 只想**修改刚才提交的注释**或**追加文件**

bash复制

    # 修改注释
    git commit --amend -m "新的提交信息"

    # 追加文件
    git add 漏掉的文件
    git commit --amend --no-edit

**注意**：若已 push，需要 `git push --force-with-lease` 同步远程。

***

### 6. 用图形界面（VSCode 示例）

1.  左侧「源代码管理」→ 点击「提交记录」→ 右键要回退到的版本 →\
    **「重置当前分支到此次提交」** → 选 **保留更改** 或 **硬重置**。
2.  若已 push 并需强制覆盖：命令行执行一次 `git push --force-with-lease` 即可。

***

### 🔍 一句话总结

*   **仅本地**：`git reset --soft/--hard HEAD~1`
*   **已推远程**：再 `git push --force-with-lease`（或 `git revert` 生成新提交）

按场景复制对应命令即可瞬间退回。
