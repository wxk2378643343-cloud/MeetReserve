import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#E60012',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#64748B',
    colorText: '#1A1A1A',
    colorTextSecondary: '#8c8c8c',
    colorBorder: '#eef0f4',
    colorBgLayout: '#f0f2f5',
    colorBgContainer: '#FFFFFF',
    borderRadius: 10,
    borderRadiusLG: 14,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`,
    fontSize: 14,
    controlHeight: 36,
    controlHeightLG: 44,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(15, 23, 42, 0.08)',
  },
  components: {
    Button: {
      primaryShadow: '0 2px 8px rgba(230, 0, 18, 0.2)',
      fontWeight: 500,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 14,
      paddingLG: 20,
    },
    Table: {
      headerBg: '#f8f9fb',
      headerColor: '#8c8c8c',
      rowHoverBg: '#fff7f6',
      borderColor: '#eef0f4',
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedBg: '#fff1f0',
      itemSelectedColor: '#E60012',
      itemHeight: 44,
    },
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#f0f2f5',
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Drawer: {
      paddingLG: 24,
    },
  },
};
