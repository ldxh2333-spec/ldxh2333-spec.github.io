```css
show-overflow-tooltip默认不换行，会导致屏幕溢出，需要自己处理一下：
/* Tooltip 换行样式 */
.el-tooltip__popper {
  max-width: 400px !important;
  white-space: normal !important;
  word-break: break-all !important;
  letter-spacing: 1px;   /* 新增：字符间隔 */
}

段样式只做一件事：让 Element-UI 的 Tooltip 气泡里“长文本”自动换行，防止出现横向滚动条或超出屏幕。
逐行解释：
样式	作用
max-width: 400px !important	给气泡一个固定上限宽度，超过就换行（默认没上限，可能撑满屏）。
white-space: normal !important	把 Element 默认的 white-space: nowrap 覆盖掉，允许自动换行。
word-break: break-all !important	英文/数字连续字符串太长时，任意字符处都可断行，防止单词溢出。
使用场景
字段说明、错误详情、接口返回的堆栈信息等超长文本。
中英文混排、URL、日志路径等无空格长串。
一句话总结
“给 Tooltip 加宽度上限，并强制自动换行，再长的话连英文数字都允许中间断开，保证不撑破屏幕。”
```

