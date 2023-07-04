import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserOutlined, LockOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
import { Space, Table, Tag, Button, Pagination, message, Modal, Form, Input, Skeleton, Select, } from 'antd';

const Option = Select.Option;
const Search = Input.Search;

const App = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState([]);
  const [form] = Form.useForm(); // 添加用户的模态框
  const [open, setOpen] = useState(false); // 模态框默认状态为关闭
  const [user, setUser] = useState({}); // 点击 update 传入的参数
  const [updateform] = Form.useForm(); // 修改用户的模态框
  const [updateopen, setUpdateOpen] = useState(false); // 模态框默认状态为关闭
  const [confirmLoading, setConfirmLoading] = useState(false); // 确定按钮是否处于加载状态
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '身份',
      dataIndex: 'identity',
      key: 'identity',
      render: (text) => <>{text ? '普通用户' : '管理员'}</>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <a>{text}</a>
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (text) => (
        <Tag color={text ? 'volcano' : 'green'}>
          {text ? '禁用' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'operation',
      render: (_, row) => (
        <Space>
          <Button onClick={e => handleUpdate(row)} block>
            update
          </Button>
          {/* <Button style={
            row.status ?
            {background:'#f6ffed', color:'#389e0d', borderColor:'#b7eb8f'} :
            {background:'#fff2e8', color:'#d4380d', borderColor:'#ffbb96'}
            } onClick={e => handleClick(row)} block>
              {row.status ? 'start' : 'ban'}
          </Button> */}
          <Button onClick={e => handleClick(row)} block>
              {row.status ? 'start' : 'ban'}
          </Button>
        </Space>
      ),
    },
  ];

  const handleClick = (user) => {
    axios.delete(`http://localhost:8800/api/users/${user.id}`)
      .then(res => {
        const { status, message: msg } = res.data;
        if (!status) {
          message.success(`状态${msg}`);
          showTable(); // 重新获取数据更新表单
        }
        else {
          message.error(msg);
        }
      })
  }

  const handleUpdate = (row) => {
    setUser(row);
    updateform.setFieldValue('identity', row.identity === 0 ? '管理员' : '普通用户');
    updateform.setFieldValue('update_email', row.email);
    setUpdateOpen(true); // 打开修改用户信息的模态框
  }

  const handleUpdateCancel = () => {
    setUpdateOpen(false); // 关闭修改用户信息的模态框
    updateform.resetFields();
  }

  /* 用户信息修改的成功的回调函数 */
  const handleUpdateOk = (data) => {
    let {identity, update_email: email} = data;
    identity = identity === 'admin' ? 0 : 1;

    setConfirmLoading(true);
    axios.put(`http://127.0.0.1:8800/api/users/${user.id}`, {
      identity,
      email,
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => {
          message.success(msg);
          setUpdateOpen(false);
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
  }

  const handleAdd = () => {
    setOpen(true);
  }

  const handleOk = (data) => {
    const {username, password, email} = data;

    setConfirmLoading(true);
    axios.post('http://127.0.0.1:8800/api/reguser', {
      username,
      password,
      email,
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => {
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

  const onUpdateFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善必要信息！');
  };

  window.timer = null; // 利用防抖解决 useEffect 执行两次的问题

  useEffect(() => {
    clearTimeout(window.timer);
    window.timer = setTimeout(() => {
      setLoading(true);
      setTimeout(() => { // 在发送请求前先缓冲一段时间
        setLoading(false);
      }, 1500);

      showTable();
    }, 0)
  }, [])

  const onSearch = (value) => {
    setLoading(true);
    setTimeout(() => { // 在发送请求前先缓冲一段时间
      setLoading(false);
    }, 1500);

    axios.get(`http://localhost:8800/api/users/${value}`)
      .then(res => {
        const { data } = res.data;
        if(!data.status) {
          setData(data);
          setTotal(data.length);
        }
        else {
          message.error(data.message);
        }
      })
      .catch(err => {
        message.error(err.message);
      })
  }

  const showTable = () => {
    axios.get(`http://localhost:8800/api/users`)
      .then(res => {
        const { data } = res.data;
        if(!data.status) {
          setData(data);
          setTotal(data.length);
        }
        else {
          message.error(data.message);
        }
      })
      .catch(err => {
        message.error(err.message);
      })
  }

  return (
    <div>
      <Button type='primary' size='large' style={{ marginBottom: 10, marginRight: 10 }} onClick={handleAdd}><PlusOutlined />add user</Button>
      <Search size='large' style={{width:400, marginLeft: 10, marginBottom: 10 }} placeholder="input search username" onSearch={onSearch} enterButton />
      {
        loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <>
            <Table size='large' columns={columns} dataSource={data} rowKey={"id"} pagination={false} />
            <Pagination
              defaultCurrent={1}
              defaultPageSize={3}
              pageSizeOptions={[3, 6, 9]}
              style={{ marginTop: '10px' }}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共有 ${total} 条数据`}
            />
          </>
        )
      }
      <Modal
        title="add user"
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Form
          name="add basic"
          labelCol={{ span: 6, }}
          wrapperCol={{ span: 16 }}
          form={form}
          initialValues={{ remember: true, }}
          onFinish={handleOk}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="username"
            rules={[{ required: true, message: 'Please input a Username!' }]}
          >
            <Input size='large' prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input size='large'
              prefix={<LockOutlined />}
              type="password"
              placeholder="请输入密码"
            />
          </Form.Item>

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
        title="update user"
        open={updateopen}
        onCancel={handleUpdateCancel}
        onOk={handleUpdateOk}
        footer={null}
      >
        <Form
          name="update basic"
          labelCol={{ span: 6, }}
          wrapperCol={{ span: 16 }}
          form={updateform}
          initialValues={{ remember: true, }}
          onFinish={handleUpdateOk}
          onFinishFailed={onUpdateFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="identity"
            label="identity"
            rules={[{ required: true, message: 'Please choose the identity!' }]}
          >
            <Select size='large' placeholder='请选择身份' allowClear>
              <Option key="normal" value="normal">普通用户</Option>
              <Option key="admin" value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="update_email"
            label="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input size='large'
              prefix={<MailOutlined/>}
              type="email"
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ marginRight:'40px' }}>
              确定
            </Button>
            <Button type="primary" onClick={handleUpdateCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default App;