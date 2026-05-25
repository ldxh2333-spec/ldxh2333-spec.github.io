# proxy速记笔记

y你可以把这段代码里的「**Request → axios → 服务器 → result**」看成一条**固定流水线**：

1.  用户填好账号 / 密码 / 验证码，点「登录」
2.  `login()` 被触发 → `formDataRef.value.validate()` 先校验
3.  校验通过 → `proxy.Request({...})` 被执行

    *   `Request` 就是 `@/utils/Request.js` 里 **封装好的 axios 实例**
    *   你把表单数据 **作为参数传进去**
    *   它在内部统一加 baseURL、加 loading、序列化、加 token、拦截错误……
4.  axios 真正向服务器发 HTTP 请求
5.  服务器返回 JSON → axios 的响应拦截器把外层剥掉 → **干净的数据**
6.  最终 `await proxy.Request(...)` **resolve** 出来的值赋给 `result`

    *   如果后端返回 `status==='error'`，拦截器会 `reject`，`result` 就是 `null`
    *   正常则 `result` 里就是后端业务数据（token、用户信息等）

所以：

*   **Request 只是 axios 的一层“壳”**：负责公共设置、loading、错误提示。
*   **真正发网络请求的是 axios**。
*   **result 就是 axios 请求成功后的响应体**，你拿到它就可以做后续跳转、存 token、更新 UI 等操作。

一句话：\
`proxy.Request` 把「页面填的数据」→ **axios 请求** → **服务器** → **返回的数据** → **交回给你的 `result`**，你接着用就行。   &#x20;

let result = await proxy.Request({//Request用来帮我发送页面提交的数据，                                       // 交给axios处理，最后axios发送给服务器，然后拿到回来的数据赋给resul

1.  `getCurrentInstance().proxy` 就是当前组件实例的“替身 this”。它能拿到的内容可以分 4 类，下面一次把用法和注意点全讲清：

    ***

    1.  你在别的组件中的 `<script setup>`（或 `setup()`）里定义的变量 / 函数\
        ✅ **拿不到**。\
        这些变量只存在于闭包作用域，不会自动挂到实例上。\
        想让父级拿到，需要显式 `defineExpose({ xxx })`。

    ***

    1.  全局挂载的属性（`app.config.globalProperties`）\
        ✅ **可以拿**，直接 `proxy.$xxx`。

            // main.ts
            app.config.globalProperties.$http = axios

        vue复制

            <script setup>
            import { getCurrentInstance } from 'vue'
            const { proxy } = getCurrentInstance()
            proxy.$http.get('/api')   // ✅
            </script>

    ***

    1.  组件本身“自带”的东西\
        ✅ **可以拿**，但写法用组合式 API 更方便。

        表格复制

        | Vue2 this.xxx | proxy 写法          | 等价组合式 API                         |
        | :------------ | :---------------- | :-------------------------------- |
        | this.\$emit   | `proxy.$emit`     | `const emit = defineEmits([...])` |
        | this.\$attrs  | `proxy.$attrs`    | `const attrs = useAttrs()`        |
        | this.\$slots  | `proxy.$slots`    | `const slots = useSlots()`        |
        | this.\$refs   | `proxy.$refs.xxx` | `const xxx = ref(null)`（推荐）       |
        | this.\$parent | `proxy.$parent`   | 很少用，打破封装                          |
        | this.\$root   | `proxy.$root`     | 很少用                               |

        例子：

        vue复制

            <template>
              <input ref="input" />
            </template>

            <script setup>
            import { getCurrentInstance, onMounted } from 'vue'

            const { proxy } = getCurrentInstance()

            onMounted(() => {
              proxy.$refs.input.focus()   // ✅
              console.log(proxy.$attrs)   // ✅ 透传的 attribute
            })
            </script>

    ***

    一句话总结\
    `proxy` 能拿到 Vue 帮你自动挂到组件实例上的那些“官方出口”和全局属性；\
    你自己在 `<script setup>` 里写的变量/函数**不会**自动挂上去，需要 `defineExpose` 才能被外部或 `proxy` 访问。

