/* 这是书籍信息处理函数模块 */

const db = require('../db')

/* 返回要展示的书籍信息 */
exports.getAllBooks = (req, res) => {
  const q = "SELECT * FROM books where storage > 0 order by typeid"
  db.query(q, (err, results) => {
    if (err) return res.cc(err)
    // res.send(results)
    res.send({
      status: 0,
      message: '数据返回成功！',
      data: results,
    })
  });
}

/* 返回要展示书的种类 */
exports.getBooktypes = (req, res) => {
  const q = "SELECT * FROM booktypes order by typeid"
  db.query(q, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '数据返回成功！',
      data: results,
    })
  })
}

/* 添加前端数据到数据库中 */
exports.addNewBooks = (req, res) => {
  const q = "INSERT INTO books set ?"
  
  const values = {
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    typeid: req.body.typeid,
    press: req.body.press,
    author: req.body.author,
    storage: req.body.storage,
    updatetime: req.body.date,
    cover: req.body.cover,
  }

  db.query(q, values, (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('添加失败，请稍后再试！')
    res.cc('添加成功！', 0)
  })
}

/* 添加新的类别 */
exports.addNewTypes = (req, res) => {
  const q = "INSERT INTO booktypes set ?"
  db.query(q, req.body, (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('添加失败，请稍后再试！')
    res.cc('添加成功！', 0)
  })
}

/* 前端搜索引擎的查询关键字 */
exports.searchBooks = (req, res) => {
  const {keyword, word} = req.body;
  const q = keyword === "typename" ?
            `SELECT * FROM books natural join booktypes WHERE ${keyword} = (?)`: 
            `SELECT * FROM books WHERE ${keyword} = (?)`;
  
  db.query(q, [word], (err, results) => {
    if (err) return res.cc(err);
    res.send({
      status: 0,
      message: '搜索完成！',
      data: results,
    })
  });
}

/* 删除 */
exports.deleteBooks = (req, res) => {
  const bookId = req.params.id; // 通过 params 传参
  const q = " DELETE FROM books WHERE id = ? ";

  db.query(q, [bookId], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('删除失败，请稍后再试！')
    res.cc('删除成功！', 0)
  });
}

/* 修改 */
exports.updateBooks = (req, res) => {
  const bookId = req.params.id;
  const q = "UPDATE books SET `typeid`= ?, `price`= ?, `storage`= ?, `desc`= ? WHERE id = ?";

  const values = [
    req.body.typeid,
    req.body.price,
    req.body.storage,
    req.body.desc,
  ];

  db.query(q, [...values,bookId], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('修改失败，请稍后再试！')
    res.cc('修改成功！', 0)
  });
}