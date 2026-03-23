import React from 'react';
import { Row, Col, Card, Statistic, Button, Space, List, Tag } from 'antd';
import {
  CloudServerOutlined,
  NodeIndexOutlined,
  ShareAltOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
  SendOutlined,
  BarChartOutlined,
  SettingOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  const recentActivities = [
    { time: '10:23', action: '实例 bot-1 启动成功', status: 'success' },
    { time: '10:20', action: '用户 user1 发送消息给 bot-1', status: 'info' },
    { time: '10:15', action: '新节点 user2 已添加', status: 'success' },
    { time: '10:10', action: '关系 bot-1 → user2 已建立', status: 'success' },
    { time: '10:05', action: '实例 bot-3 已停止', status: 'warning' },
  ];

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      success: { color: 'success', icon: <CheckCircleOutlined /> },
      info: { color: 'processing', icon: <MessageOutlined /> },
      warning: { color: 'warning', icon: <CloseCircleOutlined /> },
    };
    const config = statusMap[status] || statusMap.info;
    return <Tag color={config.color} icon={config.icon}>{status}</Tag>;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>欢迎回来！快速开始使用 ClawNet</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="📦 实例"
              value={3}
              suffix={
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                  / 2 运行中
                </span>
              }
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="🔗 节点"
              value={12}
              suffix={
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                  / 8 在线
                </span>
              }
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="🔗 关系"
              value={25}
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
          <Card>
            <Statistic
              title="📨 消息"
              value={1.2}
              suffix="K"
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="🚀 快速操作" style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Button type="primary" icon={<PlusCircleOutlined />}>
            创建实例
          </Button>
          <Button icon={<PlusCircleOutlined />}>添加节点</Button>
          <Button icon={<SendOutlined />}>发送消息</Button>
          <Button icon={<BarChartOutlined />}>查看监控</Button>
          <Button icon={<SettingOutlined />}>配置</Button>
          <Button icon={<BookOutlined />}>查看文档</Button>
        </Space>
      </Card>

      {/* 系统状态和最近活动 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📊 系统状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>bot-1</span>
                <Tag color="success">运行中</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>bot-2</span>
                <Tag color="success">运行中</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>bot-3</span>
                <Tag color="default">已停止</Tag>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📋 最近活动">
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <span style={{ color: '#8c8c8c', minWidth: 50 }}>{item.time}</span>
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
