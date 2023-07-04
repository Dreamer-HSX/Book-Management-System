/* 这是用户注册登录处理函数模块 */

const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { result } = require('@hapi/joi/lib/base')

// 注册用户的处理函数
exports.regUser = (req, res) => {
  const userinfo = req.body;
  
  if(!userinfo.username || !userinfo.password) {
    return res.cc('用户名或密码不合法！')
  }

  const sqlStr = 'select * from users where username = ?'
  db.query(sqlStr, [userinfo.username], (err, results) => {
    if(err) {
      return res.cc(err)
    }

    if(results.length > 0) {
      return res.cc('用户名已被占用！')
    }

    // 调用 bcrypt.hashSync() 对密码进行加密，参数2为随机盐长度
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    const sql = 'insert into users set ?'
    db.query(sql, { username: userinfo.username, password: userinfo.password, email: userinfo.email }, (err, results) => {
      if(err) return res.cc(err)
      
      if(results.affectedRows !== 1) return res.cc('注册失败，请稍后再试！')

      res.cc('注册成功！', 0)
    })
  })
}

// 登录的处理函数
exports.login = (req, res) => {
  const userinfo = req.body
  const sql = `select * from users where username = ?`
  db.query(sql, [userinfo.username], (err, results) => {
    if(err) return res.cc(err)

    if(results.length !== 1) return res.cc(`账号或密码错误！`)
    
    if(results[0].identity !== userinfo.identity) return res.cc('用户不存在！')

    if(results[0].status) return res.cc('该用户已被禁用，请联系管理员')
    
    const compare = bcrypt.compareSync(userinfo.password, results[0].password)
    if(!compare) {
      return res.cc(`账号或密码错误！`)
    }

    // 生成 JWT 的 Token 字符串
    const user = { ...results[0], password: '', avatar: '' }
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn }) // 最后一个参数为 token 有效期
    res.send({
      status: 0,
      message: '登录成功！',
      token: 'Bearer ' + tokenStr,
    })
  })
}

exports.getAllUsers = (req, res) => {
  const sql = 'select * from users'

  db.query(sql, (err, results) => {
    if(err) return res.cc(err)
    res.send({
      status: 0,
      message: '数据返回成功',
      data: results,
    })
  })
}

exports.searchUsers = (req, res) => {
  const name = req.params.value;
  const sql = `select * from users where username = ?`

  db.query(sql, [name], (err, results) => {
    if(err) return res.cc(err)
    res.send({
      status: 0,
      message: '数据返回成功',
      data: results,
    })
  })
}

exports.deleteUsers = (req, res) => {
  const userId = req.params.id; // 通过 params 传参
  const sql = " DELETE FROM users WHERE id = ? ";

  db.query(sql, [userId], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('删除失败，请稍后再试！')
    res.cc('删除成功！', 0)
  });
}

exports.updateStatus = (req, res) => {
  const userId = req.params.id;

  const sql = 'select * from users where id = ?'
  db.query(sql, [userId], (err, results) => {
    if(err) return res.cc(err)
    if(results.length !== 1) return res.cc('更改失败，请稍后再试！')

    const q = "UPDATE users SET status = ? WHERE id = ?";
    db.query(q, [!results[0].status, userId], (err, results) => {
      if(err) return res.cc(err)
      if(results.affectedRows !== 1) return res.cc('更改失败，请稍后再试！')
      res.cc('更改成功！', 0)
    });
  })
}

exports.updateUsers = (req, res) => {
  const userId = req.params.id;
  const q = "UPDATE users SET email = ?, identity = ? WHERE id = ?";

  const values = [
    req.body.email,
    req.body.identity,
  ];

  db.query(q, [...values, userId], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('修改失败，请稍后再试！')
    res.cc('修改成功！', 0)
  });
}

exports.changeInfo = (req, res) => {
  const name = req.params.username
  const q = 'update users set email = ?, avatar = ? where username = ?'
  db.query(q, [req.body.email, req.body.avatar, name], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('修改失败，请稍后再试！')
    res.cc('修改成功！', 0)
  })
}

exports.changePass = (req, res) => {
  const name = req.params.username
  const userInfo = req.body; // 注意这里不能解构赋值，会将字符串类型转为数字类型
  const q = 'select * from users where username = ?'
  db.query(q, [name], (err, results) => { // 先对比原始密码
    if(err) return res.cc(err)
    const compare = bcrypt.compareSync(userInfo.originPassword, results[0].password) // 注意这里对比输入密码和原始密码时必须用内置的函数
    if(!compare) {
      return res.cc(`原始密码错误！`)
    }
    
    const newPassword = bcrypt.hashSync(userInfo.newPassword, 10) // 再加密新的密码
    const sql = 'update users set password = ? where username = ?'
    db.query(sql, [newPassword, name], (err, results) => {
      if(err) return res.cc(err)
      if(results.affectedRows !== 1) return res.cc('修改失败，请稍后再试！')
      res.cc('密码修改成功！', 0)
    })
  })
}