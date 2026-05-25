1.  在 Vue 3 的模板语法里，写在 HTML 标签上的 `ref="xxx"` 并不是响应式 API 里的 `ref()`，而是“**模板引用（template ref）**”。\
    它的作用只有一件事：**在组件渲染完成后，让你能通过 `this.$refs.xxx`（选项式 API）或同名变量（组合式 API）拿到对应 DOM 元素(标签本身)或子组件实例**。

    ### 1. 选项式 API（this.\$refs）

    ```javascript
    <template>
      <input ref="inputEl" />
    </template>

    <script>
    export default {
      mounted() {
        // 这里的 this.$refs.inputEl 就是 <input> 的真实 DOM
        this.$refs.inputEl.focus()
      }
    }
    </script>
    ```

    ### 2. 组合式 API（同名变量）

    ```javascript
    <template>
      <input ref="inputEl" />
    </template>

    <script setup>
    import { ref, onMounted } from 'vue'

    // 变量名必须和模板上的 ref 同名
    const inputEl = ref(null)

    onMounted(() => {
      // inputEl.value 就是 <input> 的真实 DOM
      inputEl.value.focus()
    })
    </script>
    ```

    ### 3. 与响应式 `ref()` 的区别

    | 维度   | 模板 `ref="xxx"`       | 响应式 `ref()`              |
    | :--- | :------------------- | :----------------------- |
    | 出现位置 | 只能写在模板标签上            | 只能写在 `<script>` 里        |
    | 返回值  | 不返回任何东西，只是打标记        | 返回一个 `{ value: ... }` 对象 |
    | 作用   | 获取 DOM 或子组件          | 声明响应式数据                  |
    | 访问方式 | 通过 `$refs.xxx` 或同名变量 | 通过 `.value`              |

    一句话总结：\
    模板里的 `ref=""` 就是“**给我留个句柄，我好拿到真实 DOM / 子组件**”，跟数据响应式毫无关系。

2.  vue3+elplus，组件封装流程（思路）

    ### ✅ 正确的做法（Vue 3 + Element Plus）

    正确理解：

    *[我自己封装el+的组件，使用的时候就类似插槽一样，把组件在mian.js中通过app.comment引入，我的xx.vue文件当我需要使用它的时候，只需要使用它的组件标签，就可以插到我需要用的任何地方了，然后这个时候vue就会通过这个组件标签找到对应的文件，将他们渲染成模板，放到页面上]()*

    1.  **封装组件**\
        你写好了一个自定义组件，比如 `MyButton.vue`。
    2.  **全局注册（在 `main.js` 中）**\
        你需要在 `main.js` 中通过 `app.component()` 注册这个组件，这样它就能在任何地方使用，而无需每次都 `import`。

        ```javascript
        // main.js
        import { createApp } from 'vue'
        import App from './App.vue'
        import MyButton from '@/components/MyButton.vue'

        const app = createApp(App)

        app.component('MyButton', MyButton) // 全局注册

        app.mount('#app')
        ```
    3.  **使用组件**\
        在任何 `.vue` 文件中，你可以直接使用 `<MyButton />`，不需要再 `import` 或 `components: {}` 注册。

        ```javascript
        <!-- SomeOther.vue -->
        <template>
          <MyButton />
        </template>
        ```

    ***

    ### ❌ 你的误区

    > “xx.vue文件就可以自动当成一个被渲染好的模板，由我用这个组件标签插到我需要用的组件的某个地方了”
    > 这句话不太准确。**`.vue` 文件本身不会“自动渲染”**，它只是定义了一个组件。你必须在某个地方**显式使用这个组件的标签**（如 `<MyButton />`），Vue 才会把它渲染出来。

    ***

    ### ✅ 总结一句话

    只要你通过 `app.component()` 注册了组件，就可以在任何地方像用 `<el-button>` 一样用你自己的 `<MyButton>`，但它不会“自动”出现在页面上，你得手动写标签去用它。

