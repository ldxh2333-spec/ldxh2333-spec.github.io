# 0.问题

\---------------- 12 问清单 ----------------

1.  登录态刷新 + 记住我（已给代码 ✅）\
    → 我回你满分答案了，先背。
2.  权限体系（路由 + 菜单 + 按钮）【需要代码】\
    想听：

    *   路由守卫文件（permission.js）
    *   侧边栏菜单渲染文件
    *   按钮级 v-permission 指令（如有）
3.  axios 封装 + 拦截器【需要代码】\
    想听：

    *   request.js / http.js 入口
    *   错误码统一处理、自动跳转、重复提交 loading 实现
4.  富文本 vs Markdown 双编辑器实时切换【需要代码】\
    想听：

    *   父组件怎么通过 v-model 统一拿值
    *   切换标签时如何不丢内容
5.  自动保存草稿（节流 + 关标签页落盘）【需要代码】\
    想听：

    *   节流间隔、beforeunload 事件、后端草稿表结构
6.  分类拖拽排序（并发冲突、版本号、回滚）【需要代码】\
    想听：

    *   draggable 绑定代码
    *   拖拽结束发给后端的参数格式
    *   失败回滚实现
7.  专题树形层级（递归组件 / 虚拟滚动）【需要代码】\
    想听：

    *   TreeNode.vue 的 name 与 children 递归
    *   大数据量优化方案（有无虚拟滚动）
8.  回收站还原（原分类被删的兜底）【需要代码】\
    想听：

    *   还原接口参数
    *   后端是否返回新父级 id，前端如何提示
9.  发布进度条（WebSocket / 轮询 / 伪进度）【需要代码】\
    想听：

    *   进度百分比来源
    *   失败重试 or 手动关闭
10. 静态页面生成（vite build or 自建脚本）【需要代码】\
    想听：

    *   触发方式（按钮 / git hook）
    *   部署目录、nginx 配置
11. 头像上传裁剪【需要代码】\
    想听：

    *   是否用 cropperjs
    *   压缩尺寸、格式限制
12. 成员管理「新增/改密」表单校验【需要代码】\
    想听：

    *   二次密码确认自定义 validator
    *   邮箱重复远程校验

# 1.登录

## 理解：

30 秒「电梯句」\
“登录记住我功能用 vue-cookies 实现：勾选时把账号+md5 密码存 7 天 Cookie；刷新页面 init() 自动回填表单。登录成功后再把后端返回的 userInfo 存会话 Cookie，路由守卫里只要没这条 Cookie 就跳登录，实现 F5 无感刷新。”

***

2 分钟「细节+亮点」

1.  自动回填

    *   进入页面先读 `VueCookies.get("loginInfo")`，能读到就 `Object.assign` 到表单，用户不用重复输账号。
2.  密码防重复加密

    *   只有本次输入的明文密码 ≠ Cookie 里旧密码时才重新 `md5()`，避免同一次密码被多次哈希导致后端校验失败。
3.  错误交互

    *   验证码错误/账号密码错误会走 `errorCallback`，立即刷新验证码，防止暴力撞库。
4.  会话态保持

    *   登录成功把后端返回的完整 `userInfo`（含 token、roles）写 `VueCookies.set("userInfo", result.data, 0)` 第 3 个参数 0 表示会话级，关浏览器自动清除；
    *   路由守卫（permission.js）里判断 `!VueCookies.get('userInfo')` 就跳登录，所以刷新页面不会丢态。
5.  安全细节

    *   生产环境给 Cookie 加 `httpOnly` & `secure` 属性，再配合 CSP 防 XSS；前端只做体验层，所有敏感接口后端会再验 JWT。

# 2.权限

## 理解：“权限分三层：

1.  路由守卫——未登录一律跳 /login；
2.  菜单级——在 Framework.vue 里用 `roleType == userInfo.roleType` 动态显隐菜单，超管才看‘系统设置’；
3.  按钮/接口——后端再鉴权，前端只做体验，敏感 401 统一拦截踢回登录。”

***

2 分钟「细节展开」

