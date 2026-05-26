# vue路由速记笔记

## 1️⃣ 安装

```javascript
npm i vue-router@4        # 安装 Vue Router 4
```

***

## 2️⃣ 创建路由实例（src/router/index.ts）

```javascript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

/* 路由表：path -> 组件 的映射数组 */
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },                       // 根路径重定向到登录页
  { path: '/login', component: () => import('@/views/Login.vue') }, // 登录页
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),   // 后台布局
    children: [                                            // 嵌套路由
      { path: '', redirect: '/admin/dashboard' },           // 默认子路由
      { path: 'dashboard', component: () => import('@/views/Dashboard.vue') },
      {
        path: 'user/:id',          // 动态段 /admin/user/123
        name: 'userDetail',        // 具名路由，方便跳转
        component: () => import('@/views/UserDetail.vue'),
        props: true                // 把路由参数 id 作为 props 传入组件
      }
    ]
  },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/404.vue') } // 404 通配
]

/* 创建并导出路由实例：history 模式 + 路由表 */
export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // HTML5 history（无 #）
  routes
})
```

***

## 3️⃣ 挂载到应用（main.ts）

```javascript
import router from '@/router'
app.use(router)          // 让 Vue 实例拥有路由功能
```

***

## 4️⃣ 模板跳转

```javascript
<!-- 声明式导航：渲染为 <a> 标签 -->
<router-link to="/login">登录</router-link>
<router-link :to="{ name: 'userDetail', params: { id: 1 } }">用户详情</router-link>
```

***

## 5️⃣ 脚本跳转 & 取参

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()   // 路由器：控制跳转
const route  = useRoute()    // 当前路由：读参数

/* 编程式导航 */
router.push('/admin')                                     // 字符串
router.push({ name: 'userDetail', params: { id: 2 } })    // 具名 + 参数
router.replace('/login')                                  // 不留历史记录

/* 读取 URL 参数 */
console.log(route.params.id)   // /user/:id 中的 id
console.log(route.query.token) // ?token=abc 中的 token
```

***

## 6️⃣ 全局守卫（登录鉴权示例）

```javascript
router.beforeEach((to, from, next) => {
  // to   : 即将进入的路由对象
  // from : 正要离开的路由对象
  // next : 放行函数，不传继续；传路径则跳转
  if (to.meta?.auth && !isLogin()) return next('/login') // 需要登录且未登录 → 踢回
  next()                                                 // 其他情况放行
})
```

***

## 7️⃣ 速查表（一行背完）

| 目的     | 写法示例                                                |
| :----- | :-------------------------------------------------- |
| 根重定向   | `{ path:'/', redirect:'/login' }`                   |
| 动态路由   | `path:'user/:id'` 取 `route.params.id`               |
| 具名跳转   | `router.push({ name:'userDetail', params:{id:1} })` |
| 查询参数   | `router.push({ path:'/search', query:{kw:vue} })`   |
| 404 通配 | `{ path:'/:pathMatch(.*)*', component:404 }`        |
| 全局前置守卫 | `router.beforeEach((to,from,next)=>{ ... })`        |

***

> 口诀\
> “路由表写映射，history 建实例；模板 `<router-link>`，脚本 `useRouter`；动态 `:id` 读 `params`，守卫 `beforeEach` 做鉴权。”

