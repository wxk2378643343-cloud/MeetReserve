import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarOutlined,
  UnorderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import { isAdmin } from '@/utils/auth';

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);

  const tabs = [
    { key: '/schedule', icon: <CalendarOutlined />, label: '日程' },
    { key: '/my-bookings', icon: <UnorderedListOutlined />, label: '预约' },
  ];

  if (isAdmin(user?.role)) {
    tabs.push({ key: '/admin/rooms', icon: <SettingOutlined />, label: '管理' });
  }

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`mobile-nav-item ${
            location.pathname === tab.key ||
            (tab.key === '/admin/rooms' && location.pathname.startsWith('/admin'))
              ? 'active'
              : ''
          }`}
          onClick={() => navigate(tab.key)}
        >
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileNav;
