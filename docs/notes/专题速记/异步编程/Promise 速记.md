# promise速记笔记

## 1️⃣ 本质

Promise 是 **“未来才会拿到结果的容器”**，只有三种状态：\
`pending → fulfilled(成功) / rejected(失败)`，且**只能变一次**。

***

## 2️⃣ 创建

```javascript
const p = new Promise((resolve, reject) => {
  // 异步任务
  if (成功) resolve(data)   // 把结果交出去
  else reject(err)          // 把错误交出去
})
```

***

## 3️⃣ 消费结果（两种写法）

| 写法            | 例子                                         |
| :------------ | :----------------------------------------- |
| then / catch  | `p.then(res => {...}).catch(err => {...})` |
| async / await | `const res = await p; // try/catch 抓错`     |

***

## 4️⃣ 链式调用（顺序执行）

```javascript
p
  .then(res => 返回值)   // 返回值自动包成新 Promise
  .then(res2 => {...})   // 拿到上一步的返回值
  .catch(err => {...})   // 任何一步出错都跳到这里
```

***

## 5️⃣ 工具方法（背一行）

```javascript
Promise.all([p1, p2])   // 全成功才 resolve，任一失败 reject
Promise.race([p1, p2])  // 谁先到就 resolve / reject
Promise.allSettled([...]) // 所有完成，不管成功失败
```

***

## 6️⃣ 速查表

| 场景   | 一行代码                                                                                      |
| :--- | :---------------------------------------------------------------------------------------- |
| 封装回调 | `new Promise((res, rej) => fs.readFile(path, (err, data) => err ? rej(err) : res(data)))` |
| 并发   | `const [a, b] = await Promise.all([p1, p2])`                                              |
| 超时   | `const timeout = new Promise((_, rej) => setTimeout(() => rej('timeout'), 5000))`         |

***

> 口诀\
> “容器三状态，resolve / reject 交结果；then/catch 或 async/await 拿结果；链式顺序跑，并发用 all / race / allSettled。”

*   **Promise** 是「**语言层面异步流程的通用规范**」
*   **axios** 是「**基于 Promise 的 HTTP 客户端库**」

***

1.  Promise（ES6 引入的异步原语）

*   作用：让回调地狱变成链式调用，统一“成功 / 失败”语义。
*   与 HTTP 无关，读文件、计时器、WebSocket、动画……任何需要「等一会」的场景都能用。

JavaScript复制

    const p = new Promise((resolve, reject) => {
      // 3 秒后把结果扔出去
      setTimeout(() => resolve('ok'), 3000)
    })

    p.then(console.log).catch(console.error)

***

1.  axios（第三方库）

*   作用：在浏览器 / Node 里发 HTTP 请求（GET、POST、PUT、DELETE …）。
*   内部把 XMLHttpRequest / http 模块包装成 **返回 Promise 的函数**，所以你拿到的就是 Promise 对象。

JavaScript复制

    import axios from 'axios'

    axios.get('/api/user')          // axios 返回的就是 Promise
         .then(res => console.log(res.data))
         .catch(err => console.error(err))

***

关系图

`用户代码 ──调用──> axios.get ──内部实现──> new Promise ──网络完成──> resolve/reject`

*   没有 Promise，axios 也能发请求，但只能用回调形式。
*   没有 axios，你也能发请求（fetch、XMLHttpRequest），但 axios 帮你做了「浏览器兼容、超时、拦截器、自动 JSON 序列化」等一堆脏活累活。

***

一句话总结\
Promise 是「砖」，搭任何异步流程都能用；axios 是「房子」，专门用来发 HTTP，内部用 Promise 这块砖砌墙。

# async，await和then / catch的使用速记

一句话口诀\
**“async 挂帅，await 点兵，then/catch 兜底”**\
背下来就能 90 % 场景不出错。

***

速记卡片

| 场景           | 写法                                      | 记忆点                        |
| :----------- | :-------------------------------------- | :------------------------- |
| 函数开头         | `async function fn() {}`                | **async 必须写在函数上**          |
| 等结果          | `const res = await 异步操作()`              | **await 只能出现在 async 函数里**  |
| 捕获错误         | `try { await ... } catch (e) { ... }`   | **await 配 try/catch，同步写法** |
| 不想 try/catch | `异步操作().then(res=>...).catch(err=>...)` | **链式结构，then 成功，catch 失败**  |

***

一条公式

JavaScript复制

    // 公式：async + await (+ try/catch)
    async function demo() {
      try {
        const res = await axios.get('/api')
        console.log(res)
      } catch (e) {
        console.error(e)
      }
    }

    // 等价链式：then / catch
    axios.get('/api')
      .then(res => console.log(res))
      .catch(e => console.error(e))

***

常见坑速背

1.  **忘记 async**：`await` 必须写在 `async` 函数里。
2.  **await 串行**：多个无依赖的 `await` 用 `Promise.all` 并行：

    ```javascript
    const [a, b] = await Promise.all([api1(), api2()])
    ```
3.  **return Promise**：在 async 函数里 `return 值` 会自动包成 Promise，\
    但 `return await 异步()` 更直观。

背完收工：\
“函数加 async，调用加 await，错误包 try/catch，链式用 then/catch

1.  async\
    作用：给函数加“异步许可证”\
    意义：让函数内部能用 await，调用者拿到 Promise
2.  await\
    作用：等 Promise 结果\
    意义：把异步写成“同步阅读”，避免回调地狱
3.  then\
    作用：Promise 成功回调\
    意义：链式写法，继续下一步处理
4.  catch\
    作用：Promise 失败回调\
    意义：统一捕获错误，防止程序崩溃

口诀：\
async 挂帅 → await 点兵 → then 接战果 → catch 收残局
