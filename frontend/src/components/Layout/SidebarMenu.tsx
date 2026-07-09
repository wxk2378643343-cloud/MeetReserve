import { Menu, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  CalendarOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  BankOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { isAdmin } from '@/utils/auth';

interface Props {
  onNavigate?: () => void;
  showBrand?: boolean;
  collapsed?: boolean;
}

function SidebarMenu({ onNavigate, showBrand = true, collapsed = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);

  const go = (key: string) => {
    if (key.startsWith('/')) {
      navigate(key);
      onNavigate?.();
    }
  };

  const items: MenuProps['items'] = [
    { key: '/schedule', icon: <CalendarOutlined />, label: '日程视图' },
    { key: '/my-bookings', icon: <UnorderedListOutlined />, label: '我的预约' },
  ];

  if (isAdmin(user?.role)) {
    items.push({ type: 'divider' });
    items.push({
      key: 'admin-group',
      label: collapsed ? undefined : '系统管理',
      type: 'group',
      children: [
        { key: '/admin/rooms', icon: <BankOutlined />, label: '会议室管理' },
        { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理' },
      ],
    });
  }

  return (
    <>
      {showBrand && (
        <div className="sidebar-brand" onClick={() => go('/schedule')}>
          <div className="sidebar-logo">
            <AppstoreOutlined />
          </div>
          {!collapsed && (
            <div>
              <div className="sidebar-title">MeetReserve</div>
              <div className="sidebar-subtitle">会议室预约</div>
            </div>
          )}
        </div>
      )}
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => go(key)}
        className="sidebar-menu"
      />
      {user && !collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar size={36} style={{ background: '#E60012', flexShrink: 0 }}>
              {user.realName?.[0] || user.username[0]}
            </Avatar>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.realName}</div>
              <div className="sidebar-user-role">{user.role === 'ADMIN' ? '管理员' : '普通用户'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarMenu;
