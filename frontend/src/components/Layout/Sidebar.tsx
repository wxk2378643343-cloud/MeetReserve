import { Layout } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';
import SidebarMenu from './SidebarMenu';

const { Sider } = Layout;

function Sidebar() {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return null;
  }

  return (
    <Sider
      width={isTablet ? 80 : 252}
      className="app-sidebar"
      theme="light"
      collapsed={isTablet}
      collapsedWidth={80}
      trigger={null}
    >
      <div className="sidebar-inner">
        <SidebarMenu collapsed={isTablet} />
      </div>
    </Sider>
  );
}

export default Sidebar;
