const express = require('express')
const cors = require('cors')
const joi = require('@hapi/joi')

const app = express(); // 实例化 express 对象
app.use(cors()); // 配置跨域中间件
app.use(express.json()); // 允许接受 json 数据格式文件
app.use(express.urlencoded({ extended: false })); // 解析 application/x-www-form-urlencoded 格式的表单数据

// 在路由之前给 res 绑定错误处理函数
app.use((req, res, next) => {
  // status 默认为 1，表示失败情况
  res.cc = (err, status = 1) => {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// // 在路由之前配置解析 Token 的中间件
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT({secret: config.jwtSecretKey}).unless({ path: [/^\/api/] }))


// 导入并使用用户登录和注册路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)
// 导入并使用书籍信息管理路由模块
const booksRouter = require('./router/book')
app.use('/my', booksRouter)
// 导入并使用书籍借阅路由模块
const borrowRouter = require('./router/borrow')
app.use('/my', borrowRouter)

// 注册全局错误中间件捕获错误
app.use((err, req, res, next) => {
  if(err instanceof joi.ValidationError) return res.cc(err)
  if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！', 500) // 处理 Token 验证失败错误
  res.cc(err)
})


/* 在 8080 端口开启服务器 */
app.listen(8800, () => {
  console.log("server running at http://127.0.0.1:8800");
});
