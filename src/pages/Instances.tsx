import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Badge, message, Modal, Form, Input, Switch, Alert } from 'antd';
import { ReloadOutlined, PlusOutlined, WechatOutlined, ApiOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Instance {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  wechat?: {
    loggedIn: boolean;
    accountId?: string;
  };
  clawnet?: {
    connected: boolean;
    nodeId?: string;
  };
  createdAt: string;
}

const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const response = await api.get('/instances');
      setInstances(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch instances:', error);
      message.error('加载实例失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除实例 "${id}" 吗？此操作不可恢复。`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/instances/${id}`);
          message.success('实例已删除');
          fetchInstances();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '实例名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Instance) => (
        <a onClick={() => navigate(`/instances/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'running' ? 'success' : 'default'}>
          {status === 'running' ? '✅ 运行中' : '⏸️ 已停止'}
        </Tag>
      ),
    },
    {
      title: '微信状态',
      key: 'wechat',
      render: (_: any, record: Instance) => (
        <Space>
          <WechatOutlined />
          <Tag color={record.wechat?.loggedIn ? 'success' : 'default'}>
            {record.wechat?.loggedIn ? '✅ 已登录' : '❌ 未登录'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'ClawNet',
      key: 'clawnet',
      render: (_: any, record: Instance) => (
        <Space>
          <ApiOutlined />
          <Tag color={record.clawnet?.connected ? 'success' : 'default'}>
            {record.clawnet?.connected ? '✅ 已连接' : '❌ 未连接'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Instance) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/instances/${record.id}`)}>
            详情
          </Button>
          <Button danger type="link" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>📦 实例管理</span>
            <Badge count={instances.filter(i => i.status === 'running').length} 
                   style={{ backgroundColor: '#52c41a' }}
                   title="运行中的实例" />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchInstances}>
              刷新
            </Button>
          </Space>
        }
      >
        <Alert
          message="所有实例共享 Gateway 端口 18789"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table 
          columns={columns} 
          dataSource={instances} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default Instances;
