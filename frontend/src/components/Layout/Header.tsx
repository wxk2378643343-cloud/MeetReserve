import { Layout, Dropdown, Button, Breadcrumb, Drawer } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, MenuOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth } from '@/store/authSlice';
import SidebarMenu from './SidebarMenu';

const { Header: AntHeader } = Layout;

const PAGE_NAMES: Record<string, string> = {
  '/schedule': '日程视图',
  '/my-bookings': '我的预约',
  '/admin/rooms': '会议室管理',
  '/admin/users': '用户管理',
};

interface Props {
  showMenu?: boolean;
  drawerOpen?: boolean;
  onDrawerOpen?: () => void;
  onDrawerClose?: () => void;
}

function Header({ showMenu, drawerOpen, onDrawerOpen, onDrawerClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const logout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  const pageName = PAGE_NAMES[location.pathname] || '工作台';

  return (
    <>
      <AntHeader className="app-header">
        <div className="app-header-left">
          {showMenu && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="header-menu-btn"
              onClick={onDrawerOpen}
            />
          )}
          <Breadcrumb
            className="app-breadcrumb"
            items={[
              { title: <><HomeOutlined /> <span className="breadcrumb-text">首页</span></> },
              { title: pageName },
            ]}
          />
        </div>
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: logout,
              },
            ],
          }}
        >
          <Button type="text" className="header-user-btn" icon={<UserOutlined />}>
            <span className="header-user-name">{user?.realName || user?.username}</span>
          </Button>
        </Dropdown>
      </AntHeader>

      <Drawer
        title="菜单"
        placement="left"
        open={drawerOpen}
        onClose={onDrawerClose}
        width={280}
        className="mobile-drawer"
      >
        <div className="sidebar-inner drawer-inner">
          <SidebarMenu onNavigate={onDrawerClose} />
        </div>
      </Drawer>
    </>
  );
}

export default Header;
