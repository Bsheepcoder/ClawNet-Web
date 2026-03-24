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
  // 新增配置信息
  config?: {
    model?: {
      primary: string;
      fallbacks: string[];
    };
    workspace?: string;
    channels?: string[];
    plugins?: string[];
    clawnet?: {
      forwardWechat: boolean;
      endpoint: string;
    };
    gateway?: {
      shared: boolean;
      port: number;
      bind: string;
    };
  };
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
                    <Descriptions.Item label="实例名称">{instance.name}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={instance.status === 'running' ? 'success' : 'default'}>
                        {instance.status === 'running' ? '✅ 运行中' : '⏸️ 已停止'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Gateway">
                      <Space>
                        <Tag color="blue">共享 Gateway</Tag>
                        <span>:18789</span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {new Date(instance.createdAt).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 模型配置 */}
                  <Card title="🤖 模型配置" size="small" style={{ marginTop: 16 }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="主模型">
                        <Tag color="blue">{instance.config?.model?.primary || '未配置'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="备用模型">
                        <Space wrap>
                          {instance.config?.model?.fallbacks?.map((model, idx) => (
                            <Tag key={idx}>{model}</Tag>
                          )) || <span style={{color: '#999'}}>无</span>}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="工作空间">
                        <code>{instance.config?.workspace || '未配置'}</code>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* 插件列表 */}
                  <Card title="🔌 插件列表" size="small" style={{ marginTop: 16 }}>
                    {instance.config?.plugins?.length ? (
                      <Space wrap>
                        {instance.config.plugins.map((plugin, idx) => (
                          <Tag key={idx} color="green">{plugin}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <span style={{color: '#999'}}>无插件</span>
                    )}
                  </Card>

                  {/* 通道配置 */}
                  <Card title="📡 通道配置" size="small" style={{ marginTop: 16 }}>
                    {instance.config?.channels?.length ? (
                      <Space wrap>
                        {instance.config.channels.map((channel, idx) => (
                          <Tag key={idx} color="purple">{channel.toUpperCase()}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <span style={{color: '#999'}}>无通道配置</span>
                    )}
                  </Card>

                  {/* ClawNet 配置 */}
                  <Card title="🌐 ClawNet 配置" size="small" style={{ marginTop: 16 }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="微信消息转发">
                        {instance.config?.clawnet?.forwardWechat ? (
                          <Tag color="success">✅ 已启用</Tag>
                        ) : (
                          <Tag>❌ 未启用</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="转发端点">
                        <code>{instance.config?.clawnet?.endpoint || '未配置'}</code>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* 微信状态 */}
                  <Card title="💬 微信状态" size="small" style={{ marginTop: 16 }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="登录状态">
                        <Space>
                          <WechatOutlined />
                          <Tag color={instance.wechat?.loggedIn ? 'success' : 'default'}>
                            {instance.wechat?.loggedIn ? '✅ 已登录' : '❌ 未登录'}
                          </Tag>
                        </Space>
                      </Descriptions.Item>
                      {instance.wechat?.accountId && (
                        <Descriptions.Item label="账号 ID">
                          {instance.wechat.accountId}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>

                  {/* ClawNet 连接状态 */}
                  <Card title="🔗 ClawNet 连接" size="small" style={{ marginTop: 16 }}>
                    <Space>
                      <ApiOutlined />
                      <Tag color={instance.clawnet?.connected ? 'success' : 'default'}>
                        {instance.clawnet?.connected ? '✅ 已连接' : '❌ 未连接'}
                      </Tag>
                      {instance.clawnet?.nodeId && (
                        <span>节点: {instance.clawnet.nodeId}</span>
                      )}
                      {!instance.clawnet?.connected && (
                        <Button size="small" type="primary" onClick={handleConnect}>
                          连接
                        </Button>
                      )}
                    </Space>
                  </Card>
                </div>
              ),
            },
            {
              key: 'config',
              label: '📝 配置编辑',
              children: (
                <div>
                  <Alert
                    message="配置修改后需要重启实例才能生效"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  
                  {/* 模型配置 */}
                  <Card title="🤖 模型配置" size="small" style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="主模型">
                        <Tag color="blue">{instance.config?.model?.primary || '未配置'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="备用模型">
                        <Space wrap>
                          {instance.config?.model?.fallbacks?.map((model, idx) => (
                            <Tag key={idx}>{model}</Tag>
                          )) || <span style={{color: '#999'}}>无</span>}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                    <Button size="small" style={{ marginTop: 8 }} onClick={() => message.info('配置编辑功能开发中')}>
                      编辑模型配置
                    </Button>
                  </Card>

                  {/* ClawNet 配置 */}
                  <Card title="🌐 ClawNet 配置" size="small" style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="微信消息转发">
                        {instance.config?.clawnet?.forwardWechat ? (
                          <Tag color="success">✅ 已启用</Tag>
                        ) : (
                          <Tag>❌ 未启用</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="转发端点">
                        <code>{instance.config?.clawnet?.endpoint || '未配置'}</code>
                      </Descriptions.Item>
                    </Descriptions>
                    <Button size="small" style={{ marginTop: 8 }} onClick={() => message.info('配置编辑功能开发中')}>
                      编辑 ClawNet 配置
                    </Button>
                  </Card>

                  {/* 通道配置 */}
                  <Card title="📡 通道配置" size="small" style={{ marginBottom: 16 }}>
                    {instance.config?.channels?.length ? (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {instance.config.channels.includes('telegram') && (
                          <div>
                            <Tag color="purple">Telegram</Tag>
                            <Button size="small" type="link">配置</Button>
                          </div>
                        )}
                        {instance.config.channels.includes('wechat') && (
                          <div>
                            <Tag color="green">微信</Tag>
                            <Button size="small" type="link">配置</Button>
                          </div>
                        )}
                      </Space>
                    ) : (
                      <span style={{color: '#999'}}>无通道配置</span>
                    )}
                  </Card>

                  {/* Gateway 配置 */}
                  <Card title="🌐 Gateway 配置" size="small">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="共享模式">
                        <Tag color={instance.config?.gateway?.shared ? 'blue' : 'green'}>
                          {instance.config?.gateway?.shared ? '共享主 Gateway' : '独立 Gateway'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="端口">
                        {instance.config?.gateway?.port || 18789}
                      </Descriptions.Item>
                      <Descriptions.Item label="绑定模式">
                        {instance.config?.gateway?.bind || 'lan'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ),
            },
            {
              key: 'extensions',
              label: '🔌 扩展管理',
              children: (
                <div>
                  {/* 微信插件 */}
                  <Card 
                    title={
                      <Space>
                        <span>📱 微信插件</span>
                        <Tag color="green">openclaw-weixin</Tag>
                      </Space>
                    }
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>版本: </Text>
                        <Tag>1.0.3</Tag>
                      </div>
                      
                      <div>
                        <Text strong>状态: </Text>
                        <Tag color={instance.wechat?.loggedIn ? 'success' : 'default'}>
                          {instance.wechat?.loggedIn ? '✅ 已登录' : '❌ 未登录'}
                        </Tag>
                      </div>
                      
                      {instance.wechat?.accountId && (
                        <div>
                          <Text strong>账号 ID: </Text>
                          <Text code>{instance.wechat.accountId}</Text>
                        </div>
                      )}
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <Space>
                        <Text strong>启用状态: </Text>
                        <Tag color={instance.config?.plugins?.includes('openclaw-weixin') ? 'success' : 'default'}>
                          {instance.config?.plugins?.includes('openclaw-weixin') ? '✅ 已启用' : '❌ 已禁用'}
                        </Tag>
                      </Space>
                    </Space>
                  </Card>

                  {/* OpenViking 扩展 */}
                  <Card 
                    title={
                      <Space>
                        <span>🧠 OpenViking</span>
                        <Tag>记忆系统适配器</Tag>
                      </Space>
                    }
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>状态: </Text>
                        <Tag>❌ 未安装</Tag>
                      </div>
                      
                      <Button type="dashed" block onClick={() => message.info('插件安装功能开发中')}>
                        安装 OpenViking 扩展
                      </Button>
                    </Space>
                  </Card>

                  {/* 安装新插件 */}
                  <Card title="安装新插件" size="small">
                    <Alert
                      message="高级功能"
                      description="插件管理功能需要管理员权限，请联系系统管理员"
                      type="info"
                      showIcon
                    />
                  </Card>
                </div>
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
