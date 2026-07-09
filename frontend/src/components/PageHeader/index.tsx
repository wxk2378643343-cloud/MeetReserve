import React from 'react';
import { Typography } from 'antd';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra }) => (
  <div className="page-header">
    <div>
      <Typography.Title level={3} className="page-header-title">
        {title}
      </Typography.Title>
      {subtitle && (
        <Typography.Paragraph type="secondary" className="page-header-subtitle">
          {subtitle}
        </Typography.Paragraph>
      )}
    </div>
    {extra && <div className="page-header-extra">{extra}</div>}
  </div>
);

export default PageHeader;
