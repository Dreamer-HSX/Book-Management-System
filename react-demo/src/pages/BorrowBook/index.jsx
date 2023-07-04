import React, { useEffect, useState } from "react";
import axios from "axios"; // 用于发送 api 请求
import { format, add, parse, isPast } from 'date-fns';
import PubSub from "pubsub-js";
import { useNavigate } from 'react-router-dom';
import { Button, Table, Image, Space, Tag, Skeleton, message, Modal, Select, Form } from 'antd';
import Search from "../../components/Search";

const Option = Select.Option;

const color = ["magenta", "lime", "red", "green", "volcano", "cyan", "orange","blue", "gold", "geekblue","purple", "gray"];

export default function BorrowBook() {
  const navigate = useNavigate();
  const [book, setBook] = useState({});
  const [valid, setValid] = useState(true); // 用户是否有逾期没还的书
  const [books, setBooks] = useState([]); // 所有可以借阅的书籍
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm(); // 借书时间选择模态框
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false); // 确定按钮是否处于加载状态

  const columns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: "封面",
      dataIndex: "cover",
      key: "cover",
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
    },
    {
      title: '类别',
      dataIndex: 'typeid',
      key: 'typeid',
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
    },
    {
      title: '库存量',
      dataIndex: 'storage',
      key: 'storage',
    },
    {
      title: '操作',
      dataIndex: "",
      key: 'operation',
      render: (_, row) => (
        <Space>
          <Button block onClick={e => handleBorrow(row)}>借阅</Button>
        </Space>
      ),
    },
  ];

  /* 获取余量大于 0 的书籍信息和用户已借书信息 */
  useEffect(() => {
    setTimeout(() => { // 在发送请求前先缓冲一段时间
      setLoading(false);
    }, 1000);

    showTable();

    axios.get(`http://localhost:8800/my/borrow/${localStorage.username}`, {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const {data, status, message: msg} = res.data;
      if(!status) {
        for(let i=0; i<data.length; i++) {
          if(isPast(parse(data[i].duedate.slice(0, 10), 'yyyy-MM-dd', new Date()))) { // 是否有未还书籍
            setValid(false);
            break;
          }
        }
        setCount(data.length);
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
      console.log(err);
    })
  }, []);

  /* 搜索组件数据获取 */
  useEffect(() => {
    const token = PubSub.subscribe("search results", (msg, data) => {
      setLoading(true);
      setTimeout(() => { // 在发送请求前先缓冲一段时间
        setLoading(false);
      }, 1000);

      setBooks(data); // 更新要展示书的状态
      setTotal(data.length); // 同时更新书的总数量
    })
    return () => {
      PubSub.unsubscribe(token); // 取消订阅
    }
  }, [])

  const handleBorrow = (row) => {
    setBook(row);
    setOpen(true);
  }

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  }

  const handleOk = (data) => {
    const { duration } = data;
    if(count >= 5) { // 设置借书上限值
      return message.warning('您已达到借书上限！')
    }
    if(!valid) {
      return message.warning('您有逾期未归还的书, 请先归还!')
    }
    const borrowdate = format(new Date(), 'yyyy-MM-dd'); // 开始借书时间
    const duedate = format(add(new Date(), {days: duration}), 'yyyy-MM-dd'); // 还书时间
    setConfirmLoading(true);
    axios.put(`http://localhost:8800/my/borrow/${book.id}`,
      {
        username: localStorage.username,
        title: book.title,
        borrowdate,
        duedate,
      },
      {
        headers:{
          Authorization: sessionStorage.token,
        }
    })
    .then(res => {
      const {status, message: msg} = res.data;
      if(!status) {
        setTimeout(() => {
          message.success(msg);
          setOpen(false); // 关闭模态框
          setConfirmLoading(false); // 取消确定等待
          setCount(count + 1);
        }, 1000);
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
    .catch(err => {
      setConfirmLoading(false);
      message.error(err.message);
      console.log(err);
    })
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('请完善必要信息！');
  };

  const showTable = () => {
    axios.get(`http://localhost:8800/my/books`, {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const {data, status, message: msg} = res.data;
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
      console.log(err);
    })
    axios.get("http://localhost:8800/my/booktypes", {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const {data, status, message: msg} = res.data;
      if(!status) {
        let tmp = data;
        for(let i=0;i<tmp.length;i++){
          tmp[i] = tmp[i].typename;
        }
        setTypes(tmp);
      }
      else {
        if(status !== 500) {
          message.error(msg);
        }
      }
    })
    .catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }

  return (
    <div>
      <Search />
      <div style={{display: 'inline-block', float: 'right', fontSize: 18}}><b>{`您当前已借阅 ${count} 本图书`}</b></div>
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
        title="借书信息登记"
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
            name="duration"
            label="借书时间"
            rules={[{ required: true, message: 'Please choose the time!' }]}
          >
            <Select size='large' placeholder='请选择借书的时间' allowClear >
              <Option value="7">一周</Option>
              <Option value="30">一个月</Option>
              <Option value="90">三个月</Option>
            </Select>
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
    </div>
  )
}