3.  `const formDataRef = ref(); const showEdit = (type,data)=>{ dialogConfig.show=true; nextTick(()=>{ if(type =='add'){ formDataRef.value.resetFields(); dialogConfig.title = '新增分类'; } else if(type == 'update'){ dialogConfig.title = '编辑分类'; Object.assign(formData,data); } }) }`这段代码不就是现让页面渲染完成后，清空数据，然后在判断逻辑是否要添加数据，那不就是重新把数据渲染了吗，我不懂

    先把结论说在前面：\
    **这里确实会再触发一次 DOM 更新，但这次更新是由“你修改了数据”引起的，而不是由 `nextTick` 本身引起的。**

    ***

    ### 🔍 把整个过程拆成时间线

    | 时间                    | 发生了什么                                                 | 是否触发重新渲染          |
    | :-------------------- | :---------------------------------------------------- | :---------------- |
    | 1. 调用 `showEdit(...)` | `dialogConfig.show = true` → 组件被插入 DOM（v-if 或 v-show） | ✅ 第 1 次渲染         |
    | 2. `nextTick(...)`    | 等待第 1 次渲染完成；**`nextTick` 自己不做渲染**                     | ❌                 |
    | 3. 执行回调里的逻辑           | 根据 `type` 对数据做两件事：                                    | ✅ 第 2 次渲染（因为数据变了） |

    ***

    ### 🎯 为什么要包一层 `nextTick`

    1.  **第一次渲染完成前，组件实例不一定已经挂载**\
        如果不用 `nextTick`，`formDataRef.value` 可能是 `undefined`（因为弹窗刚把 DOM 插进去，子组件 `<el-form>` 还没创建出来）。
    2.  **保证 `resetFields` / `Object.assign` 操作的是“真实已挂载”的表单**\
        否则重置/赋值可能会失败或报错。

    ***

    ### 🔧 精简示例

    ```javascript
    // 第一次渲染：把对话框插入 DOM
    dialogConfig.show = true      // ✅ 触发渲染

    nextTick(() => {
      // 此时对话框已出现在页面上，<el-form> 已经挂载

      if (type === 'add') {
        formDataRef.value.resetFields()   // 清空表单
      } else {
        Object.assign(formData, data)     // 填充表单
      }
      dialogConfig.title = type === 'add' ? '新增分类' : '编辑分类'
      // 这两步修改了数据 → ✅ 触发第二次渲染
    })
    ```

    ***

    ### 📌 一句话总结

    *   `nextTick` **只是“等待渲染完成”的工具**，它自己不产生新的渲染。
    *   **新的渲染是你随后修改数据（`resetFields`、`Object.assign`、`title`）导致的**。

4.  `formDataRef` 就是\*\*“拿到组件实例（或 DOM 节点）”\*\*的一把钥匙，具体拿的是谁，要看模板里 `ref="xxx"` 写在哪个元素 / 组件上。

    ***

    ### 📌 在你的代码里

    模板里大概率有这么一行（Element-Plus 举例）：

    ```javascript
    <el-form
      ref="formDataRef"
      :model="formData"
      :rules="rules"
    >
      ...
    </el-form>
    ```

    *   这里 `ref="formDataRef"` 把 `<el-form>` 这个**组件实例**挂到了 `formDataRef.value` 上。
    *   因此 `formDataRef.value` 就是 `<el-form>` 的**组件实例**，Element-Plus 给它暴露了诸如：

        *   `resetFields()` —— 重置所有表单项
        *   `validate()` —— 手动校验
        *   `clearValidate()` —— 清空校验结果

    ***

    ### 🎯 一句话解释

    > `formDataRef` 就是用来\*\*“遥控” `<el-form>`\*\* 的遥控器，\
    > 通过 `formDataRef.value.xxx()` 调用它提供的内置方法。

    ***

    ### ⚠️ 注意

    1.  如果模板里没有同名的 `ref="formDataRef"`，或者对话框还没渲染出来（`v-if="false"`），\
        那么 `formDataRef.value` 就是 `undefined`，这时 `resetFields()` 会报错。\
        所以一般要包一层 `nextTick` 等它挂载完成。
    2.  它和 **响应式数据 `formData`** 不是一回事：

        *   `formData` 管“数据”。
        *   `formDataRef` 管“组件实例 / DOM 节点”。