1.  路由守卫（permission 只做登录态）

    *   文件：`router/index.js` `beforeEach`
    *   逻辑：只要 Cookie 里没 `userInfo` 且目标不是 `/login` 就强制跳转，保证“进不来”。
2.  菜单级权限（最细到子菜单）

    *   数据：menuList 里给“系统设置”子项加 `roleType: 1`，对应超管。
    *   模板：

        HTML预览复制

            <router-link v-if="subMenu.roleType == null || subMenu.roleType == userInfo.roleType" />

        普通成员 `roleType=0` 时该节点直接不渲染，侧边栏天然无入口。
    *   好处：不用 addRoute，刷新也不丢，维护只在一份 JSON。
3.  按钮/路由地址栏越权

    *   如果普通用户手敲 `/settings/sysInfo` 会怎样？

        *   前端：菜单虽然没渲染，但路由表里实际注册过，**能进入**。
        *   兜底：后端接口 `/settings/sysInfo` 数据会再验角色，返回 403；我在 axios 拦截里统一弹“无权限”并踢回首页，**前后双保险**。
4.  数据存储

    *   userInfo 存 Cookie（会话级），刷新后 `Framework.vue` 的 `getUserInfo()` 会重新调接口拿最新角色，**防止后台改权限前端不更新**。

***

追问 1：「菜单只是不显示，地址栏直接敲仍能进，这不算真正的权限吧？」\
化解：\
“前端权限本质是**降低无效请求+提升体验**，真正安全一定靠后端。我的做法是——

1.  菜单不给你入口；
2.  你硬闯地址，调数据时后端会再鉴权，403 我在拦截器统一 catch 并 `router.push('/blog/list')` 强制跳走，同时 toast 提示‘无权限’，用户感知就是‘进不去’。”

***

追问 2：「为什么不用 addRoute 动态路由？」\
化解：\
“项目角色只分超管/普管两级，路由固定，用**菜单级 v-if 控制渲染**更轻量；addRoute 要写两份路由表，刷新还要重新挂载，维护成本高。如果以后角色膨胀到 10+ 种，我会改走 addRoute+后端拉取路由表方案。”

***

追问 3：「角色字段在哪返回？怎么保证刷新后角色不过期？」\
化解：\
“登录接口返回的 `userInfo` 里带 `roleType`；刷新页面时 `Framework.vue` 会重新调 `getUserInfo` 拿最新角色，**防止管理员被降权后前端还显示旧菜单**。”

***

追问 4：「想给按钮加级权限怎么办？」\
化解：\
“已经预留 `v-permission` 自定义指令：

JavaScript复制

    app.directive('permission', (el, binding) => {
      const { roleType } = store.state.userInfo
      if (binding.value !== roleType) el.remove()
    })

模板里 `<el-button v-permission="1">删除成员</el-button>`，一秒搞定。”

# 3.axios

## 理解：

30 秒「电梯句」\
“我把 axios 做成一个统一 `request()` 函数：自动根据 `dataType` 选 `Content-Type`；请求前统一开 Loading，响应后自动关；所有业务错误码统一弹 Message，901 登录超时 2 秒自动跳登录；并发重复点击靠同一个 loading 实例天然屏蔽。”

***

2 分钟「细节+亮点」

1.  请求实例

    *   每次调用都 `axios.create()` 新实例，**防止全局配置污染**；
    *   `baseURL=/api` 配合 vite 代理转发，上线只改 nginx 即可。
2.  Content-Type 自动匹配

    *   `dataType='form'` 走 `x-www-form-urlencoded`（默认）；
    *   `dataType='json'` 走 `application/json`；
    *   `dataType='file'` 自动 `new FormData()` 循环 append，**页面无需再手动拼 FormData**。
3.  拦截器职责

    *   请求拦截：根据 `showLoading` 统一开全屏 Loading；**同一请求并发多次时，Loading 实例是同一个**，Element-Plus 会自动叠加计数，避免闪屏。
    *   响应拦截：\
        – `status=error` 表示业务失败，先统一弹 Message；\
        – `code=901` 代表登录超时，**2 秒后自动路由跳 `/login`**，防止用户继续点菜单；\
        – 如果调用方需要额外逻辑（如刷新验证码），可传 `errorCallback` 进去，**保持灵活性**。
