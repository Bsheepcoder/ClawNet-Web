import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Descriptions, Tag, Button, Space, Statistic, Row, Col, Alert } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  WechatOutlined,
  ApiOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons';
import api from '../services/api';

interface InstanceData {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'stopped';
  wechat?: {
    loggedIn: boolean;
    accountId?: string;
    userId?: string;
  };
  gateway?: {
    running: boolean;
    pid?: number;
    port: number;
  };
  clawnet?: {
    connected: boolean;
    nodeId?: string;
  };
  createdAt: string;
}

const InstanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstance();
  }, [id]);

  const fetchInstance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/instances/${id}`);
      setInstance(response.data.data);
    } catch (error) {
      console.error('Failed to fetch instance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.post(`/instances/${id}/start`);
      fetchInstance();
    } catch (error) {
      console.error('Failed to start instance:', error);
    }
  };

  const handleStop = async () => {
    try {
      await api.post(`/instances/${id}/stop`);
      fetchInstance();
    } catch (error) {
      console.error('Failed to stop instance:', error);
    }
  };

  const handleConnect = async () => {
    try {
      await api.post(`/instances/${id}/connect`);
      fetchInstance();
    } catch (error) {
      console.error('Failed to connect to ClawNet:', error);
    }
  };

  if (!instance) {
    return <Card loading={loading}>加载中...</Card>;
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/instances')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card
        title={`实例: ${instance.name}`}
        extra={
          <Space>
            {instance.status === 'running' ? (
              <Button 
                danger 
                icon={<PauseCircleOutlined />}
                onClick={handleStop}
              >
                停止
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={handleStart}
              >
                启动
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchInstance}>
              刷新
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'overview',
              label: '概览',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="CPU 使用率"
                          value={12}
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="内存使用"
                          value={256}
                          suffix="MB"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="网络流量"
                          value={1.2}
                          suffix="MB/s"
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="实例 ID">{instance.id}</Descriptions.Item>
                    <Descriptions.Item label="端口">{instance.port}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={instance.status === 'running' ? 'success' : 'default'}>
                        {instance.status === 'running' ? '运行中' : '已停止'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Gateway PID">
                      {instance.gateway?.pid || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="微信状态">
                      <Space>
                        <WechatOutlined />
                        <Tag color={instance.wechat?.loggedIn ? 'success' : 'default'}>
                          {instance.wechat?.loggedIn ? '已登录' : '未登录'}
                        </Tag>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="ClawNet">
                      <Space>
                        <ApiOutlined />
                        <Tag color={instance.clawnet?.connected ? 'success' : 'default'}>
                          {instance.clawnet?.connected ? '已连接' : '未连接'}
                        </Tag>
                        {!instance.clawnet?.connected && (
                          <Button size="small" onClick={handleConnect}>
                            连接
                          </Button>
                        )}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {new Date(instance.createdAt).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'config',
              label: '配置',
              children: (
                <Alert
                  message="配置功能"
                  description="实例配置编辑功能开发中..."
                  type="info"
                  showIcon
                />
              ),
            },
            {
              key: 'logs',
              label: '日志',
              children: (
                <Alert
                  message="日志查看"
                  description="实时日志查看功能开发中..."
                  type="info"
                  showIcon
                />
              ),
            },
            {
              key: 'wechat',
              label: '微信',
              children: (
                <Alert
                  message="微信管理"
                  description="微信登录和账号管理功能开发中..."
                  type="info"
                  showIcon
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default InstanceDetail;
