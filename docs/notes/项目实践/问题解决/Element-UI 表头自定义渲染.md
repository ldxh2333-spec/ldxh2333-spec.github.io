为了避免在每个 \<el-table-column> 中都重复写一套 \<template slot="header"> 的代码，我使用 Element UI 表格组件提供的 render-header 属性来统一自定义表头渲染逻辑。

具体步骤：

1.  定义渲染函数 renderHeaderWithStar ：
    在 methods 中定义了一个方法，它接收两个参数： h （Vue 的渲染函数）和 { column } （列配置对象）。

    *   判断模式 ：首先检查当前模式是否为 add （新增）或 edit （编辑）。
    *   动态渲染 ：如果是这两种模式，就返回一个包含红色星号和列名的 span 元素。
    *   默认渲染 ：如果不是，就只显示列名。

    ```javascript
    renderHeaderWithStar(h, { 
    column }) {
        const label = column.label;
        // 仅在新增或编辑模式下显示星号
        if (this.mode === 'add' || 
        this.mode === 'edit') {
            return h('span', [
                h('span', { style: 
                'color: #F56C6C; 
                margin-right: 4px;
                ' }, '*'),
                label
            ]);
        }
        return h('span', label);
    }
    ```
2.  应用到表格列 ：
    将这个方法绑定到需要必填标识的 \<el-table-column> 的 render-header 属性上。

    ```html
    <el-table-column prop="waterName" 
    label="水体名称" align="center" 
    width="160"
        :render-header="renderHeaderWi
        thStar">
        <!-- ... 列内容 ... -->
    </el-table-column>
    ```

优点：

*   代码复用 ：逻辑集中在一个方法里，不需要在每个列里写重复的 HTML。
*   维护方便 ：如果以后要修改星号的颜色或位置，只需要改这一个方法。
*   灵活性 ：可以根据 mode 动态控制是否显示星号，查看模式下界面更干净。

# 详解

renderHeaderWithStar 到底干了什么？——把它拆成“三句话 + 一张图”你就永远记住：
背景：Element 表格列默认只能显示纯文本
vue
复制 \<el-table-column label="设备名称" />
表头就是一行死文字，想放个红色 \* 或者图标？ 原生 label 属性做不到，于是 Element 给你开了个钩子——
\:render-header="function(h, { column, `$index }) { return VNode }"
只要返回合法的 VNode，表头就能想画啥画啥。
函数签名：h 就是 createElement
JavaScript
复制
renderHeaderWithStar(h, { column }) {
  // column 对象里带着当前列的配置，column.label 就是列标题文本
}
第一个参数 h 是 Vue 自动注入的 createElement 函数，用来生成虚拟 DOM（VNode）。
第二个参数是“当前列信息”，里面能拿到 label / property / $`index 等。
代码逐行翻译
JavaScript
复制
const label = column.label          // 先把原始标题取出来
if (this.mode === 'add' || this.mode === 'edit') {
return h('span', \[                // 外包一个 <span>
h('span', { style: 'color: #F56C6C; margin-right: 4px;' }, '*'),  // 第一个子节点：红色星号
label                                                         // 第二个子节点：原始文字
])
}
return h('span', label)             // 非编辑模式就只返回纯文字
生成的虚拟 DOM 结构等效于：
HTML
预览
复制 <span> <span style="color:#F56C6C; margin-right:4px;">*</span>
设备名称 </span>
Element 会把这段 VNode 渲染到对应列的表头单元格里，于是你看到：
<https://img.alicdn.com/tfs/TB1kC8RPpP7gK0jSZFjXXc5aXXa-144-48.png>
怎么挂到列上
vue
复制
\<el-table-column
prop="equipmentName"
label="设备名称"
\:render-header="renderHeaderWithStar"\
/>
只要是“新增/编辑”模式，函数内部 this.mode 满足条件，就自动出现红星；查看/审批模式就只显示普通文字。