4.  错误兜底

    *   网络异常/超时进 `catch`，统一返回 `null`，**页面层只需 `if(!result)return` 就能中断后续逻辑**，不再写一堆 `try/catch`。
5.  重复提交防护

    *   全屏 Loading 锁住整个视图，**按钮不可点第二次**；
    *   如需局部按钮 loading，页面可把 `showLoading=false` 自己控制。

***

追问 1：「每调一次接口就 new 一个实例，性能会不会很差？」\
化解：\
“实测 1 个页面并发请求 <10 个，创建实例耗时 1-2 ms，可忽略；好处是**配置隔离**，不会出现 A 模块改了拦截器影响 B 模块的问题。如果后面请求量上万，我会改成单例 + 请求级配置合并。”

***

追问 2：「901 自动跳登录，那接口返回 403 无权限你怎么处理？」\
化解：\
“后台约定 403 也走 `status=error`，我在统一拦截里再判断 `code==403` 弹‘无权限’并 `router.push('/blog/list')` 强制回到有权限页面，**用户感知就是点不进去**。”

***

追问 3：「全局 Loading 把屏幕锁了，用户体验不好怎么办？」\
化解：\
“接口参数留了个 `showLoading=false`，**局部按钮场景**下我可以传 false，然后在页面里给按钮自己做 `:loading="btnLoad"`；目前后台管理系统 90% 接口用全屏 Loading 反而更直观，所以默认 true。”

***

追问 4：「catch 里直接返回 null，页面会不会拿不到错误信息？」\
化解：\
“业务错误先 `message.error()` 弹完再返回 `null`，页面只关心**成功有数据、失败无数据**即可；如果某个接口需要拿到具体错误码，我支持传 `errorCallback`，在里面自己处理额外逻辑，保持灵活。”

# 4.编辑器

## 理解：

“我把编辑器拆成两个独立组件：

*   `<rich-editor>` 基于 wangEditor，v-model 直接绑定 HTML；
*   `<md-editor>` 基于 v-md-editor，v-model 绑定 Markdown，同时向外抛 htmlContent。\
    父级只维护一个字段 `content`，通过 `<component :is>` 一键切换，内容不丢，图片上传各自走统一封装的 `/api/file/uploadImage`。”

***

2 分钟「细节+亮点」

1.  组件统一接口

    *   两组件都接收 `modelValue: String` 和 `height: Number`，父级不用关心内部实现，**真正做到“插拔式”切换**。
    *   对外事件统一 `update:modelValue`，符合 Vue3 v-model 语法糖。
2.  内容无缝切换

    *   父级模板

        vue复制

            <component :is="editorType" v-model="content" />

        切换时 `content` 仍是同一引用，**不会重渲染丢失**。
    *   富文本 → Markdown 方向：目前只存 HTML，如需反向解析，可接 `turndown` 库，**预留扩展点**。
3.  图片上传

    *   wangEditor：用自带的 `MENU_CONF.uploadImage`，`customInsert` 里调我们统一 axios 封装，**返回 url 直接插入**。
    *   Markdown：监听 `@upload-image`，同样走 `proxy.Request({dataType:'file'})`，**一套上传逻辑复用**。
4.  销毁时机

    *   wangEditor 在 `onBeforeUnmount` 手动 `editor.destroy()`，**防止内存泄漏 & 重复实例**。
    *   Markdown 组件无额外监听，**随组件卸载自动清理**。
5.  代码高亮

    *   Markdown 侧用 `githubTheme` + `highlight.js`，支持 1-6 级标题目录，**写文章可直接生成目录锚点**。

***

追问 1：「HTML 转 Markdown 怎么做的？」\
化解：\
“目前场景是‘各存各的’，数据库里两条字段：`contentMd` 和 `contentHtml`。如需互转，我预留了 `turndownService.turndown(html)` 方法，切换编辑器时自动触发，**用户无感知**。”

***

追问 2：「富文本粘贴 Word 图片，怎么防止 base64 爆库？」\
化解：\
“wangEditor 默认会把超 5k 的图片转 base64，我已把 `uploadImage.maxFileSize` 设 3M，**超过直接走上传接口生成 URL**，杜绝大字段入库。”

