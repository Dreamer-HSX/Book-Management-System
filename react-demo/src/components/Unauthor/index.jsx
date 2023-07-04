import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthor = () => {
  const navigate = useNavigate();

  return (
    <div className='box'>
      <Result
        status="500"
        title="500"
        subTitle="登录超时，请重新登录"
        extra={<Button type="primary" onClick={() => {navigate('/login')}}>Back To Login</Button>}
      />
    </div>
  )
}

export default Unauthor;