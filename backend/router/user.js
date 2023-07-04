/* 这是用户注册登录路由模块 */

const express = require('express')
const router = express.Router()
const userHandler = require('../router_handler/user')

// 验证数据格式的中间件
const expressJoi = require('@escook/express-joi')

const { user_login_schema, user_register_schema } = require('../schema/user')

// 注册新用户
router.post('/reguser', expressJoi(user_register_schema), userHandler.regUser)

// 登录
router.post('/login', expressJoi(user_login_schema), userHandler.login)

// 获取所有用户信息
router.get('/users', userHandler.getAllUsers)

// 搜索指定用户名
router.get('/users/:value', userHandler.searchUsers)

// 删除指定用户
router.delete('/users/:id', userHandler.updateStatus)

// 修改指定用户的信息
router.put('/users/:id', userHandler.updateUsers)

// 修改指定用户的信息
router.put('/changeinfo/:username', userHandler.changeInfo)

// 修改指定用户的密码
router.put('/changepassword/:username', userHandler.changePass)

// 将路由对象共享出去
module.exports = router