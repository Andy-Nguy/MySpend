import React from 'react';
import { ConfigProvider, Card, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f7fa',
          padding: 24,
        }}
      >
        <Card style={{ maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={2} style={{ margin: 0 }}>
              🏗️ MySpend Base Monorepo
            </Title>
            <Paragraph type="secondary">
              Nx Monorepo base structure initialized (NestJS 11 + React 19 + Ant Design v5 + TypeORM).
            </Paragraph>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default App;
