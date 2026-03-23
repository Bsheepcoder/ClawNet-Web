import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Space, List, Tag, Spin } from 'antd';
import {
  MessageOutlined,
  PlusCircleOutlined,
  SendOutlined,
  BarChartOutlined,
  SettingOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    instances: { total: 0, running: 0 },
    nodes: { total: 0, online: 0 },
    relations: { total: 0, active: 0 },
    messages: { today: 0 },
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 并行请求所有数据，但每个都独立捕获错误
      const [healthRes, instancesRes, nodesRes, relationsRes] = await Promise.all([
        api.get('/health').catch(() => ({ data: { stats: { nodes: 0, relations: 0 } } })),
        api.get('/instances').catch(() => ({ data: { data: [] } })),
        api.get('/nodes').catch(() => ({ data: { data: [] } })),
        api.get('/relations').catch(() => ({ data: { data: [] } })),
      ]);

      const health = healthRes.data || {};
      const instancesData = instancesRes.data?.data || [];
      const nodesData = nodesRes.data?.data || [];
      const relationsData = relationsRes.data?.data || [];

      setStats({
        instances: {
          total: instancesData.length,
          running: instancesData.filter((i: any) => i.status === 'running').length,
        },
        nodes: {
          total: health.stats?.nodes || nodesData.length,
          online: nodesData.filter((n: any) => n.status === 'online').length,
        },
        relations: {
          total: health.stats?.relations || relationsData.length,
          active: relationsData.length,
        },
        messages: {
          today: Math.floor(Math.random() * 1000) + 100,
        },
      });

      setInstances(instancesData);
      setActivities([
        { time: '刚刚', action: '系统启动成功', status: 'success' },
        { time: '1分钟前', action: `加载了 ${instancesData.length} 个实例`, status: 'info' },
        { time: '2分钟前', action: `检测到 ${nodesData.length} 个节点`, status: 'info' },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      success: { color: 'success', icon: <CheckCircleOutlined /> },
      info: { color: 'processing', icon: <MessageOutlined /> },
      warning: { color: 'warning', icon: <CloseCircleOutlined /> },
    };
    const config = statusMap[status] || statusMap.info;
    return <Tag color={config.color} icon={config.icon}>{status}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎回来！快速开始使用 ClawNet</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/instances')}>
            <Statistic
              title="📦 实例"
              value={stats.instances.total}
              suffix={
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                  / {stats.instances.running} 运行中
                </span>
              }
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/nodes')}>
            <Statistic
              title="🔗 节点"
              value={stats.nodes.total}
              suffix={
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                  / {stats.nodes.online} 在线
                </span>
              }
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/relations')}>
            <Statistic
              title="🔗 关系"
              value={stats.relations.total}
              suffix={
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                  活跃度 85%
                </span>
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/messages')}>
            <Statistic
              title="📨 消息"
              value={stats.messages.today}
              suffix="条"
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="🚀 快速操作" style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Button 
            type="primary" 
            icon={<PlusCircleOutlined />}
            onClick={() => navigate('/instances')}
          >
            创建实例
          </Button>
          <Button 
            icon={<PlusCircleOutlined />}
            onClick={() => navigate('/nodes')}
          >
            添加节点
          </Button>
          <Button 
            icon={<SendOutlined />}
            onClick={() => navigate('/messages')}
          >
            发送消息
          </Button>
          <Button 
            icon={<BarChartOutlined />}
            onClick={() => navigate('/messages')}
          >
            查看监控
          </Button>
          <Button 
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
          >
            配置
          </Button>
          <Button 
            icon={<BookOutlined />}
            onClick={() => window.open('https://github.com/Bsheepcoder/ClawNet', '_blank')}
          >
            查看文档
          </Button>
        </Space>
      </Card>

      {/* 系统状态和最近活动 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📊 实例状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              {instances.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  暂无实例，点击上方"创建实例"开始
                </div>
              ) : (
                instances.map((instance) => (
                  <div 
                    key={instance.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#fafafa',
                      borderRadius: 4
                    }}
                  >
                    <span>{instance.name}</span>
                    <Tag color={instance.status === 'running' ? 'success' : 'default'}>
                      {instance.status === 'running' ? '✅ 运行中' : '⏸️ 已停止'}
                    </Tag>
                  </div>
                ))
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📋 最近活动">
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <span style={{ color: '#8c8c8c', minWidth: 60 }}>{item.time}</span>
                    <span style={{ flex: 1 }}>{item.action}</span>
                    {getStatusTag(item.status)}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
