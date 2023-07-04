import React, { useEffect, useState } from "react";
import axios from "axios"; // 用于发送 api 请求
import { compareAsc } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, Skeleton, message, Popconfirm } from 'antd';

export default function Pborrow() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: '借书人',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <a>{text}</a>
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '借书时间',
      dataIndex: 'borrowdate',
      key: 'borrowdate',
    },
    {
      title: '还书时间',
      dataIndex: 'duedate',
      key: 'duedate',
    },
    {
      title: '是否逾期',
      key: 'status',
      dataIndex: 'status',
      render: (_, row) => {
        const time = row.duedate.split('-');
        return (compareAsc(new Date(time[0], time[1] - 1, time[2]), new Date()) < 0 ?
                <Tag color={'volcano'}>逾期</Tag> :
                <Tag color={'green'}>正常</Tag>
              )
      },
    },
    {
      title: '操作',
      dataIndex: "",
      key: 'operation',
      render: (_, row) => (
        <Space>
          <Popconfirm title="确定要还此书吗？" onConfirm={() => handleReturn(row)}>
            <Button type="primary" block>还书</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setTimeout(() => { // 在展示信息前先缓冲一段时间
      setLoading(false);
    }, 1000);
    showTable();
  }, []);

  const handleReturn = (row) => {
    axios.get(`http://localhost:8800/my/return/${row.id}/${row.title}`,
      {
        headers:{
          Authorization: sessionStorage.token,
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
    .catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }

  const showTable = () => {
    axios.get(`http://localhost:8800/my/borrow/${localStorage.username}`, {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const {data, status, message: msg} = res.data;
      if(!status) {
        for(let i = 0; i < data.length; i++) { // 处理后端返回的字符串
          data[i].borrowdate = data[i].borrowdate.slice(0, 10);
          data[i].duedate = data[i].duedate.slice(0, 10);
        }
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
  }

  return (
    loading ? (
      <>
        <Skeleton active />
        <Skeleton active />
      </>
    ) : (
      <div className="borrows">
        <Table
          columns={columns}
          dataSource={books}
          rowKey={"id"}
          // 右下角数据总数和翻页器展示
          pagination={{
            total: total,
            showTotal: () => `共借了 ${total} 本书`,
          }}
        />
      </div>
    )
  )
}
