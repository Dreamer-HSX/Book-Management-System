import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { compareAsc } from 'date-fns';
import { Table, Tag, Skeleton, message } from 'antd';

export default function BorrowList() {
  const [borrows, setBorrows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  ];

  useEffect(() => {
    // 发送 api 请求为异步函数
    setTimeout(() => { // 在发送请求前先缓冲一段时间
      setLoading(false);
    }, 1000);

    axios.get('http://localhost:8800/my/borrow', {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
      .then(res => {
        const { data, status, message: msg }= res.data;
        if(!status) {
          for(let i = 0; i < data.length; i++) { // 处理后端返回的字符串
            data[i].borrowdate = data[i].borrowdate.slice(0, 10);
            data[i].duedate = data[i].duedate.slice(0, 10);
          }
          setBorrows(data);
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
  }, []);

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
          dataSource={borrows}
          rowKey={"id"}
          // 右下角数据总数和翻页器展示
          pagination={{
            total: total,
            showTotal: () => `共有 ${total} 条记录`,
          }}
        />
      </div>
    )
  )
}
