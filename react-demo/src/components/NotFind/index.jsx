import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFind = () => {
  const navigate = useNavigate();

  return (
    <div className='box'>
      <Result
        status="404"
        title="404"
        subTitle="您要访问的资源不存在"
        extra={<Button type="primary" onClick={() => {navigate('/login')}}>Back To Login</Button>}
      />
    </div>
  )
}

export default NotFind;