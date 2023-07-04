import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, Button, Descriptions, Tag, message, Form, Modal, Input, Upload } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

export default function BasicInfo() {
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [open2, setOpen2] = useState(false);
  const [form2] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  const onPreview = async (file) => {
  };
  
  const handleEdit = (e) => {
    form.setFieldValue('email', user.email);
    setOpen(true); // 打开修改用户信息的模态框
  }

  const handleOk = (data) => {
    const {email} = data;
    setConfirmLoading(true);
    axios.put(`http://127.0.0.1:8800/api/changeinfo/${user.username}`, {
      email,
      avatar: `../avatar/${data.avatar.file.name}`
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => { // 在发送请求前先缓冲一段时间
          message.success(msg);
          setOpen(false);
          setConfirmLoading(false);
        }, 1500);
        showTable();
      }
      else {
        setConfirmLoading(false);
        console.log('Failed:', res.data);
        message.error(msg);
      }
    })
    .catch(err => {
      setConfirmLoading(false);
      message.error(err.message);
      console.log(err);
    })
  };

  /* 当点击取消按钮和模态框外部时都会触发handleCancel */
  const handleCancel = () => {
    setOpen(false);
    form.resetFields(); // 点击取消按钮后清空表单中的所有数据
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善必要信息！');
  };

  const handleEditpass = (e) => {
    setOpen2(true); // 打开修改用户信息的模态框
  }

  const handleOkpass = (data) => {
    const {originPassword, newPassword} = data;
    console.log(originPassword, newPassword)
    setConfirmLoading(true);
    axios.put(`http://127.0.0.1:8800/api/changepassword/${user.username}`, {
      originPassword,
      newPassword,
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => { // 在发送请求前先缓冲一段时间
          message.success(msg);
          setOpen2(false);
          setConfirmLoading(false);
          form2.resetFields();
        }, 1500);
        showTable();
      }
      else {
        setConfirmLoading(false);
        console.log('Failed:', res.data);
        message.error(msg);
      }
    })
    .catch(err => {
      setConfirmLoading(false);
      message.error(err.message);
      console.log(err);
    })
  };

  /* 当点击取消按钮和模态框外部时都会触发handleCancel */
  const handleCancelpass = () => {
    setOpen2(false);
    form2.resetFields(); // 点击取消按钮后清空表单中的所有数据
  };

  const onFinishFailedpass = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善必要信息！');
  };

  useEffect(() => {
    showTable();
  }, [])

  const showTable = () => {
    axios.get(`http://localhost:8800/api/users/${localStorage.username}`)
    .then(res => {
      const { data, status, message: msg } = res.data;
      if(!status) {
        setUser(data[0]); // 注意后端查询结果返回的是数组
      }
      else {
        message.error(msg);
      }
    })
    .catch(err => {
      message.error(err.message);
    })
  }

  return (
    <div style={{ width: 800, margin: 'auto', textAlign: 'center' }}>
      {
        user.avatar ? 
        <Avatar size={250} src={<img src={user.avatar} alt="avatar" />} /> :
        <Avatar size={250} icon={<UserOutlined />} />
      }
      <Descriptions title="用户信息" layout='vertical' bordered style={{ textAlign: 'left' }} extra={<Button type="primary" onClick={handleEdit}>编辑</Button>}>
        <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
        <Descriptions.Item label="身份">{user.identity === 0 ? '管理员' : '普通用户'}</Descriptions.Item>
        <Descriptions.Item label="密码">
          <Button type="link" onClick={handleEditpass}>修改密码</Button>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={user.status ? 'volcano' : 'green'}>
            {user.status ? '禁用' : '正常'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Modal
        title="edit information"
        centered={true}
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Form
          name="edit email"
          labelCol={{ span: 6, }}
          wrapperCol={{ span: 16 }}
          form={form}
          initialValues={{ remember: true, }}
          onFinish={handleOk}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input size='large'
              prefix={<MailOutlined/>}
              type="email"
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="avatar"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
            >
              {fileList.length < 1 && '+ 上传头像 '}
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ marginRight:'40px' }}>
              确定
            </Button>
            <Button type="primary" onClick={handleCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="edit password"
        centered={true}
        open={open2}
        onCancel={handleCancelpass}
        onOk={handleOkpass}
        footer={null}
      >
        <Form
          name="edit password"
          labelCol={{ span: 8, }}
          wrapperCol={{ span: 16 }}
          form={form2}
          initialValues={{ remember: true, }}
          onFinish={handleOkpass}
          onFinishFailed={onFinishFailedpass}
          autoComplete="off"
        >
          <Form.Item
            name="originPassword"
            label="original password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input size='large'
              prefix={<LockOutlined />}
              type="password"
              placeholder="请输入原始密码"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="new password"
            rules={[{ required: true, message: 'Please input your Password again!' }]}
          >
            <Input size='large'
              prefix={<LockOutlined />}
              type="password"
              placeholder="请输入更改后密码"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ marginRight:'40px' }}>
              确定
            </Button>
            <Button type="primary" onClick={handleCancelpass}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