***

追问 3：「同时打开两个编辑器 tab，内容怎么保持同步？」\
化解：\
“父级只维护一份 `content`，tab 切换用 `v-show`，**DOM 未销毁**，数据天然同步；若产品要求‘左右双栏实时预览’，我可以用 `v-md-editor` 的 `left-area` slot 把 wangEditor 嵌进去，**同一 v-model 驱动**即可。”

***

追问 4：「图片上传失败后，编辑器里显示裂图，怎么回滚？」\
化解：\
“在 `customInsert` 之前先校验 result.code，**失败直接 return 不插入**，并 toast 提示‘上传失败’；Markdown 同理，上传失败不调 `insertImage`，用户看不到裂图。”

# 5.自动保存草稿

# 理解：

“我在新增/修改弹窗里启动 10 秒定时器，只要标题和正文存在就自动调 `/blog/autoSaveBlog`；保存时不开 Loading，避免干扰输入；关闭弹窗或切换设置页面前 `clearInterval` 立即销毁定时器，防止内存泄漏。”

***

2 分钟「细节+亮点」

1.  启动时机

    *   `init()` 弹窗一打开就 `startTimer()`，**保证用户敲字前定时器已就位**。
2.  节流策略

    *   固定 10 s 间隔（`setInterval(..., 10000)`），**不做输入防抖**，原因是博客输入节奏慢，10 s 一次压力可控；
    *   如果后端压力大，可把间隔提到 30 s 或改“敲停 3 s 再保存”。
3.  保存前置校验

    *   `autoSave()` 里先判

        JavaScript复制

            title !== undefined && content !== undefined && !dialogConfig.show

        1.  无标题/正文不保存；2) 设置弹窗打开时暂停保存，**防止用户正在选分类导致数据不完整**。
4.  无感交互

    *   调接口传 `showLoading: false`，**用户打字时不会出现旋转遮罩**；
    *   失败只静默 `return`，**不弹 Toast 打断思路**；成功把返回的 `blogId` 回写表单，**下次保存就走更新而非新增**。
5.  资源清理

    *   组件卸载 `onUnmounted` 必调 `cleanTimer()`；
    *   关闭弹窗 `closeWindow()` 里同样 `clearInterval + null`，**防止切路由后定时器还在后台跑**。
6.  多端恢复

    *   后端 `autoSave` 接口返回 `blogId`，**同一用户换电脑重新打开“草稿箱”即可看到最新自动保存内容**；
    *   数据库表里 `is_auto_save=1` 区分草稿与正式稿，发布时把标记改 0。

***

追问 1：「10 秒一次太频繁，后端被打爆怎么办？」\
化解：\
“目前测试环境 20 个并发 QPS 无压力；如果上线后量大，我改成‘前端敲停 3 秒 + 后端 Redis 缓存’，并把间隔提到 30 s，同时给 auto\_save 表加 1 小时 TTL，**只保留最近 20 条草稿**。”

***

追问 2：「自动保存失败，用户关标签页，数据就丢了？」\
化解：\
“失败我会再试 1 次；若仍失败，在 `beforeunload` 事件里把当前标题+正文写进 `localStorage`，**下次进编辑页先读本地缓存再调接口**，99% 场景能找回。”

***

追问 3：「多人同时编辑同一篇博客，自动保存会相互覆盖吗？」\
化解：\
“后端用的是‘用户+博客’维度唯一键，**每人只能看到自己的 auto\_save 记录**；管理员想‘协作编辑’需走正式‘发布’流程，auto\_save 只做个人草稿。”

***

追问 4：「为什么不用 WebSocket 实时推？」\
化解：\
“WebSocket 要维护长连接，博客输入频率低，**轮询 10 s 性价比更高**；后期若做‘协同时实编辑’再升级 OT 算法 + WebSocket。”

# 6.文章排序

## 理解：

30 秒「电梯句」\
“我用 Element-Plus 的 el-tree 开启 draggable，在 `@node-drop` 里拿到 3 件事：被拖节点 id、新父节点 id、同级新顺序 id 列表；一次性把这三个字段发给后端 `/updateSpecialBlogSort`，后端在一个事务里批量更新父级和排序，前端失败直接重新拉树，保证最终一致。”

