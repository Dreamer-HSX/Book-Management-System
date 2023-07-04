import React, { useEffect, useState } from "react";
import axios from "axios"; // 用于发送 api 请求
import PubSub from 'pubsub-js';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BookFilled, CopyFilled, MoneyCollectFilled, TagFilled, IdcardFilled } from '@ant-design/icons';
import { Button, Input, Select, Table, Image, Space, Popconfirm, Tag, Skeleton, Modal, Form, message, Upload } from 'antd';
// import ImgCrop from 'antd-img-crop';
import Search from "../../components/Search";
import { useForm } from "antd/es/form/Form";

const { TextArea } = Input;

const color = ["magenta", "lime", "red", "green", "volcano", "cyan", "orange","blue", "gold", "geekblue","purple", "gray"];

/**
 * 该函数组件用于获取并展示数据库中的所有书籍 
 * */ 
const Books = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = useForm();
  const [open, setOpen] = useState(false);
  const [book, setBook] = useState({}); // 点击 update 传入的参数
  const [updateform] = Form.useForm(); // 修改书信息的模态框
  const [updateopen, setUpdateOpen] = useState(false); // 模态框默认状态为关闭
  const [typeform] = Form.useForm(); // 添加书种类的模态框
  const [typeopen, setTypeOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false); // 确定按钮是否处于加载状态
  const navigate = useNavigate();

  const [fileList, setFileList] = useState([]);
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  const onPreview = async (file) => {
  };

  const columns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 150,
    },
    {
      title: "封面",
      dataIndex: "cover",
      key: "cover",
      ellipsis: true,
      width: 100,
      render: (text) => (
        <Image
          alt=""
          width={50}
          height={50}
          src={
            text !== ""
              ? text
              : "img/nopic.jpg"
          }
        />
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      ellipsis: true,
      width: 120,
    },
    {
      title: '类别',
      dataIndex: 'typeid',
      key: 'typeid',
      ellipsis: true,
      width: 100,
      render: (text) => (
        <Tag color={text ? color[(text - 1) % 11] : color[11]}>
          {text ? types[text - 1]: '未分类'}
        </Tag>
      )
    },
    {
      title: '出版社',
      dataIndex: 'press',
      key: 'press',
      ellipsis: true,
      width: 120,
    },
    {
      title: '库存量',
      dataIndex: 'storage',
      key: 'storage',
      ellipsis: true,
      width: 100,
    },
    {
      title: '操作',
      dataIndex: "",
      key: 'operation',
      ellipsis: true,
      width: 120,
      render: (_, row) => (
        books.length >= 1 ? (
          <Space>
            <Button onClick={e => handleUpdate(row)} block>
                Update
            </Button>
            <Popconfirm title="确定要删除此书吗？" onConfirm={() => handleDelete(row.id)}>
              <Button block>Delete</Button>
            </Popconfirm>
        </Space>
        ): null
      ),
    },
  ];

  useEffect(() => {
    // 发送 api 请求为异步函数
    setTimeout(() => { // 在发送请求前先缓冲一段时间
      setLoading(false);
    }, 1800);

    axios.get('http://localhost:8800/my/books', {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const data = res.data;
      if(!data.status) {
        setBooks(data.data);
        setTotal(data.data.length);
      }
      else {
        message.error(data.message);
        if(data.status === 500) {
          navigate('/unauthorized');
        }
      }
    })
    .catch(err => {
      message.error(err.message);
      console.log(err);
    })
    axios.get("http://localhost:8800/my/booktypes", {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const data = res.data;
      if(!data.status) {
        let tmp = data.data;
        for(let i=0;i<tmp.length;i++){
          tmp[i] = tmp[i].typename;
        }
        setTypes(tmp);
      }
      else {
        if(data.status !== 500) message.error(data.message);
      }
    })
    .catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }, []); // [] 空数组表示 dependency 为空，表示只会运行一次

  useEffect(() => {
    const token = PubSub.subscribe("search results", (msg, data) => {
      setLoading(true);
      setTimeout(() => { // 在发送请求前先缓冲一段时间
        setLoading(false);
      }, 1500);

      setBooks(data); // 更新要展示书的状态
      setTotal(data.length); // 同时更新书的总数量
    })
    return () => {
      PubSub.unsubscribe(token); // 取消订阅
    }
  }, [])

  const handleUpdate = (row) => {
    setBook(row);
    updateform.setFieldValue('typeid', row.typeid);
    updateform.setFieldValue('price', row.price);
    updateform.setFieldValue('storage', row.storage);
    updateform.setFieldValue('desc' ,row.desc);
    setUpdateOpen(true); // 打开修改书信息的模态框
  }

  const handleUpdateCancel = () => {
    setUpdateOpen(false); // 关闭修改书信息的模态框
    updateform.resetFields();
  }

  /* 书籍信息修改的成功的回调函数 */
  const handleUpdateOk = (data) => {
    setConfirmLoading(true);
    axios.put(`http://127.0.0.1:8800/my/books/${book.id}`, data, {
      headers: {
        Authorization: sessionStorage.token
      }
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
        message.error(msg);
        if(status === 500) {
          navigate('/unauthorized');
        }
      }
    })
  }

  const handleDelete = (id) => {
    setLoading(true);
    setTimeout(() => { // 在发送请求前先缓冲一段时间
      setLoading(false);
    }, 1000);
    axios.delete(`http://localhost:8800/my/books/${id}`, {
      headers: {
        Authorization: sessionStorage.token
      }
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        message.success(msg);
        showTable();
      }
      else {
        message.error(msg);
        if(status === 500) {
          navigate('/unauthorized');
        }
      }
    })
  }

  const handleAdd = () => {
    setOpen(true);
  }

  const handleOk = (data) => {
    const date = format(new Date(), 'yyyy-MM-dd');
    setConfirmLoading(true);
    axios.post('http://127.0.0.1:8800/my/books', {...data, date, cover: `../img/${data.cover.file.name}` }, {
      headers: {
        Authorization: sessionStorage.token
      }
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
        message.error(msg);
        if(status === 500) {
          navigate('/unauthorized');
        }
      }
    })
  }

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善必要信息！');
  };

  const showTable = () => {
    axios.get(`http://localhost:8800/my/books`, {
      headers: {
        Authorization: sessionStorage.token
      }
    })
      .then(res => {
        const { data, status, message: msg } = res.data;
        if(!status) {
          setBooks(data);
          setTotal(data.length);
        }
        else {
          message.error(msg);
          if(status === 500) {
            navigate('/unauthorized');
          }
        }
      })
      .catch(err => {
        message.error(err.message);
      })
  }

  const handleType = () => {
    setTypeOpen(true);
  }

  const handleOkType = (data) => {
    const { typename } = data;
    for(let i = 0; i < types.length; i++) { // 判断是否有该种类
      if(types[i] === typename) {
        return message.warning(`已有 ${typename} 种类`);
      }
    }
    setConfirmLoading(true);
    axios.post('http://127.0.0.1:8800/my/booktypes', {typeid: types.length + 1, ...data}, {
      headers: {
        Authorization: sessionStorage.token
      }
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => {
          message.success(msg);
          setTypeOpen(false);
          setConfirmLoading(false);
        }, 1000);
        setTypes([...types, typename]);
      }
      else {
        setConfirmLoading(false);
        message.error(msg);
        if(status === 500) {
          navigate('/unauthorized');
        }
      }
    })
    .catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }

  const handleCancelType = () => {
    setTypeOpen(false);
    typeform.resetFields();
  }

  const onFinishFailedType = () => {
    message.warning('请完善必要信息！');
  }

  return (
    <div>
      <Search />
      
      <div style={{ display: 'inline-block', float: 'right' }}>
        <Button type="primary" onClick={handleType}>Add new types</Button>
        <Button type="primary" style={{marginLeft: 10}} onClick={handleAdd}>Add new book</Button>
      </div>
      
      {
        loading ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          <div className="books">
            <Table
              columns={columns}
              dataSource={books}
              rowKey={"id"}
              expandable={{
                expandedRowRender: (record) => (
                  <p style={{ margin: 0, }} ><b>内容介绍：</b> {record.desc}</p>
                )
              }}
              // 右下角数据总数和翻页器展示
              pagination={{
                total: total,
                showTotal: () => `共有 ${total} 条记录`,
              }}
            />
          </div>
        )
      }

      <Modal
        title="add"
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Form
          name="add"
          labelCol={{ span: 5, }}
          wrapperCol={{ span: 17 }}
          form={form}
          initialValues={{ remember: true, }}
          onFinish={handleOk}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="title"
            rules={[{ required: true, message: 'Please input the book title!' }]}
          >
            <Input size='large' prefix={<BookFilled className="site-form-item-icon" />} placeholder="请输入书名" />
          </Form.Item>

          <Form.Item
            name="typeid"
            label="typeid"
            rules={[{ required: true, message: 'Please choose the type!' }]}
          >
            <Select size='large' placeholder='请选择书的种类' allowClear options={types.map((typename, i) => ({ label: typename, value: i+1 }))} />
          </Form.Item>

          <Form.Item
            name="press"
            label="press"
          >
            <Input size='large'
              prefix={<CopyFilled />}
              placeholder="请输入出版社"
            />
          </Form.Item>

          <Form.Item
            name="author"
            label="author"
            rules={[{ required: true, message: 'Please input the author name!' }]}
          >
            <Input size='large'
              prefix={<IdcardFilled />}
              placeholder="请输入作者姓名"
            />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="price"
          >
            <Input size='large'
              prefix={<MoneyCollectFilled />}
              placeholder="请输入赔偿价格"
            />
          </Form.Item>
          
          <Form.Item
            name="storage"
            label="storage"
            rules={[{ required: true, message: 'Please input the storage!' }]}
          >
            <Input size='large'
              prefix={<TagFilled />}
              placeholder="请输入库存量"
            />
          </Form.Item>

          
          <Form.Item
            name="cover"
            label="cover"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
            >
              {fileList.length < 1 && '+ 上传封面 '}
            </Upload>
          </Form.Item>

          <Form.Item
            name="desc"
            label="description"
          >
            <TextArea showCount maxLength={100} placeholder="请输入描述信息" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 18 }}>
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
        title="update"
        open={updateopen}
        onCancel={handleUpdateCancel}
        onOk={handleUpdateOk}
        footer={null}
      >
        <Form
          name="update"
          labelCol={{ span: 5, }}
          wrapperCol={{ span: 17 }}
          form={updateform}
          initialValues={{ remember: true, }}
          onFinish={handleUpdateOk}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="typeid"
            label="typeid"
            rules={[{ required: true, message: 'Please choose the type!' }]}
          >
            <Select size='large' placeholder='请选择书的种类' allowClear options={types.map((typename, i) => ({ label: typename, value: i+1 }))} />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="price"
          >
            <Input size='large'
              prefix={<MoneyCollectFilled />}
              placeholder="请输入赔偿价格"
            />
          </Form.Item>
          
          <Form.Item
            name="storage"
            label="storage"
            rules={[{ required: true, message: 'Please input the storage!' }]}
          >
            <Input size='large'
              prefix={<TagFilled />}
              placeholder="请输入库存量"
            />
          </Form.Item>

          <Form.Item
            name="desc"
            label="description"
          >
            <TextArea showCount maxLength={100} placeholder="请输入描述信息" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 18 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ marginRight:'40px' }}>
              确定
            </Button>
            <Button type="primary" onClick={handleUpdateCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="add type"
        open={typeopen}
        onCancel={handleCancelType}
        onOk={handleOkType}
        footer={null}
      >
        <Form
          name="add type"
          labelCol={{ span: 5, }}
          wrapperCol={{ span: 17 }}
          form={typeform}
          initialValues={{ remember: true, }}
          onFinish={handleOkType}
          onFinishFailed={onFinishFailedType}
          autoComplete="off"
        >
          <Form.Item
            name="typename"
            label="type"
            rules={[{ required: true, message: 'Please input a book type!' }]}
          >
            <Input size='large' prefix={<BookFilled className="site-form-item-icon" />} placeholder="请输入新的类别" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 18 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ marginRight:'40px' }}>
              确定
            </Button>
            <Button type="primary" onClick={handleCancelType}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;