5.  **`<el-row>` 是行，`<el-col>` 是列，用 `span`（必填）控制宽度，24 分栏随意拼。**

    Element Plus 的 **布局组件** —— 基于 24 分栏栅格系统的「行 / 列」组合。

    一句话：\
    **`<el-row>` 代表“一行”，`<el-col>` 代表“这一行里的列”，通过 `span` 决定列宽。**

    ***

    ### 1. 最小例子

    ```javascript
    <el-row>
      <el-col :span="12">左侧占 12/24 = 50%</el-col>
      <el-col :span="12">右侧占 12/24 = 50%</el-col>
    </el-row>
    ```

    渲染后就是左右 **两等宽列**。

    ***

    ### 2. 你给的空标签

    ```javascript
    <el-row>
      <el-col></el-col>
    </el-row>
    ```

    *   `<el-row>` 创建一行（默认 `display: flex`）。
    *   `<el-col>` 没给 `span` 时，默认占满 24，因此会 **撑满整行**，但**内容为空** → 页面上看不到任何东西。
    *   通常这么写只是占位，后续会往里填内容或加属性。

    ***

    ### 3. 常用属性

    | 组件       | 常用属性          | 说明             |
    | :------- | :------------ | :------------- |
    | `el-row` | `gutter="20"` | 列间距 20px       |
    | `el-col` | `:span="8"`   | 占 8/24 ≈ 33.3% |
    | `el-col` | `:offset="4"` | 左侧空出 4/24      |

    ***

    ### 4. 完整示例

    ```javascript
    <el-row :gutter="20">
      <el-col :span="6"><div>1</div></el-col>
      <el-col :span="6"><div>2</div></el-col>
      <el-col :span="6"><div>3</div></el-col>
      <el-col :span="6"><div>4</div></el-col>
    </el-row>
    ```

    → 一行 4 等宽卡片，每列间距 20px。

    ***

6.  ref和reactive的区别

    ### ✅ 一句话总结

    | 特性        | `ref`                                                | `reactive`                             |
    | :-------- | :--------------------------------------------------- | :------------------------------------- |
    | **用途**    | 包装**基本类型**（如 `string`, `number`, `boolean`）或**单一对象** | 包装**复杂对象**（如 `object`, `array`, `Map`） |
    | **访问方式**  | `.value`                                             | 直接访问属性                                 |
    | **返回值类型** | `Ref<T>`                                             | `Proxy` 对象                             |
    | **适用场景**  | 基本类型、需要替换整个对象                                        | 复杂对象、深层嵌套结构                            |

    ***

    ### 📌 详细对比

    #### 1. 基本类型 vs 对象

    *   `ref` 适用于**基本类型**（如 `number`, `string`, `boolean`）。
    *   `reactive` 适用于**对象类型**（如 `object`, `array`）。

    JavaScript复制

        import { ref, reactive } from 'vue';

        const count = ref(0); // 基本类型
        const state = reactive({ name: 'Tom', age: 20 }); // 对象类型

    #### 2. 访问方式

    *   `ref` 创建的响应式数据需要通过 `.value` 访问。
    *   `reactive` 创建的响应式数据直接访问属性即可。

    JavaScript复制

        console.log(count.value); // 0
        console.log(state.name);  // 'Tom'

    #### 3. 替换整个对象

    *   `ref` 可以**直接替换整个对象**（因为 `.value` 是一个整体）。
    *   `reactive` **不能直接替换整个对象**（否则会失去响应性）。

    JavaScript复制

        count.value = { a: 1 }; // ✅ 合法
        state = { name: 'Jerry' }; // ❌ 非法，会失去响应性

    #### 4. 解构问题

    *   `reactive` 对象**解构后会失去响应性**（需要使用 `toRefs` 或 `toRef`）。
    *   `ref` 不存在这个问题（本身就是独立引用）。

    JavaScript复制

        const { name } = state; // ❌ name 会失去响应性
        const nameRef = toRef(state, 'name'); // ✅ 使用 toRef 保持响应性

    ***

    ### 📍使用建议

    表格复制

    | 场景                         | 推荐                    |
    | :------------------------- | :-------------------- |
    | 基本类型（如 `number`, `string`） | ✅ `ref`               |
    | 复杂对象（如 `{ a: { b: 1 } }`）  | ✅ `reactive`          |
    | 需要替换整个对象                   | ✅ `ref`               |
    | 需要解构对象属性                   | ✅ `reactive + toRefs` |

    ***

    ### 🎯 举个完整例子

    ```javascript
    <script setup>
    import { ref, reactive, toRefs } from 'vue';

    // 基本类型
    const count = ref(0);

    // 复杂对象
    const user = reactive({ name: 'Tom', age: 20 });

    // 解构 user
    const { name, age } = toRefs(user);

    function increment() {
      count.value++;
    }

    function updateName() {
      name.value = 'Jerry';
    }
    </script>

    <template>
      <p>Count: {{ count }}</p>
      <p>User: {{ name }} - {{ age }}</p>
      <button @click="increment">Increment</button>
      <button @click="updateName">Update Name</button>
    </template>
    ```

    ***

    ### 🚩总结

    *   ✅ 用 `ref` 处理**基本类型**或需要**整体替换**的场景。
    *   ✅ 用 `reactive` 处理**复杂对象**，但注意**解构问题**。
    *   ✅ 记住：`ref` 是「包装器」，`reactive` 是「代理对象」

