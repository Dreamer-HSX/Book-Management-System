import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Result } from 'antd';
import './index.css'

function Register() {
  const navigate = useNavigate();
  const [result, setResult] = useState(false);

  const onFinish = (values) => {
    const { username, password, repeat_password, email } = values;
    if(password !== repeat_password) {
      message.warning('两次输入密码不一致！');
      return;
    }
    
    axios.post('http://127.0.0.1:8800/api/reguser', {
      username,
      password,
      email,
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {  // 数据提交成功
        setResult(true);
        setTimeout(() => {
          message.success(msg);
          navigate('/login');
          setResult(false);
        }, 3000);
      }
      else {
        message.error(msg);
      }
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善注册信息！');
  };

  return result ? (
    <div className="box">
      <Result
        status="success"
        title="Successfully Registered!"
        subTitle={`this page will jump to login page after ${3} seconds`}
        className="result"
        extra={[
          <Button size='large' type="primary" key="console"
            onClick={() => {
              message.success('注册成功！');
              navigate('/login');
              setResult(false); }
            }
          >
            Go Login
          </Button>
        ]}
      />
    </div>
    
  ) : (
    <div className='box'>
      <div className='login-box'>
        <div style={{ textAlign: 'center' }}>
          <h1 className='title'>用户注册</h1>
        </div>
        <Form
          name="basic"
          className='register-form'
          initialValues={{ remember: true, }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input a Username!' }]}
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

          <Form.Item
            name="repeat_password"
            rules={[{ required: true, message: 'Please input your Password again!' }]}
          >
            <Input size='large'
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="请再次输入密码"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input size='large'
                prefix={<MailOutlined className="site-form-item-icon" />}
                type="email"
                placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item>
              <Link to="/login" className="login-form-forgot">
                已有账号？点击登录
              </Link>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              注册
            </Button>
          </Form.Item>
        </Form>
        
      </div>
    </div>
  )
    
}

export default Register;