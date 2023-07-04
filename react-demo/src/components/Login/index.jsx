import React from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, message } from 'antd';
import './index.css'

const Option = Select.Option;

function Login() {
  const navigate = useNavigate();

  const onFinish = (values) => {
    values.identity = (values.identity === 'admin' ? 0 : 1);
    axios.post('http://127.0.0.1:8800/api/login', values)
    .then(res => {
      const {status, message: msg, token} = res.data;
      if(!status) {
        message.success(msg);
        sessionStorage.token = token; // 登录成功则在 session 中存下 token，避免多个用户登录数据覆盖
        localStorage.removeItem('username'); // 在本地存用户的 username，方便后续使用
        localStorage.setItem('username', values.username);
        navigate('/home/welcome');
      }
      else {
        message.error(msg);
      }
    })
    .catch(err => {
      message.error(err.message);
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('请完善登录信息！');
  };

  return (
    <div className='box'>
      <div className='login-box'>
        <div style={{ textAlign: 'center' }}>
          <h1 className='title'>用户登录</h1>
        </div>
        <Form
          name="basic"
          className='login-form'
          initialValues={{ remember: true, }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="identity"
            rules={[{ required: true, message: 'Please choose your Identity!' }]}
          >
            <Select size='large' placeholder='请选择身份' allowClear>
              <Option key="normal" value="normal">普通用户</Option>
              <Option key="admin" value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
              <Input size='large' prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input size='large'
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>
              <Link to="/register" className="login-form-forgot">
                还没有账号？点击注册
              </Link>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              登录
            </Button>
          </Form.Item>
        </Form>
        
      </div>
      
    </div>
  );
}

export default Login;