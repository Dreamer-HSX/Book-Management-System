const joi = require('joi');
// 定义用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
const identity = joi.number().integer()
const email = joi.string().pattern(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).required()

exports.user_login_schema = {
  body: {
    username,
    password,
    identity,
  },
}

exports.user_register_schema = {
  body: {
    username,
    password,
    email,
  },
}