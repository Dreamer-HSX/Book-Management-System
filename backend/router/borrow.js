/* 这是书籍借阅路由模块 */

const express = require('express')
const router = express.Router()
const borrowHandler = require('../router_handler/borrow')

router.get('/borrow', borrowHandler.getBorrowList) // 获取所有借阅信息

router.get('/borrow/:username', borrowHandler.getPersonalBorrow); // 获取指定用户的结束信息

router.put('/borrow/:id', borrowHandler.borrowBook) // 修改书籍库存和借书信息登记

router.get('/return/:id/:title', borrowHandler.returnBook) // 还书

module.exports = router