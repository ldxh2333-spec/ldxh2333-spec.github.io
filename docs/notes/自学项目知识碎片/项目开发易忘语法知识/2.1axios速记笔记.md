# axios速记笔记

## 1️⃣ 安装

```javascript
npm i axios	        # 下载 axios 库
```

***

## 2️⃣ 创建专属实例（utils/request.js）

```javascript
import axios from 'axios'

// 创建 axios 实例，后续所有请求都用这个实例
const request = axios.create({
  baseURL: '/api',   // 统一前缀：任何请求都会自动拼上 /api
  timeout: 8000      // 8 秒无响应就超时
})

// 响应拦截器：统一对「所有返回」做处理
request.interceptors.response.use(
  response => response.data,  // 直接取出后端数据，省得每次都 .data
  error => {                  // 请求失败时
    alert(error?.response?.data?.message || '请求失败') // 统一弹错误
    return Promise.reject(error)
  }
)

export default request        // 导出实例，全局使用
```

***

## 3️⃣ 四种最常用的请求方法

```javascript
import request from '@/utils/request'

// GET 获取数据
const getUser = async () => {
  const data = await request.get('/user')        // 无参数
  const list = await request.get('/list', {      // 带查询参数
    params: { page: 1, size: 10 }                // 自动拼成 /list?page=1&size=10
  })
}

// POST 提交 JSON
const addUser = async (userInfo) => {
  const res = await request.post('/user', userInfo) // 直接把对象发过去
}

// PUT 修改整份数据
const updateUser = async (id, newData) => {
  await request.put(`/user/${id}`, newData)
}

// DELETE 删除
const delUser = async (id) => {
  await request.delete(`/user/${id}`)
}
```

***

## 4️⃣ 上传文件（表单方式）

```javascript
const uploadFile = async (file) => {
  const form = new FormData()    // 创建表单对象
  form.append('file', file)      // 把文件塞进去
  const res = await request.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }  // 告诉后端是文件
  })
}
```

***

## 5️⃣ 全局统一 Header（如 token）

```javascript
// 登录成功后保存 token
request.defaults.headers.common['Authorization'] = localStorage.getItem('token')
```

***

## 6️⃣ 速查笔记（一行背完）

| 目的          | 一行代码                                                                                        |
| :---------- | :------------------------------------------------------------------------------------------ |
| GET 无参      | `await request.get('/api')`                                                                 |
| GET 带 query | `await request.get('/api',{params:{k:v}})`                                                  |
| POST JSON   | `await request.post('/api', dataObj)`                                                       |
| 统一错误提示      | 已在拦截器写好，不用管                                                                                 |
| 上传文件        | `await request.post('/upload', formData, {headers:{'Content-Type':'multipart/form-data'}})` |

***

## 7️⃣ 拦截器大全（请求 + 响应）

```javascript
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 8000
})

/* 1️⃣ 请求拦截器：发请求前统一处理 */
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token  // 统一携带 token
    }
    return config
  },
  error => {
    // 请求错误时做些什么
    return Promise.reject(error)
  }
)

/* 2️⃣ 响应拦截器：收到响应后统一处理 */
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么（通常只返回 data）
    return response.data
  },
  error => {
    // 对响应错误做点什么
    const msg = error?.response?.data?.message || '请求失败'
    alert(msg)
    return Promise	.reject(error)  // 继续向上传递错误，方便 try/catch
  }
)

export default request
```

***

## 8️⃣ 速查表（拦截器场景）

| 场景                | 在拦截器里做的事                                                   |
| :---------------- | :--------------------------------------------------------- |
| 统一加 token         | `config.headers['Authorization'] = token`                  |
| 统一设置 Content-Type | `config.headers['Content-Type'] = 'application/json'`      |
| 统一错误提示            | `alert(error.response.data.message)`                       |
| 统一错误码处理           | `if (error.response.status === 401) router.push('/login')` |

> 口诀：\
> “实例化一次，路径前缀写死；四行方法 CRUD；拦截器统一错误；文件上传别忘 FormData。”

