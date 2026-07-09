import { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserInfo } from '@/store/authSlice';
import { getToken } from '@/utils/auth';
import { useResponsive } from '@/hooks/useResponsive';

function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { isMobile } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (getToken() && !user) {
      dispatch(fetchUserInfo()).catch(() => navigate('/login'));
    }
  }, [dispatch, user, navigate]);

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AntLayout className={`app-layout ${isMobile ? 'app-layout-mobile' : ''}`}>
      <Sidebar />
      <AntLayout>
        <Header
          showMenu={isMobile}
          drawerOpen={drawerOpen}
          onDrawerOpen={() => setDrawerOpen(true)}
          onDrawerClose={() => setDrawerOpen(false)}
        />
        <AntLayout.Content className="app-content">
          <div className="page-container">
            <Outlet />
          </div>
        </AntLayout.Content>
      </AntLayout>
      {isMobile && <MobileNav />}
    </AntLayout>
  );
}

export default Layout;