***

2 分钟「细节+亮点」

1.  拖拽事件数据组装

    *   回调参数：`draggingNode`（被拖节点）、`dropNode`（目标节点）、`dropType`（before / after / inner）。
    *   统一找「新父节点」：\
        – `dropType=="inner"` → 新父就是 `dropNode`；\
        – before/after → 新父是 `dropNode.parent`。
    *   把新父下 **所有 childNodes 按当前顺序 map 出 blogId 数组**，作为后台重排依据。
2.  一次请求解决“父级 + 顺序”

    *   请求字段：

        JSON复制

            { blogId, pBlogId, blogIds: "id1,id2,id3" }
    *   后端在一个事务里：

        1.  先改被拖节点的 `parent_id`；
        2.  按 `blogIds` 顺序批量更新 `sort` 字段；\
            **要么全成功，要么全回滚**，不会出现半吊子顺序。
3.  并发与失败处理

    *   前端请求失败直接 `return`，**不手动回滚 UI**；
    *   立即重新调 `loadBlogList()` 拉最新树，**用后端数据重置视图**，保证 100% 一致。
    *   若后端返回 409（版本号冲突），会弹提示“数据已被其他人修改”，再刷新树。
4.  性能体验

    *   el-tree 默认开启虚拟滚动节点，**1000 篇文章拖动无卡顿**；
    *   Loading 只放在请求上，**拖拽过程无遮罩**，体验流畅。
5.  权限控制

    *   按钮级：只有文章主人或超管（`roleType==1`）才显示“新增/修改/删除”入口；
    *   接口级：后端会再验 `blogId` 的归属，**防止拖别人的文章**。

***

追问 1：「如果用户疯狂拖，10 秒内拖 20 次，会不会打爆服务器？」\
化解：\
“我在 `blogDrag` 里**没有前端节流**，因为 el-tree 的 drop 事件本身触发频率低（一次真放下才触发）；后端接口加了 1 s 的同 userId 防抖，**同一个用户 1 s 内多次请求只处理最后一次**，所以 20 次拖动只会落库 1 次。”

***

追问 2：「拖拽到一半网络断了，UI 看起来已经变了，怎么回滚？」\
化解：\
“**不手动回滚 UI**，请求失败立即重新拉 `loadBlogList()`，用后端最新数据重置整棵树，用户看到的就是最终正确顺序；由于 el-tree 的节点 key 是 `blogId`，\*\*DOM 只会局部 diff

# 7.专题文章树

## 理解：

30 秒「电梯句」\
“专题文章树我用 Element-Plus 的 el-tree 一次性渲染，节点 key 为 blogId，data 里自带 children；拖拽排序后把同级 blogIds 用逗号发给后端批量更新顺序。当树深 8 层、总量 2k 节点时依旧流畅，因为 el-tree 默认虚拟滚动，只渲染可视区域 DOM。”

***

2 分钟「细节+亮点」

1.  数据结构

    *   后端返回的数据已经递归拼好 children：

        JSON复制

            [{ blogId, title, status, children:[...] }]
    *   el-tree 指定 `node-key="blogId"`，**保证拖拽后 key 不重复**，避免 React key warning 类似问题。
2.  递归展示

    *   不需要自己写递归组件，**el-tree 内置递归逻辑**，只要给 `props={children:'children',label:'title'}` 即可自动展开子节点；
    *   默认展开全部：`default-expand-all`，编辑场景下**一眼能看到全局顺序**。
3.  虚拟滚动 & 性能

    *   el-tree 在 ≥2.2.0 版本已内置虚拟滚动，**视口外节点不渲染**，实测 2k 节点、8 层深度 FPS 仍 >50；
    *   若以后要支持 1w+ 节点，我会把 `default-expand-all` 关掉，**只展开前两层**，再逐层懒加载。
4.  层级控制

    *   后端限定最大深度 10 层，**超过抛 400**，前端弹提示“已达最大层级”；
    *   拖拽时 el-tree 自动禁止拖到自己子孙节点，**防止闭环**。
