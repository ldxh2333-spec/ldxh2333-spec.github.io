# ts速记笔记

## 1️⃣ 安装 & 运行

```typescript
npm i -D typescript                # 下载 TS 编译器
npx tsc --init                     # 生成 tsconfig.json（TS 规则说明书）
npm i -D @types/node               # 给 Node 内置 API 加类型提示
```

***

## 2️⃣ 最直观差异：类型注解

| JS 写法                                 | TS 写法（加冒号）                                                    |
| :------------------------------------ | :------------------------------------------------------------ |
| `let age = 18`                        | `let age: number = 18`                                        |
| `function sum(a, b) { return a + b }` | `function sum(a: number, b: number): number { return a + b }` |

> **记忆**：变量/参数后面加“冒号 + 类型”，返回值在括号后面也加。

***

## 3️⃣ 基础类型速查表

```typescript
let isDone: boolean = false          // 布尔
let age: number = 18                 // 数字
let name: string = 'Tom'             // 字符串
let list: number[] = [1, 2, 3]       // 数组
let obj: { id: number; name: string } = { id: 1, name: 'Tom' } // 对象
let anyThing: any = 'whatever'       // 任意类型（逃生舱）
```

***

## 4️⃣ 接口（interface）——给对象“画图纸”

```typescript
// JS 时代：对象随意写，容易拼错
// TS 时代：先画图纸
interface User {
  id: number
  name: string
  age?: number        // ? 表示可选属性
}

const user: User = { id: 1, name: 'Tom' }   // 多余或缺失属性都会报错
```

***

## 5️⃣ 泛型（Generic）——一次定义，多处复用

```typescript
// JS：只能写死类型
// TS：用占位符 T，用的时候再传
function echo<T>(arg: T): T {
  return arg
}
const num = echo<number>(123)   // T 现在是 number
const str = echo<string>('hi')  // T 现在是 string
```

***

## 6️⃣ 联合 & 交叉类型

TypeScript复制

    type ID = string | number               // 联合：可以是 string 也可以是 number
    type FullUser = User & { address: string } // 交叉：合并两个对象类型

***

## 7️⃣ 枚举（enum）——给常量起名字

```typescript
// JS：魔法字符串
// TS：编译期常量
enum Status {
  Pending = 0,
  Resolved = 1,
  Rejected = 2
}
const s: Status = Status.Pending   // 0
```

***

## 8️⃣ 类型断言（告诉编译器“我比你清楚”）

```typescript
const el = document.getElementById('root') as HTMLInputElement
el.value = 'hello'   // 现在 el 被当成输入框，不会报错
```

***

## 9️⃣ 在 Vue3 中的典型用法

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  id: number
  name: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({ id: 0, name: '' }),   // 用接口约束 state
  actions: {
    setName(name: string) { this.name = name },    // 参数加类型
  }
})
```

***

## 🔟 常用命令

| 任务     | 命令                  |
| :----- | :------------------ |
| 单文件编译  | `npx tsc xxx.ts`    |
| 监听模式   | `npx tsc --watch`   |
| 生成声明文件 | `tsc --declaration` |

***

## ✅ 一页脑图

```typescript
变量/参数/返回值 → 冒号类型
对象 → interface
数组 → 泛型 Array<T> 或 T[]
函数 → 箭头函数泛型 <T>() => T
枚举 → enum
断言 → as
```

> **口诀**\
> “先写 JS，再补冒号；对象用 interface，数组用泛型；Vue3 里给 state 和 props 上类型，一路 Alt+Enter 自动补。”

