import React from 'react';
import { Card, Button, Space, Segmented, Empty } from 'antd';
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

const Relations: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'graph' | 'list'>('graph');

  return (
    <div>
      <Card
        title="关系管理"
        extra={
          <Space>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as 'graph' | 'list')}
              options={[
                {
                  value: 'graph',
                  icon: <AppstoreOutlined />,
                  label: '图谱视图',
                },
                {
                  value: 'list',
                  icon: <UnorderedListOutlined />,
                  label: '列表视图',
                },
              ]}
            />
            <Button type="primary" icon={<PlusOutlined />}>建立关系</Button>
          </Space>
        }
      >
        {viewMode === 'graph' ? (
          <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty
              description="关系图谱（即将推出）"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <p style={{ color: '#8c8c8c' }}>使用 AntV G6 可视化关系图谱</p>
            </Empty>
          </div>
        ) : (
          <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty
              description="关系列表（即将推出）"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Relations;