7.  `:xxx="yyy"` 到底是什么

    它就是

    ```javascript
    v-bind:xxx="yyy"
    ```

    的**简写**，意思一句话：

    > 把 **双引号里的 JS 表达式 `yyy`** 的运行结果，**实时**赋给标签的 **属性 `xxx`**。

8.  组件通信

    一、***~~父传子：最单纯，就是向下发“快递”~~***

    1.  口诀\
        **“父给子，用 props，左边绑右边收”**

        父组件

        &#x20;\<template> \<Child \:money="100" /> \</template>
        子组件

        &#x20;\<script setup> defineProps({ money: Number }); \</script>&#x20;

        记忆锚点\
        把 `props` 想成**收件地址**，父组件填快递单，子组件签收。

        ***

        ### 二、子传父：就是“向上喊事件”

        口诀\
        **“子喊父，用 emit，左边喊右边听”**

        &#x20;\<script setup>
        const emit = defineEmits(\['buy']);
        function clickBtn(){ emit('buy', 5); }   // 5 块钱想买辣条

        ```javascript
        const emit = defineEmit(['buy']);
        function clickBtn(){
        	emit('buy',5)
        }
        </script>
        ```

        &#x20;\<template>

        1.  &#x20;\<Child @buy = 'onBuy'/> \</template> \<script setup> function onBuy(price){ console.log('收到' + price + '块'); } \</script> 记忆锚点\
            把 `emit` 想成**孩子喊“妈，给钱！”**，父组件听见后决定给不给。

            ***

            ### 三、跨组件（爷→孙、兄弟、任意远房亲戚）

            官方推荐只有两步：

            1.  开一辆“大巴车”：`provide`
                1.  想上车的人：`inject`
                    口诀\
                    **“爷爷 provide，孙 inject，key 对上就通车”**

            爷爷组件（顶层）

            vue复制 \<script setup>
            import { provide, ref } from 'vue';
            const cash = ref(1000);
            provide('moneyKey', cash);   // 把钱包扔到车里 \</script>
            孙子组件（深层）

            vue复制 \<script setup>
            import { inject } from 'vue';
            const cash = inject('moneyKey'); // 上车拿钱 \</script>

            *   想改值？直接 `cash.value = 900`，所有注入的地方**实时同步**。
            *   兄弟组件之间也一样，只要它们**同坐一辆大巴车**（同一个 provide 祖先）。
                记忆锚点\
                把 `provide/inject` 想成**家族微信群名**：`moneyKey`，谁拉谁进群，谁就能抢红包。

            ***

            ### 四、一张文字图总结（保存当壁纸）

            复制
            父传子：   \[父] ‑props→ \[子]
            子传父：   \[子] ‑emit→ \[父]
            跨组件：   \[祖] ‑provide→🚌‑inject→\[孙/兄弟/任意]

            ***

            ### 五、常见踩坑提醒（背下来）

            1.  `props` 是**单向**，子改值会报警告。
            2.  `emit` 事件名**建议小写或 kebab-case**，别写驼峰。
            3.  `provide` 里想响应式，**必须给 ref/reactive**，直接给原始值就断联。
            4.  如果项目太大，provide/inject 太散，就上**Pinia**（全局仓库），别硬拗。

            ***

            ### 六、三句话终极记忆

            *   父给子：**props**
            *   子喊父：**emit**
            *   隔代/兄弟：**provide/inject**（同坐一辆大巴）
    2.  在 **Element Plus（el-\*）** 组件里出现的 `prop="xxx"`，**99% 是“校验字段名”**，跟「父传子 props」完全是两回事，不要混在一起。

        ***

        ## 一、哪里会见到

        最常见两处：

        1.  `el-form-item`
        2.  `el-table-column`

        ***

        ## 二、作用一句话

        表格复制

        | 组件                | prop 属性作用                                               |
        | :---------------- | :------------------------------------------------------ |
        | `el-form-item`    | 告诉表单：**我要校验哪个字段**（必须跟 `el-form` 的 `:model` 对象里的 key 对应） |
        | `el-table-column` | 告诉表格：**这一列渲染哪条数据的字段**                                   |

        ***

        ## 三、最小例子（表单校验）

        vue复制 \<template> \<el-form \:model="form" \:rules="rules" label-width="80px">  \<el-form-item label="用户名" prop="username"> \<el-input v-model="form.username" /> \</el-form-item>

                <!-- 校验 form.email -->
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" />
                </el-form-item>
              </el-form>
            </template>

            <script setup>
            import { reactive } from 'vue'

            const form = reactive({
              username: '',
              email: ''
            })

            const rules = reactive({
              username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
              email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
            })
            </script>

        *   `prop="username"` ➜ 把 `form.username` 拿去做校验。
        *   如果你把 `prop` 写错或漏写，**校验就失效**。

        ***

        ## 四、表格列渲染

        &#x20;\<el-table \:data="tableData"> \<el-table-column prop="date" label="日期" /> \<el-table-column prop="name" label="姓名" /> \</el-table>

        const tableData = reactive(\[
        { date: '2025-06-21', name: 'Tom' },
        { date: '2025-06-22', name: 'Jerry' }
        ])

        *   `prop="date"` ➜ 这一列渲染每条数据的 `date` 字段。

        ***

        ## 五、一句话总结

        在 **Element 组件**里看到 `prop="xxx"`，**先问自己：**

        > 这是 **表单校验字段** 还是 **表格列字段**？
        > 它 **不是** 父传子 props，也 **不需要** 子组件 `defineProps`，只是 **Element 自己定义的一个“字符串关键字”**，用来**定位数据字段**而已。

