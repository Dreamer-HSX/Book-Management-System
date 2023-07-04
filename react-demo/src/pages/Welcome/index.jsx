import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns'
import { Carousel, Image, Card, message, FloatButton, Modal, Divider } from 'antd';

const { Meta } = Card;

export default function Welcome() {
  const navigate = useNavigate();
  const [newbooks, setNewBooks] = useState([]);
  const [detail, setDetail] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8800/my/books', {
      headers:{
        Authorization: sessionStorage.token,
      }
    })
    .then(res => {
      const { data, status, message: msg } = res.data;
      if(!status) {
        const curTime = format(new Date(), 'yyyy-M-d').split('-');
        const result = data.filter(book => { // 筛选出最新上架的书
          let time = book.updatetime.slice(0, 10).split('-');
          return differenceInDays(new Date(curTime[0], curTime[1], curTime[2]), new Date(time[0], time[1], time[2])) <= 7;
        })
        setNewBooks(result);
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
  }, [])

  const handleClick = (book) => {
    const time = book.updatetime.slice(0, 10).split('-');
    setDetail({
      title: book.title,
      press: book.press,
      updatetime: `${time[0]} 年 ${time[1].replace(/^0+/, '')} 月 ${time[2].replace(/^0+/, '')} 日`,
      description: book.desc,
    })
    setIsModalOpen(true);
  }
  
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ width: 1200, margin:'0 auto' }}>
      <Carousel autoplay>
        <div>
          <Image src='../img/carousel_7.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
        <div>
          <Image src='../img/carousel_2.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
        <div>
          <Image src='../img/carousel_3.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
        <div>
          <Image src='../img/carousel_4.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
        <div>
          <Image src='../img/carousel_5.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
        <div>
          <Image src='../img/carousel_6.jpg' style={{ width: 1200, height: 400 }}/>
        </div>
      </Carousel>
      <img style={{ width: 1200, height: 100 }} src='../img/down.png' alt=''></img>
      <div style={{ textAlign:'left' }}>
        {
          newbooks.map(book => (
            <Card
              hoverable
              key={book.id}
              style={{
                width: 240,
                marginLeft: 30,
                marginRight: 30,
                marginTop: 10,
                display: 'inline-block',
              }}
              cover={<img alt="cover" src={book.cover} />}
              onClick={()=>{handleClick(book)}}
            >
              <Meta title={book.title} description={book.author} />
            </Card>
          ))
        }
        <Modal centered title={`《${detail.title}》`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="确认" cancelText="取消">
          <Divider orientation="left" >出版社</Divider>
          <p>{detail.press}</p>
          <Divider orientation="left" >上架时间</Divider>
          <p>{detail.updatetime}</p>
          <Divider orientation="left">内容简介</Divider>
          <p>{detail.description}</p>
        </Modal>
        <FloatButton.BackTop tooltip={<div>Back to Top</div>}/>
      </div>
    </div>
  )
}
