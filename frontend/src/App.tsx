import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { theme } from '@/theme';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/login';
import SchedulePage from '@/pages/schedule';
import MyBookingsPage from '@/pages/booking/MyBookings';
import RoomManage from '@/pages/admin/RoomManage';
import UserManage from '@/pages/admin/UserManage';
import { useAppSelector } from '@/store/hooks';
import { isAdmin } from '@/utils/auth';

function AdminRoute({ element }: { element: React.ReactElement }) {
  const { user } = useAppSelector((s) => s.auth);
  return isAdmin(user?.role) ? element : <Navigate to="/schedule" replace />;
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/schedule" replace />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="admin/rooms" element={<AdminRoute element={<RoomManage />} />} />
            <Route path="admin/users" element={<AdminRoute element={<UserManage />} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