9.  `ref="formDataRef"` **不是**给 DOM 设 `id`，而是\
    **在 Vue 的模板里“注册”一个模板引用（template ref）**，让你能在 `<script setup>` 里直接拿到 **真实的 DOM 元素** 或 **组件实例**。
    ***
    类比
    *   原生 JS：`document.getElementById('formDataRef')`
        ```javascript
        <el-form ref="formDataRef"> … </el-form>
        ```
        JavaScript复制
        ```javascript
        import { ref } from 'vue'
        const formDataRef = ref(null)   // 先声明同名变量
        // 现在 formDataRef.value 就是 <el-form> 的组件实例
        ```
    ***
    常见用途
    1.  调组件内置方法

        ```javascript
        formDataRef.value.validate(valid => { … })
        ```
    2.  手动滚动、聚焦、重置等

        ```javascript
        formDataRef.value.$el.scrollIntoView()
        ```
    ***
    总结
    *   `ref="xxx"` 是 Vue 的**模板引用语法**，和 `id=""` 毫无关系。
    *   必须在 `<script setup>` 里再写 `const xxx = ref(null)` 才能真正拿到对象。

10. 插槽

    插槽是 Vue 中用于内容分发的机制，允许父组件在子组件的特定位置插入内容。在 `setup` 语法糖中，插槽的使用方式与 Vue 2 类似，但更加简洁。

    #### 2.1 默认插槽

    默认插槽是最简单的插槽，允许父组件在子组件的默认位置插入内容。

    ```javascript
    <!-- ParentComponent.vue -->
    <template>
      <ChildComponent>
        <p>这是默认插槽的内容</p>
      </ChildComponent>
    </template>
    ```

    ```javascript
    <!-- ChildComponent.vue -->
    <template>
      <div>
        <slot></slot>
      </div>
    </template>
    ```

    #### 2.2 命名插槽

    命名插槽允许父组件在子组件的多个特定位置插入内容。

    ```javascript
    <!-- ParentComponent.vue -->
    <template>
      <ChildComponent>
        <template #header>
          <h1>这是头部内容</h1>
        </template>
        <template #default>
          <p>这是默认插槽的内容</p>
        </template>
        <template #footer>
          <p>这是底部内容</p>
        </template>
      </ChildComponent>
    </template>
    ```

    ```javascript
    <!-- ChildComponent.vue -->
    <template>
      <div>
        <header>
          <slot name="header"></slot>
        </header>
        <main>
          <slot></slot>
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
    </template>
    ```

    #### 2.3 作用域插槽

    作用域插槽允许父组件访问子组件的数据，并在插槽中使用这些数据。

    ```javascript
    <!-- ParentComponent.vue -->
    <template>
      <ChildComponent>
        <template #default="slotProps">
          <p>子组件的数据是：{{ slotProps.data }}</p>
        </template>
      </ChildComponent>
    </template>
    ```

    ```javascript
    <!-- ChildComponent.vue -->
    <template>
      <div>
        <slot :data="message"></slot>
      </div>
    </template>

    <script setup>
    import { ref } from 'vue';

    const message = ref('Hello from Child');
    </script>
    ```

