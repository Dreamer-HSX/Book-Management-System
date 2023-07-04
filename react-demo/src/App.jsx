import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { HomeOutlined, PieChartOutlined, UserOutlined, DesktopOutlined, TeamOutlined, CaretDownFilled, ProfileOutlined, FileSearchOutlined, createFromIconfontCN, LogoutOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Avatar, Space, message, Dropdown, Watermark } from 'antd';
import { format } from 'date-fns';

const { Header, Content, Footer, Sider } = Layout;

/* 注册跳转路由 */
const items0 = [
  {
    key: '/home/welcome',
    icon: <PieChartOutlined />,
    label: <NavLink to='/home/welcome'>主页</NavLink>,
  },
  {
    key: '/home/books',
    icon: <DesktopOutlined />,
    label: <NavLink to='/home/books'>图书管理</NavLink>,
  },
  {
    key: '/home/users',
    icon: <UserOutlined />,
    label: <NavLink to='/home/users'>用户管理</NavLink>,
  },
  {
    key: '/home/borrow',
    icon: <ProfileOutlined />,
    label: <NavLink to='/home/borrow'>借阅管理</NavLink>,
  },
  {
    key: '/home/basicinfo',
    icon: <TeamOutlined />,
    label: <NavLink to='/home/basicinfo'>基本信息</NavLink>,
  },
]

const items1 = [
  {
    key: '/home/welcome',
    icon: <PieChartOutlined />,
    label: <NavLink to='/home/welcome'>主页</NavLink>,
  },
  {
    key: '/home/borrowbook',
    icon: <FileSearchOutlined />,
    label: <NavLink to='/home/borrowbook'>图书借阅</NavLink>,
  },
  {
    icon: <TeamOutlined />,
    label: '个人中心',
    children: [
      {
        key: '/home/basicinfo',
        label: <NavLink to='/home/basicinfo'>基本信息</NavLink>,
      },
      {
        key: '/home/personalborrow',
        label: <NavLink to='/home/personalborrow'>个人借阅</NavLink>,
      },
    ]
  },
]

/* 下拉菜单中的内容 */
const objs = [
  {
    label: '个人中心',
    key: '1',
    icon: <TeamOutlined />,
  },
  {
    label: '退出登录',
    key: '2',
    icon: <LogoutOutlined />,
  },
];

const IconFont = createFromIconfontCN({ // 使用 iconfont 中的 icon，下面为仓库js代码
  scriptUrl: '//at.alicdn.com/t/c/font_3243135_ro6296i873q.js',
});

const App = () => {
  let date = format(new Date(), 'yyyy-M-d-H').split('-');
  let hi = date[3] < 12 ? '上午' : date[3] < 18 ? '下午' : '晚上'; // 获取当前时间
  const [collapsed, setCollapsed] = useState(false);
  const {token: { colorBgContainer },} = theme.useToken();
  const [user, setUser] = useState({});

  const navigate = useNavigate();
  const { pathname } = useLocation(); // 使用 useLocation() 获取当前访问界面的 url
  const [current, setCurrent] = useState(pathname); // 将侧边导航栏的选中选项与当前 url 同步

  useEffect(() => {
    axios.get(`http://localhost:8800/api/users/${localStorage.username}`)
    .then(res => {
      const { data, status, message: msg } = res.data;
      if(!status) {
        console.log(data[0]);
        setUser(data[0]); // 注意后端查询结果返回的是数组
      }
      else {
        message.error(msg);
      }
    })
    .catch(err => {
      message.error(err.message);
    })
  }, [])

  const onClick = (e) => {
    setCurrent(e.key);
  }

  const handleDropDown = ({ key }) => { // 下拉菜单处理时间
    if(key === '2') { // 退出登录
      sessionStorage.removeItem('token');
      message.success('退出成功！');
      navigate('/login');
    }
    else { // 选择个人中心则跳转的个人中心
      setCurrent('/home/basicinfo');
      navigate('/home/basicinfo');
    }
  };

  return (
    <Layout>
      {/* 头部信息条 */}
      <Header>
        <div style={{ float: 'left' }}>
          <Avatar src={<img src='../img/logo.jpg' alt="logo" />} size={75} style={{ marginBottom:15, marginRight: 10}}/>
          <span style={{color:'white', fontSize: 25, fontFamily: 'sans-serif'}}>图书管理系统</span>
        </div>
        <div style={{ float: 'right', marginRight: 25 }}>
          <Space>
            {
              user.avatar ? 
              <Avatar size="large" src={<img src={user.avatar} alt="avatar" />} /> :
              <Avatar size="large" icon={<UserOutlined />} />
            }
            <Dropdown menu={{ items: objs, onClick: handleDropDown, }}>
                <Space style={{color: 'white'}}>
                  {`${user.username}`}
                  <CaretDownFilled />
                </Space>
            </Dropdown>
          </Space>
        </div>
      </Header>
    <Layout style={{minHeight: '100vh',}}>
      {/* 侧边栏信息 */}
      <Sider theme='light' width={250} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Menu selectedKeys={[current]} mode="inline" items={user.identity ? items1: items0} onClick={onClick}/>
      </Sider>
        {/* Content 为内容展示区域 */}
        <Layout>
        <Content style={{ margin: '0 16px', padding: '0 16px'}}>
          <>
            <Breadcrumb
              style={{margin: '16px 0', display: 'inline-block'}}
              items={[
                {
                  href: 'localhost:3000/home/welcome',
                  title: (
                    <>
                      <HomeOutlined />
                      <span>Home</span>
                    </>
                  ),
                },
                {
                  title: 'Application',
                },
              ]}
            />
            <div style={{display: 'inline-block', margin: '16px 0', float: 'right'}}>
              <Space>
                <IconFont type={date[3] < 12 ? 'icon-sun' : date[3] < 18 ? 'icon-noon' : 'icon-moon' } style={{ fontSize: 18 }}/>
                {`${hi}好, 今天是 ${date[0]} 年 ${date[1]} 月 ${date[2]} 日`}
              </Space>
            </div>
          </>
          {/* 主要信息展示区域 */}
          <Watermark content={`${user.username}`} font={{ color:'rgba(0,0,0,.10)' }}>
            <div
              style={{
                padding: 24,
                minHeight: '100vh',
                background: colorBgContainer,
              }}
            >
              {/* 展示二级路由 */}
              <Outlet />
            </div>
          </Watermark>
        </Content>

        <Footer style={{ textAlign: 'center',}}>
          数据库系统Lab5 ©2023 Created by Dreamer-HSX
        </Footer>
        </Layout>

      </Layout>
    </Layout>
  );
};
export default App;