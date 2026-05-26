1.  真实场景：

```javascript
    hasDeletable() {
      // 检查是否有可删除的选中项（排除系统自动生成的）
      return this.selected.some(it => it.source !== 'system')
    }
解释：
.some(...) 是 Array.prototype.some，用来“测试数组里是否至少有一个元素满足给定条件”。
回调函数 it => it.source !== 'system' 就是“条件”——只要数组里出现任何一个元素的 source 属性不等于 'system'，整个表达式就返回 true；否则返回 false。

例子：
const scores = [3, 7, 9, 4];
const hasHigh = scores.some(s => s >= 8); // true（9 满足）
const allPass  = scores.every(s => s >= 5); // false（3、4 不满足）

对比记忆：
.some() → “存在一个满足？”
.every() → “所有都满足？”
```