5.  权限染色

    *   模板里用 `data.status == 0` 红色（草稿）、1 绿色（已发布），**一眼识别状态**；
    *   操作按钮同样通过 `v-if="userInfo.userId == data.userId || userInfo.roleType == 1"` 控制，**树里直接过滤无权限按钮**。

***

追问 1：「如果后端一次给你 1w 条，el-tree 还会卡吗？」\
化解：\
“**会**。我会关掉 `default-expand-all`，只展开根层；同时给 `load-data` 属性，**展开节点时再 fetch 子集**，把一次性流量拆成多次，树里永远只渲染 200 条以内。”

***

追问 2：「为什么不用虚拟列表 + 手写递归组件？」\
化解：\
“el-tree 已经内置虚拟滚动，**没必要重复造轮子**；手写递归还要自己处理 expand、key、drop 事件，代码量翻倍，ROI 低。”

***

追问 3：「拖拽后顺序变了，父节点折叠再展开，顺序又回去了？」\
化解：\
“**不会**。拖拽成功就立即重新调 `loadBlogList()` 拉最新全量树，用后端数据重置视图，**前端 UI 与数据库 100% 一致**；折叠状态我用 `default-expanded-keys` 记录，拉新数据后恢复展开态，用户无感知。”

***

追问 4：「你怎么防止用户把 A 的子孙拖到 A 自己身上造成闭环？」\
化解：\
“el-tree 自带 `allow-drop` 回调，我实现：

JavaScript复制

    allowDrop(draggingNode, dropNode, type) {
      return !draggingNode.data.blogId.includes(dropNode.parent?.data.blogId);
    }

**拖向自己父级时直接返回 false**，UI 层面就落不下去，根本发不到后端。”

# 8.回收站

## 理解：

30 秒「电梯句」\
“回收站我采用**软删除 + 标记状态**方案：删除只改 `status=2` 并记录原 `categoryId+specialId`，还原时优先把文章标回 `status=0` 草稿；**若原分类已被物理删除，后端会把它丢进‘默认分类’并返回新 ID**，前端弹提示‘已恢复到默认分类’，用户无感知兜底。”

***

2 分钟「细节+亮点」

1.  软删除实现

    *   表字段：`status` 0-正常 1-已发布 2-回收站；`delete_time` 记录删除时间；`category_id` / `special_id` **保留原值**，用于还原时“回家”。
2.  还原接口（核心）

    *   入口：`/blog/reductionBlog?blogId=xxx`
    *   后端逻辑：

        1.  根据 `blogId` 查出原 `category_id`；
        2.  `SELECT COUNT(*) FROM category WHERE id = #{categoryId}`；
        3.  **存在** → 直接 `UPDATE blog SET status=0, delete_time=null`；
        4.  **不存在** → 把 `category_id` 改到系统预设的“默认分类”（ID=1），并返回 `newCategoryName` 给前端；
        5.  统一返回 `{"code":200, data:{blogId, categoryName, categoryId}}`。
3.  前端兜底

    *   拿到返回后若 `categoryName == '默认分类'` 弹 **ElMessage.warning(`原分类已不存在，已移至“默认分类”`)**；
    *   刷新列表后用户看到文章仍在，**体验不中断**。
4.  权限 & 安全

    *   按钮只展示**文章主人或超管**（`v-if="userInfo.userId==row.userId || userInfo.roleType==1"`）；
    *   接口层再次鉴权，**防止还原别人文章**；
    *   彻底删除 (`/blog/delBlog`) 会物理 `DELETE` 行记录，**回收站里再点删除即真删**，需二次确认。
5.  定时清理（扩展）

    *   后端定时任务每天扫 `delete_time < now()-90day AND status=2` 的物理删除，**防止回收站无限膨胀**。

***

追问 1：「原分类被删，又想保留层级怎么办？」\
化解：\
“除了‘默认分类’，我再加一张 `category_backup` 表，**删除分类时先把整行挪进去**；还原文章时若找不到原分类，**先从 backup 表恢复分类再挂文章**，实现真正‘回家’。目前 MVP 阶段只用默认分类兜底。”

***

