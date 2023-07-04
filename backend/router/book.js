/* 这是书籍信息管理路由模块 */

const express = require('express')
const router = express.Router()
const bookHandler = require('../router_handler/book')

router.get('/books', bookHandler.getAllBooks) // 获取所有书籍信息

router.get('/booktypes', bookHandler.getBooktypes) // 获取所有分类

router.post('/books', bookHandler.addNewBooks) // 添加书籍

router.post('/booktypes', bookHandler.addNewTypes) // 添加种类

router.post('/search', bookHandler.searchBooks) // 搜索

router.delete('/books/:id', bookHandler.deleteBooks) // 删除

router.put('/books/:id', bookHandler.updateBooks) // 修改

module.exports = router