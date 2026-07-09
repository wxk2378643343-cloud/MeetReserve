import { CalendarOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/authSlice';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    await dispatch(login(values)).unwrap();
    navigate('/schedule');
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <CalendarOutlined />
          </div>
          <Typography.Title level={1} className="login-brand-title">
            MeetReserve
          </Typography.Title>
          <Typography.Paragraph className="login-brand-subtitle">
            会议室预约系统
          </Typography.Paragraph>
          <ul className="login-features">
            <li><ClockCircleOutlined /> 按日查看会议室占用，30 分钟粒度</li>
            <li><TeamOutlined /> 智能推荐空闲会议室，一键预约</li>
            <li><CalendarOutlined /> 支持修改、取消，无需审批</li>
          </ul>
        </div>
        <div className="login-brand-decoration" aria-hidden />
      </div>

      <div className="login-form-panel">
        <div className="login-form-card">
          <Typography.Title level={3} className="login-form-title">
            欢迎回来
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="login-form-desc">
            登录后即可查看日程并预约会议室
          </Typography.Paragraph>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ username: 'admin', password: 'admin123' }}
            size="large"
          >
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} className="login-submit-btn">
              登录
            </Button>
          </Form>
          <Typography.Paragraph type="secondary" className="login-hint">
            演示账号：admin / admin123 · user / user123
          </Typography.Paragraph>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
