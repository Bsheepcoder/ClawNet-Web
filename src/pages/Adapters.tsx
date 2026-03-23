import React from 'react';
import { Card, Row, Col, List, Tag, Button, Space, Alert } from 'antd';
import { 
  WechatOutlined, 
  MessageOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

interface Adapter {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  type: 'wechat' | 'telegram' | 'custom';
  description: string;
}

const Adapters: React.FC = () => {
  const adapters: Adapter[] = [
    {
      id: 'wechat-mp',
      name: '微信公众号',
      icon: <WechatOutlined style={{ fontSize: 24 }} />,
      status: 'connected',
      type: 'wechat',
      description: '微信公众号消息适配器',
    },
    {
      id: 'telegram-bot',
      name: 'Telegram Bot',
      icon: <MessageOutlined style={{ fontSize: 24 }} />,
      status: 'disconnected',
      type: 'telegram',
      description: 'Telegram 机器人适配器',
    },
    {
      id: 'custom-adapter',
      name: '自定义适配器',
      icon: <ApiOutlined style={{ fontSize: 24 }} />,
      status: 'disconnected',
      type: 'custom',
      description: '自定义平台适配器',
    },
  ];

  const getStatusTag = (status: Adapter['status']) => {
    const statusMap = {
      connected: { color: 'success', icon: <CheckCircleOutlined />, text: '已连接' },
      disconnected: { color: 'default', icon: <CloseCircleOutlined />, text: '未连接' },
      error: { color: 'error', icon: <CloseCircleOutlined />, text: '错误' },
    };
    const config = statusMap[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <div>
      <Alert
        message="平台适配器"
        description="管理和配置各平台的消息适配器，实现多平台消息统一接入"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        {adapters.map((adapter) => (
          <Col xs={24} md={12} lg={8} key={adapter.id}>
            <Card
              hoverable
              title={
                <Space>
                  {adapter.icon}
                  <span>{adapter.name}</span>
                </Space>
              }
              extra={getStatusTag(adapter.status)}
            >
              <p>{adapter.description}</p>
              <Space style={{ marginTop: 16 }}>
                <Button type="primary" size="small">
                  配置
                </Button>
                <Button size="small">测试连接</Button>
                {adapter.status === 'connected' ? (
                  <Button danger size="small">
                    断开
                  </Button>
                ) : (
                  <Button size="small">连接</Button>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="📋 适配器说明" style={{ marginTop: 16 }}>
        <List
          dataSource={[
            {
              title: '微信公众号',
              description: '接入微信公众号平台，支持消息接收、发送和事件处理',
            },
            {
              title: 'Telegram Bot',
              description: '接入 Telegram Bot API，支持命令、消息和回调查询',
            },
            {
              title: '自定义适配器',
              description: '实现自定义平台适配器，扩展支持更多平台',
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Adapters;
