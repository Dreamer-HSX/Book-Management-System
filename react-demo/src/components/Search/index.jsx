import React from 'react';
import { Form, Button, Input, Select, Row, Col } from 'antd';
import PubSub from 'pubsub-js';
import axios from 'axios';

const Option = Select.Option;

export default function Search() {
  const [form] = Form.useForm(); // 对表单 useState 的封装

  const onReset = () => {
    form.resetFields();
  };

  const handleValuesChange = (changedObj) => {
    const {keyword: value} = changedObj; // 对象的解构赋值
    if(value) { // 若修改了第一个选项，则修改第二个输入框的默认值
      form.setFieldsValue({
        word: '',
      });
      let objectInput = document.getElementById("input");
      let tempkey = (value === "title" ? "书名" : value === "author" ? "作者" : "类别");
      objectInput.setAttribute("placeholder", `以 ${tempkey} 进行搜索`);
    }
  }

  const handleFinish = (values) => {
    axios.post("http://localhost:8800/my/search", values, {
      headers: {
        Authorization: sessionStorage.token
      }
    }) // 向后端发送查询请求
    .then(
      response => {
        PubSub.publish("search results", response.data.data); // 发布请求回来的消息
      },
      err => { console.log(err.message); }
    )
  }

  return (
    <Form
      form={form}
      name="search-engine"
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      style={{ width: 1200, display: 'inline-block'}}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="keyword" initialValue="title">
            <Select allowClear>
              <Option key="title" value="title">书名</Option>
              <Option key="author" value="author">作者</Option>
              <Option key="typename" value="typename">类别</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={8}>
          <Form.Item name="word">
            <Input id="input" placeholder={`以 书名 进行搜索`} />
          </Form.Item>
        </Col>

        <Col span={5} style={{ textAlign: "left" }}>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button style={{ margin: "0 8px" }} onClick={onReset}>
            清空
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