11. 1\. 组件通信

    组件通信是 Vue 中非常重要的一个概念，它允许父子组件之间传递数据和事件。在 Vue 3 的 `setup` 语法糖中，主要通过以下几种方式实现组件通信：

    #### 1.1 Props

    `props` 是父组件向子组件传递数据的方式。在 `setup` 语法糖中，通过 `defineProps` 定义子组件可以接收的 `props`。

    ```javascript
    <script setup>
    import { defineProps } from 'vue';

    const props = defineProps({
      message: String,
    });
    </script>
    ```

    在父组件中，可以通过 `:message="someValue"` 的方式将数据传递给子组件。

    #### 1.2 Emits

    `emits` 是子组件向父组件传递事件的方式。在 `setup` 语法糖中，通过 `defineEmits` 定义子组件可以触发的事件。

    ```javascript
    <script setup>
    import { defineEmits } from 'vue';

    const emit = defineEmits(['update:message']);

    const updateMessage = (newMessage) => {
      emit('update:message', newMessage);
    };
    </script>
    ```

    在父组件中，可以通过 `@update:message="handleUpdate"` 的方式监听子组件触发的事件。

    #### 1.3 Provide/Inject

    `provide` 和 `inject` 是用于跨层级组件通信的方式。在 `setup` 语法糖中，通过 `provide` 和 `inject` 实现。

    ```javascript
    <!-- ParentComponent.vue -->
    <script setup>
    import { provide, ref } from 'vue';

    const parentMessage = ref('Hello from Parent');
    provide('parentMessage', parentMessage);
    </script>
    ```

    ```javascript
    <!-- ChildComponent.vue -->
    <script setup>
    import { inject } from 'vue';

    const parentMessage = inject('parentMessage');
    </script>
    ```

12. 1

13. 1

14. 1

15. 1

16. 1

17. 1

18. 1

19. 1

20. 1

21. 1

22. 1

23. 1

24. 1

25.

