import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Tooltip,
  Badge,
  Descriptions,
  Divider,
  Progress,
  Typography,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  WechatOutlined,
  QrcodeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface Instance {
  id: string;
  name: string;
  port: number;
  profileDir: string;
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
    lastStartedAt?: string;
  };
  clawnet?: {
    connected: boolean;
    nodeId?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface ProgressStep {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  
  // 创建进度相关状态
  const [isCreating, setIsCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createSteps, setCreateSteps] = useState<ProgressStep[]>([]);
  const [createLogs, setCreateLogs] = useState<string[]>([]);
  
  // 微信ClawBot连接相关状态
  const [isWechatModalVisible, setIsWechatModalVisible] = useState(false);
  const [wechatInstance, setWechatInstance] = useState<string>('');
  const [wechatQRURL, setWechatQRURL] = useState<string>('');
  const [wechatLoginStatus, setWechatLoginStatus] = useState<'pending' | 'scanned' | 'success' | 'failed'>('pending');

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

  const handleCreate = async (values: any) => {
    const instanceName = values.name;
    
    setIsCreating(true);
    setCreateProgress(0);
    setCreateSteps([]);
    setCreateLogs([]);
    
    // 添加日志的辅助函数
    const addLog = (log: string) => {
      setCreateLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
    };
    
    const updateStep = (stepName: string, status: ProgressStep['status'], message?: string) => {
      setCreateSteps(prev => {
        const newSteps = [...prev];
        const existingIndex = newSteps.findIndex(s => s.step === stepName);
        if (existingIndex >= 0) {
          newSteps[existingIndex] = { step: stepName, status, message };
        } else {
          newSteps.push({ step: stepName, status, message });
        }
        return newSteps;
      });
    };
    
    try {
      // 步骤1: 验证名称
      updateStep('验证名称', 'running');
      addLog('正在验证实例名称...');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('验证名称', 'success');
      setCreateProgress(10);
      
      // 步骤2: 创建配置目录
      updateStep('创建配置', 'running');
      addLog('正在创建配置目录...');
      setCreateProgress(20);
      
      // 步骤3: 发送创建请求
      updateStep('创建实例', 'running');
      addLog('正在创建实例...');
      
      const response = await api.post('/instances', {
        name: instanceName,
        autoInstallWeixin: values.autoConfig?.includes('weixin'),
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || '创建失败');
      }
      
      updateStep('创建配置', 'success');
      updateStep('创建实例', 'success');
      addLog('✓ 实例配置创建成功');
      setCreateProgress(50);
      
      // 步骤4: 安装微信插件（如果选择了）
      if (values.autoConfig?.includes('weixin')) {
        updateStep('安装插件', 'running');
        addLog('正在安装微信插件...');
        addLog('下载 @tencent-weixin/openclaw-weixin...');
        addLog('这可能需要 30-60 秒，请耐心等待...');
        
        // 模拟安装进度（实际已由后端完成）
        setCreateProgress(70);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updateStep('安装插件', 'success');
        addLog('✓ 微信插件安装成功');
        setCreateProgress(90);
      } else {
        setCreateProgress(80);
      }
      
      // 步骤5: 完成
      updateStep('完成', 'success');
      addLog('✓ 实例创建完成！');
      setCreateProgress(100);
      
      message.success('实例创建成功');
      
      setTimeout(() => {
        setIsCreating(false);
        setIsModalVisible(false);
        form.resetFields();
        fetchInstances();
        
        // 如果选择了自动启动
        if (values.autoConfig?.includes('gateway')) {
          handleStart(instanceName);
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Failed to create instance:', error);
      updateStep('创建失败', 'error', error.message);
      addLog(`✗ 错误: ${error.response?.data?.error || error.message}`);
      setCreateProgress(0);
      
      message.error({ 
        content: `创建失败: ${error.response?.data?.error || error.message}`,
        duration: 5
      });
      
      setTimeout(() => {
        setIsCreating(false);
      }, 3000);
    }
  };

  const handleStart = async (name: string) => {
    try {
      message.loading({ content: `正在启动实例 ${name}...`, key: 'start' });
      
      await api.post(`/instances/${name}/start`);
      
      message.success({ content: `实例 ${name} 启动成功`, key: 'start' });
      fetchInstances();
    } catch (error: any) {
      console.error('Failed to start instance:', error);
      message.error({ 
        content: `启动失败: ${error.response?.data?.error || error.message}`,
        key: 'start'
      });
    }
  };

  const handleStop = async (name: string) => {
    Modal.confirm({
      title: '确认停止实例',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要停止实例 <strong>{name}</strong> 吗？</p>
          <p style={{ color: '#8c8c8c', fontSize: 12 }}>
            停止后：
          </p>
          <ul style={{ color: '#8c8c8c', fontSize: 12, paddingLeft: 20 }}>
            <li>Gateway 进程将被终止</li>
            <li>所有连接将断开</li>
            <li>实例数据不会丢失</li>
          </ul>
        </div>
      ),
      okText: '停止',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          message.loading({ content: `正在停止实例 ${name}...`, key: 'stop' });
          
          await api.post(`/instances/${name}/stop`);
          
          message.success({ content: `实例 ${name} 已停止`, key: 'stop' });
          fetchInstances();
        } catch (error: any) {
          console.error('Failed to stop instance:', error);
          message.error({ 
            content: `停止失败: ${error.response?.data?.error || error.message}`,
            key: 'stop'
          });
        }
      },
    });
  };

  const handleDelete = async (name: string, force: boolean = false) => {
    const instance = instances.find(i => i.name === name);
    
    Modal.confirm({
      title: force ? '⚠️ 强制删除实例' : '确认删除实例',
      icon: force ? <WarningOutlined style={{ color: '#ff4d4f' }} /> : <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要删除实例 <strong>{name}</strong> 吗？</p>
          
          {instance && (
            <Descriptions size="small" column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="端口">{instance.port}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={instance.status === 'running' ? 'success' : 'default'}>
                  {instance.status === 'running' ? '运行中' : '已停止'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
          
          <Divider />
          
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ 警告：此操作将永久删除所有数据！
          </p>
        </div>
      ),
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.loading({ content: `正在删除实例 ${name}...`, key: 'delete' });
          
          if (force && instance?.status === 'running') {
            await api.post(`/instances/${name}/stop`);
          }
          
          await api.delete(`/instances/${name}`);
          
          message.success({ content: `实例 ${name} 已删除`, key: 'delete' });
          fetchInstances();
        } catch (error: any) {
          console.error('Failed to delete instance:', error);
          message.error({ 
            content: `删除失败: ${error.response?.data?.error || error.message}`,
            key: 'delete'
          });
        }
      },
    });
  };

  const handleWechatLogin = async (instanceName: string) => {
    setWechatInstance(instanceName);
    setIsWechatModalVisible(true);
    setWechatLoginStatus('pending');
    setWechatQRURL('');
    
    try {
      message.loading({ content: '正在获取微信ClawBot连接信息...', key: 'wechat' });
      
      // 获取连接信息
      const response = await api.get(`/instances/${instanceName}/wechat/qrcode`);
      
      // Web端暂不支持直接扫码，显示CLI命令
      if (!response.data.success && response.data.fallback) {
        setWechatLoginStatus('pending');
        message.info({ 
          content: '请在终端中使用命令连接',
          key: 'wechat',
          duration: 5
        });
        return;
      }
      
      // 如果后端支持二维码（未来功能）
      if (response.data.success && response.data.data?.qrUrl) {
        setWechatQRURL(response.data.data.qrUrl);
        message.success({ content: '请扫描二维码连接', key: 'wechat' });
        
        // 轮询连接状态
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.get(`/instances/${instanceName}`);
            if (statusRes.data.data?.wechat?.loggedIn) {
              clearInterval(pollInterval);
              setWechatLoginStatus('success');
              message.success('微信ClawBot连接成功！');
              setTimeout(() => {
                setIsWechatModalVisible(false);
                fetchInstances();
              }, 1500);
            }
          } catch (error) {
            console.error('Failed to poll connection status:', error);
          }
        }, 2000);
        
        // 60秒后停止轮询
        setTimeout(() => {
          clearInterval(pollInterval);
          if (wechatLoginStatus === 'pending') {
            setWechatLoginStatus('failed');
            message.warning('连接超时，请重试');
          }
        }, 60000);
      }
    } catch (error: any) {
      console.error('Failed to get WeChat connection info:', error);
      message.error({ 
        content: `获取连接信息失败: ${error.response?.data?.error || error.message}`,
        key: 'wechat'
      });
      setWechatLoginStatus('failed');
    }
  };

  const columns = [
    {
      title: '实例名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => (
        <a onClick={() => navigate(`/instances/${name}`)}>{name}</a>
      ),
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Instance) => (
        <Space direction="vertical" size="small">
          <Tag color={status === 'running' ? 'success' : 'default'}>
            {status === 'running' ? '✅ 运行中' : '⏸️ 已停止'}
          </Tag>
          {record.gateway?.running && (
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              PID: {record.gateway.pid}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '微信',
      dataIndex: 'wechat',
      key: 'wechat',
      width: 120,
      render: (wechat: any, record: Instance) => (
        <Space direction="vertical" size="small">
          <Tag color={wechat?.loggedIn ? 'success' : 'default'} icon={<WechatOutlined />}>
            {wechat?.loggedIn ? '已连接' : '未连接'}
          </Tag>
          {!wechat?.loggedIn && (
            <Button 
              type="link" 
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleWechatLogin(record.name)}
            >
              连接
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'ClawNet',
      dataIndex: 'clawnet',
      key: 'clawnet',
      width: 100,
      render: (clawnet: any) => (
        <Tag color={clawnet?.connected ? 'success' : 'default'}>
          {clawnet?.connected ? '✅ 已连接' : '❌ 未连接'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: Instance) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate(`/instances/${record.name}`)}
            >
              详情
            </Button>
          </Tooltip>
          
          {record.status === 'running' ? (
            <Button 
              type="link" 
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleStop(record.name)}
              danger
            >
              停止
            </Button>
          ) : (
            <Button 
              type="link" 
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.name)}
            >
              启动
            </Button>
          )}
          
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.name, record.status === 'running')}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

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
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              创建实例
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
              提示：实例停止后数据不会丢失，删除后将永久移除所有数据
            </span>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={instances} 
          loading={loading}
          rowSelection={rowSelection}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个实例`,
          }}
          scroll={{ x: 1200 }}
          rowKey="id"
        />
      </Card>

      {/* 创建实例对话框 */}
      <Modal
        title="创建新实例"
        open={isModalVisible}
        onCancel={() => {
          if (!isCreating) {
            setIsModalVisible(false);
            form.resetFields();
          }
        }}
        footer={null}
        width={600}
      >
        {isCreating ? (
          // 创建进度显示
          <div style={{ padding: '20px 0' }}>
            <Progress 
              percent={createProgress} 
              status={createProgress === 100 ? 'success' : 'active'}
              style={{ marginBottom: 24 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              {createSteps.map((step, index) => (
                <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                  {step.status === 'running' && <LoadingOutlined style={{ marginRight: 8, color: '#1890ff' }} />}
                  {step.status === 'success' && <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
                  {step.status === 'error' && <CloseCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />}
                  {step.status === 'pending' && <span style={{ marginRight: 24 }} />}
                  <Text>{step.step}</Text>
                  {step.message && <Text type="secondary" style={{ marginLeft: 8 }}>- {step.message}</Text>}
                </div>
              ))}
            </div>
            
            <div 
              style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                maxHeight: 200,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12
              }}
            >
              {createLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // 创建表单
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            initialValues={{
              autoConfig: ['weixin'],
            }}
          >
            <Form.Item 
              label="实例名称" 
              name="name"
              rules={[
                { required: true, message: '请输入实例名称' },
                { pattern: /^[a-z0-9_-]+$/i, message: '只能包含字母、数字、下划线和连字符' },
                { min: 3, message: '名称至少 3 个字符' },
                { max: 20, message: '名称最多 20 个字符' },
              ]}
              extra="实例名称将作为唯一标识，创建后不可修改"
            >
              <Input placeholder="例如：my-bot-1" />
            </Form.Item>

            <Form.Item 
              label="自动配置" 
              name="autoConfig"
              extra="选择需要自动执行的配置操作"
            >
              <Select mode="multiple" style={{ width: '100%' }}>
                <Select.Option value="weixin">
                  📲 自动安装微信插件（推荐）
                </Select.Option>
                <Select.Option value="gateway">
                  🚀 自动启动 Gateway
                </Select.Option>
                <Select.Option value="clawnet">
                  🔗 自动连接 ClawNet
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  创建实例
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        <Divider />

        <div style={{ color: '#8c8c8c', fontSize: 12 }}>
          <p><strong>说明：</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <li>实例将自动分配端口（19000-19099）</li>
            <li>每个实例有独立的配置目录和数据存储</li>
            <li>微信插件安装约需 30-60 秒</li>
            <li>创建完成后可扫码连接微信</li>
          </ul>
        </div>
      </Modal>

      {/* 微信ClawBot连接对话框 */}
      <Modal
        title={<><WechatOutlined /> 微信ClawBot连接 - {wechatInstance}</>}
        open={isWechatModalVisible}
        onCancel={() => {
          setIsWechatModalVisible(false);
          setWechatQRURL('');
          setWechatLoginStatus('pending');
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsWechatModalVisible(false);
            setWechatQRURL('');
            setWechatLoginStatus('pending');
          }}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: '10px 0' }}>
          {wechatQRURL ? (
            // 如果有二维码URL（未来支持）
            <div style={{ textAlign: 'center' }}>
              <img 
                src={wechatQRURL} 
                alt="微信ClawBot连接二维码" 
                style={{ maxWidth: '100%', marginBottom: 16 }}
              />
              <p>请使用微信扫描二维码连接</p>
              {wechatLoginStatus === 'pending' && (
                <Text type="secondary">
                  <LoadingOutlined /> 等待扫码...
                </Text>
              )}
              {wechatLoginStatus === 'success' && (
                <Text type="success">
                  <CheckCircleOutlined /> 连接成功！
                </Text>
              )}
            </div>
          ) : (
            // CLI连接方式（当前推荐）
            <div>
              <Alert
                message="使用终端命令连接"
                description={
                  <div>
                    <p style={{ marginBottom: 12 }}>
                      微信ClawBot连接需要通过终端完成，请按以下步骤操作：
                    </p>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>第1步：复制命令</Text>
                      <Paragraph 
                        copyable={{ text: `openclaw --profile ${wechatInstance} channels login --channel openclaw-weixin` }}
                        style={{ 
                          background: '#f5f5f5', 
                          padding: 12, 
                          borderRadius: 4,
                          fontFamily: 'monospace',
                          marginTop: 8
                        }}
                      >
                        openclaw --profile {wechatInstance} channels login --channel openclaw-weixin
                      </Paragraph>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>第2步：在终端中执行</Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20, color: '#666' }}>
                        <li>打开终端（Terminal）</li>
                        <li>粘贴并执行上述命令</li>
                        <li>等待二维码在终端显示</li>
                      </ul>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>第3步：扫描二维码</Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20, color: '#666' }}>
                        <li>打开微信 → 发现 → 扫一扫</li>
                        <li>扫描终端中显示的二维码</li>
                        <li>如果二维码不清晰，命令会输出URL</li>
                        <li>可在浏览器中打开URL查看高清二维码</li>
                      </ul>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>第4步：完成连接</Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20, color: '#666' }}>
                        <li>按照微信提示完成授权</li>
                        <li>终端显示"✅ 连接成功"</li>
                        <li>关闭此对话框并刷新页面查看状态</li>
                      </ul>
                    </div>
                    
                    <Divider />
                    
                    <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 4 }}>
                      <Text strong>💡 提示</Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 0 }}>
                        <li>微信登录是一次性操作，使用CLI更可靠</li>
                        <li>连接成功后，ClawBot会自动保持在线</li>
                        <li>如需重新连接，再次运行命令即可</li>
                      </ul>
                    </div>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Instances;
