在 axios 里，`config` 就是\*\*“一次请求的完整配置对象”\*\*——你告诉 axios **“去哪个地址、用什么方法、带什么数据、带什么头、超时多久……”** 的全部信息。

***

### ✅ 最常见的出现位置

1.  **创建实例时**

    ```javascript
    const request = axios.create({
      baseURL: '/api',   // ← 这些都是 config 字段
      timeout: 8000
    })
    ```
2.  **单次请求时**

    ```javascript
    axios({
      url: '/user',
      method: 'post',
      data: { name: 'Tom' },
      headers: { 'token': 'abc' },
      timeout: 5000
    })
    ```
3.  **拦截器里**

    ```javascript
    request.interceptors.request.use(
      config => {               // ← 这里的 config 就是即将发出的请求配置
        config.headers['token'] = 'xxx'
        return config            // 必须 return，不然请求发不出去
      }
    )
    ```

***

### 📋 高频字段速查表

| 字段             | 作用一句话                      |
| :------------- | :------------------------- |
| `url`          | 请求地址                       |
| `method`       | 请求方法（get/post/put/delete…） |
| `baseURL`      | 统一前缀，自动拼到 url 前面           |
| `params`       | 查询字符串 `?page=1&size=10`    |
| `data`         | 请求体（POST/PUT 用）            |
| `headers`      | 请求头                        |
| `timeout`      | 超时毫秒数                      |
| `responseType` | 返回数据类型（json / blob / text） |

***

### 🎯 口诀

> “config = 请求说明书：地址、方法、数据、头、超时，缺啥补啥。”

1.  **源码默认值**

    ```javascript
    // axios 内部
    const defaultConfig = { url: '' };   // 默认 url 是空字符串
    ```
2.  **你使用时**

    ```javascript
    // 写法 A：整体对象
    axios({ url: '/user' });
    // 写法 B：拦截器里点属性
    config.url = '/user';
    ```

    最终都会**合并到同一个 `config` 对象**，然后 axios 用 `config.url` 去发请求。

> **一句话**：\
> 你传进来的 `url: '/user'` 就是 **给 `config.url` 赋值**，两者最终指向同一字段。

