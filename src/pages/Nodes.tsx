import React from 'react';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const Nodes: React.FC = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; icon: string }> = {
          bot: { color: 'purple', icon: '🤖' },
          user: { color: 'blue', icon: '👤' },
          agent: { color: 'green', icon: '🤖' },
          service: { color: 'orange', icon: '⚙️' },
        };
        const config = typeMap[type] || { color: 'default', icon: '📦' };
        return (
          <Tag color={config.color}>
            {config.icon} {type}
          </Tag>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'success' : 'default'}>
          {status === 'online' ? '🟢 在线' : '🟡 离线'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">详情</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', id: 'bot-1', type: 'bot', name: 'Bot 1', status: 'online', createdAt: '2026-03-20' },
    { key: '2', id: 'bot-2', type: 'bot', name: 'Bot 2', status: 'online', createdAt: '2026-03-21' },
    { key: '3', id: 'user-1', type: 'user', name: 'Alice', status: 'offline', createdAt: '2026-03-22' },
    { key: '4', id: 'user-2', type: 'user', name: 'Bob', status: 'online', createdAt: '2026-03-23' },
    { key: '5', id: 'agent-1', type: 'agent', name: 'Agent 1', status: 'online', createdAt: '2026-03-23' },
  ];

  return (
    <Card
      title="节点管理"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />}>添加节点</Button>
        </Space>
      }
    >
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default Nodes;