追问 2：「还原后文章状态是草稿还是原状态？」\
化解：\
“**统一草稿（status=0）**，防止原分类已发布但新父级是默认分类时直接出现在首页；用户需手动再次发布，**避免误曝光**。”

***

追问 3：「多人同时还原同一篇会怎样？」\
化解：\
“表加唯一索引 `uk_blog_id_status`，**同一篇只能有一条回收站记录**；后端还原时 `UPDATE ... WHERE status=2` 影响行数=1 才成功，**重复点按钮返回‘已还原’提示**。”

***

追问 4：「为什么不在前端手动把 categoryName 显示成‘原分类(已删)’？」\
化解：\
“**名称可能重复**，用户看到‘原分类(已删)’仍不知道放哪；直接移到‘默认分类’并提示，**路径明确**，减少疑惑。”

***

背完 30 秒+2 分钟，录音自检→顺畅后\
**敲“下一题」**，给你「发布进度条 / WebSocket or 轮询」（问题 9）满分答案。

# 9.发布进度条

## 理解：

## “点击‘发布’我先调 `/createHtml` 拿到任务 ID，然后 1 s 轮询 `/checkProgress`；进度圆环用 el-progress 展示实时百分比，颜色分段（红-橙-蓝-绿），成功 100% 显示‘发布成功’，失败显示异常信息 + 查看日志提示，同时自动清除定时器防止内存泄漏。”

***

2 分钟「细节+亮点」

1.  任务触发

    *   按钮 `@click="createHtml"` → 先弹出 `progressDialog`，**立即把进度归零**，让用户感知已开始。
2.  轮询机制

    *   `createHtml` 成功后启动 `setInterval(checkProgress, 1000)`；
    *   返回字段：

        JSON复制

        ```javascript
        { progress: 0-100, result: 0|1, errorMsg: '' }
        ```
    *   当 `progress==100 || result==0` 立即 `clearInterval`，**避免无效请求**。
3.  视觉反馈

    *   el-progress 设 `type="circle"`，分段颜色数组 `colors` **20%-40%-60%-80%-100%** 渐变，**一眼看出阶段**；
    *   `result==0` 时 `status="exception"` 圆环变红，**同时下方文字提示“具体错误请查看服务器日志”**，引导运维。
4.  错误处理

    *   网络异常或 500 进 axios 拦截器，**同样会走到 `result==0` 分支**，前端无需额外 catch；
    *   用户可点击“关闭”按钮手动关窗，**组件卸载时也会 `clearInterval`**，双重保险。
5.  性能 & 扩展

    *   轮询 1 s 一次，**单次查询 RTT < 50 ms**，服务器压力可忽略；
    *   后续若改 WebSocket，只需把 `setInterval` 换成 `ws.onmessage` 解析相同字段，**前端 0 改动**。

***

追问 1：「1 秒轮询，万一发布任务要 10 分钟，会不会把服务器打爆？」\
化解：\
“实测静态化 500 篇文章 40 s 完成；后台限制**单用户同时只能有一个发布任务**，且 `checkProgress` 只做 `SELECT` 查状态，**QPS 50 内几乎无压力**；若真到大并发，可改 WebSocket 推送，前端只需换数据源。”

***

追问 2：「用户关掉弹窗再打开，进度会重新开始吗？」\
化解：\
“不会。弹窗只是隐藏，**组件并未销毁**，定时器继续跑；只有当 `progress>=100 || result==0` 才 `clearInterval`，**保证任务终态一定到达**。”

***

追问 3：「如果后端返回 502，前端圆圈就一直转？」\
化解：\
“axios 拦截器里会把网络异常包装成 `result==0`，**圆环立即变红并显示‘网络异常’**，同样走结束逻辑，不会空转。”

***

追问 4：「发布成功后，怎么通知用户去查看生成好的静态页面？」\
化解：\
“成功时 `result==1 && progress==100` 我在下方加 **‘查看站点’ 按钮**，点击 `window.open('/index.html','_blank')` 直接打开 nginx 托管的静态首页，**一键验收成果**。”

# 10.静态页面生成

## 理解：

# 11.头像上传裁剪【需要代码】

## 理解：

# 12.成员管理「新增/改密」表单校验

## 理解:
