css常用样式以及容易混淆遗忘的样式：

1.  ==box-shadow:元素阴影==

    ```css
    box-shadow: h-offset v-offset blur spread color inset;
    ```

*   `h-offset`（水平偏移）：阴影在水平方向上的偏移量，正值向右，负值向左。
*   `v-offset`（垂直偏移）：阴影在垂直方向上的偏移量，正值向下，负值向上。
*   `blur`（模糊半径）：阴影的模糊程度，值越大阴影越模糊。
*   `spread`（扩展半径）：阴影的尺寸，正值使阴影扩大，负值使阴影缩小。
*   `color`（颜色）：阴影的颜色。
*   `inset`（内嵌阴影）：如果使用这个关键字，阴影会在元素内部显示，而不是外部。

    ==border-radius:圆角边框==

    ```css
    border-radius: length;
    ```
*   `length` 可以是数字（无单位）、百分比或任何有效的 CSS 长度单位（如 `px`、`em`、`rem`、`%` 等）
*   如果你只提供一个值，它将应用于元素的所有四个角
*   你可以提供两个值，第一个值应用于水平半径，第二个值应用于垂直半径
*   你可以提供四个值，分别应用于四个角，顺序为：左上角、右上角、右下角、左下角。例如：

```css
border-radius: 10px 20px 30px 40px;
```

==text-align==

是 CSS 中的一个属性，用于设置文本内容在元素中的水平对齐方式。这个属性可以应用于块级元素，如 `<div>`、`<p>`、`<h1>` 等，以控制其内部文本的对齐方式。

```css
/* 文本左对齐 */
.left-aligned {
  text-align: left;
}

/* 文本右对齐 */
.right-aligned {
  text-align: right;
}

/* 文本居中对齐 */
.center-aligned {
  text-align: center;
}

/* 文本两端对齐 */
.justify-aligned {
  text-align: justify;
}

/* 文本对齐到行首 */
.start-aligned {
  text-align: start;
}

/* 文本对齐到行尾 */
.end-aligned {
  text-align: end;
}
```

