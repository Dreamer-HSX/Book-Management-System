/* 这是书籍借阅处理函数模块 */

const db = require('../db')

/* 返回所有借阅信息 */
exports.getBorrowList = (req, res) => {
  const q = "SELECT * FROM borrow"
  db.query(q, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '数据返回成功！',
      data: results,
    })
  });
}

/* 返回指定用户的借阅信息 */
exports.getPersonalBorrow = (req, res) => {
  const { username } = req.params;
  const q = "select * from borrow where username = ?"
  db.query(q, [username], (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '数据返回成功！',
      data: results,
    })
  });
}

/* 借书 */
exports.borrowBook = (req, res) => {
  const bookId = req.params.id;
  const values = req.body;
  const sql = 'update books set storage = storage - 1 where id = ?'
  db.query(sql, [bookId], (err, results) => { // 先将库存更新
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('库存更新失败，请稍后再试！')
    const q = 'insert into borrow set ?'
    db.query(q, values, (err, results) => { // 再更新借阅信息
      if(err) return res.cc(err)
      if(results.affectedRows !== 1) return res.cc('借阅更新失败，请稍后再试！')
      res.cc('借阅成功！', 0)
    })
  });
}

/* 还书 */
exports.returnBook = (req, res) => {
  const { id, title } = req.params;
  const sql = 'update books set storage = storage + 1 where title = ?'
  db.query(sql, [title], (err, results) => { // 先将库存更新
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('还书失败，请稍后再试！')
    const q = 'delete from borrow where id = ?'
    db.query(q, [id], (err, results) => { // 再删除借阅信息
      if(err) return res.cc(err)
      if(results.affectedRows !== 1) return res.cc('还书失败，请稍后再试！')
      res.cc('还书成功！', 0)
    })
  });
}