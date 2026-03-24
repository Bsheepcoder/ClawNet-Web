import React, { useEffect, useState, useRef } from 'react';
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
  CloseCircleOutlined,
  LinkOutlined
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
  
  // Gateway 状态
  const [gatewayStatus, setGatewayStatus] = useState<{
    connected: boolean;
    url: string;
    port: number;
    lastChecked: string;
    version?: string;
    uptime?: number;
  }>({
    connected: false,
    url: 'http://localhost:18789',
    port: 18789,
    lastChecked: '-'
  });
  
  // 创建进度相关状态
  const [isCreating, setIsCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createSteps, setCreateSteps] = useState<ProgressStep[]>([]);
  const [createLogs, setCreateLogs] = useState<string[]>([]);
  
  // 微信登录相关状态
  const [isWechatModalVisible, setIsWechatModalVisible] = useState(false);
  const [wechatInstance, setWechatInstance] = useState<string>('');
  const [wechatQRURL, setWechatQRURL] = useState<string>('');
  const [wechatLoginStatus, setWechatLoginStatus] = useState<'pending' | 'scanned' | 'success' | 'failed'>('pending');
  const [wechatOutput, setWechatOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // 终端输出容器的引用，用于自动滚动
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [wechatOutput]);

  useEffect(() => {
    fetchInstances();
    fetchGatewayStatus();
    const interval = setInterval(() => {
      fetchInstances();
      fetchGatewayStatus();
    }, 10000); // 每 10 秒检测一次
    return () => clearInterval(interval);
  }, []);

  // 获取 Gateway 状态
  const fetchGatewayStatus = async () => {
    try {
      // 通过 ClawNet 后端代理检测 Gateway
      const response = await api.get('/gateway/status');
      const data = response.data;
      
      setGatewayStatus({
        connected: data.connected || false,
        url: data.url || 'http://localhost:18789',
        port: data.port || 18789,
        lastChecked: new Date().toLocaleTimeString(),
        version: data.version
      });
    } catch (error) {
      setGatewayStatus({
        connected: false,
        url: 'http://localhost:18789',
        port: 18789,
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  };

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

  const handleConnectToClawnet = async (name: string) => {
    try {
      message.loading({ content: `正在连接 ${name} 到 ClawNet...`, key: 'connect' });
      
      const response = await api.post(`/instances/${name}/connect`);
      
      if (response.data.success) {
        message.success({ content: `${name} 已成功连接到 ClawNet`, key: 'connect' });
        fetchInstances();
      } else {
        message.error({ 
          content: `连接失败: ${response.data.error || '未知错误'}`, 
          key: 'connect' 
        });
      }
    } catch (error: any) {
      console.error('Failed to connect to ClawNet:', error);
      message.error({ 
        content: `连接失败: ${error.response?.data?.error || error.message}`,
        key: 'connect' 
      });
    }
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
    setWechatOutput([]);
    setIsExecuting(true);
    
    try {
      // 调用后端API启动登录命令
      const response = await api.post(`/instances/${instanceName}/wechat/login`);
      
      if (response.data.success) {
        const sessionId = response.data.data.sessionId;
        
        // 连接WebSocket接收实时输出
        // 生成一个临时的 nodeId 用于 WebSocket 连接
        const tempNodeId = `web-client-${Date.now()}`;
        // 使用当前页面的 hostname 动态构建 WebSocket URL
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname;
        const wsPort = '3000'; // 后端 WebSocket 端口
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws?nodeId=${tempNodeId}&token=clawnet-secret-token`;
        
        console.log('[WebSocket] Connecting to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWechatOutput(prev => [...prev, '✓ 已连接到服务器']);
          setWechatOutput(prev => [...prev, `✓ 登录会话: ${sessionId}`]);
          setWechatOutput(prev => [...prev, '']);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.sessionId === sessionId) {
              switch (data.type) {
                case 'wechat:login:output':
                  // 添加输出行
                  data.output.split('\n').forEach((line: string) => {
                    if (line.trim()) {
                      setWechatOutput(prev => [...prev, line]);
                    }
                  });
                  break;
                  
                case 'wechat:login:qrcode':
                  // 检测到二维码URL
                  setWechatQRURL(data.qrUrl);
                  setWechatLoginStatus('scanned');
                  setWechatOutput(prev => [...prev, '']);
                  setWechatOutput(prev => [...prev, '📱 检测到二维码！']);
                  setWechatOutput(prev => [...prev, '请使用微信扫描上方二维码']);
                  break;
                  
                case 'wechat:login:complete':
                  // 登录完成
                  ws.close();
                  setIsExecuting(false);
                  
                  if (data.code === 0) {
                    setWechatLoginStatus('success');
                    setWechatOutput(prev => [...prev, '']);
                    setWechatOutput(prev => [...prev, '✅ 微信ClawBot连接成功！']);
                    
                    setTimeout(() => {
                      setIsWechatModalVisible(false);
                      fetchInstances();
                    }, 2000);
                  } else {
                    setWechatLoginStatus('failed');
                    setWechatOutput(prev => [...prev, '']);
                    setWechatOutput(prev => [...prev, `❌ 登录失败 (退出码: ${data.code})`]);
                  }
                  break;
                  
                case 'wechat:login:error':
                  ws.close();
                  setIsExecuting(false);
                  setWechatLoginStatus('failed');
                  setWechatOutput(prev => [...prev, '']);
                  setWechatOutput(prev => [...prev, `❌ 错误: ${data.error}`]);
                  break;
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        };
        
        ws.onerror = () => {
          setIsExecuting(false);
          setWechatLoginStatus('failed');
          setWechatOutput(prev => [...prev, '']);
          setWechatOutput(prev => [...prev, '❌ WebSocket连接失败']);
        };
        
        ws.onclose = () => {
          setIsExecuting(false);
        };
        
        // 60秒超时
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
            setIsExecuting(false);
            if (wechatLoginStatus === 'pending') {
              setWechatLoginStatus('failed');
              setWechatOutput(prev => [...prev, '']);
              setWechatOutput(prev => [...prev, '⏱️ 连接超时，请重试']);
            }
          }
        }, 60000);
      }
    } catch (error: any) {
      console.error('Failed to start login:', error);
      setIsExecuting(false);
      setWechatLoginStatus('failed');
      setWechatOutput(prev => [...prev, '']);
      setWechatOutput(prev => [...prev, `❌ 启动失败: ${error.response?.data?.error || error.message}`]);
    }
  };

  const columns = [
    {
      title: '实例名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: Instance) => (
        <a onClick={() => navigate(`/instances/${record.id}`)}>{name}</a>
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
              onClick={() => handleWechatLogin(record.id)}
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
              onClick={() => navigate(`/instances/${record.id}`)}
            >
              详情
            </Button>
          </Tooltip>
          
          {record.status === 'running' ? (
            <Button 
              type="link" 
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleStop(record.id)}
              danger
            >
              停止
            </Button>
          ) : (
            <Button 
              type="link" 
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          )}
          
          {!record.clawnet?.connected && record.status === 'running' && (
            <Tooltip title="已连接到ClawNet">
              <Button 
                type="link" 
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                ✓ ClawNet
              </Button>
            </Tooltip>
          )}
          
          {(!record.clawnet?.connected || record.status !== 'running') && (
            <Tooltip title={record.status !== 'running' ? '需要先启动实例' : '连接到ClawNet'}>
              <Button 
                type="link" 
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  if (record.status !== 'running') {
                    message.warning('请先启动实例');
                  } else {
                    handleConnectToClawnet(record.id);
                  }
                }}
                style={{ color: record.status !== 'running' ? '#8c8c8c' : '#1890ff' }}
              >
                <LinkOutlined /> 连接ClawNet
              </Button>
            </Tooltip>
          )}
          
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.status === 'running')}
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
      {/* Gateway 状态卡片 */}
      <Card 
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div>
              <Text strong style={{ fontSize: 16 }}>
                🌐 OpenClaw Gateway
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {gatewayStatus.url}
              </Text>
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>状态</Text>
              <br />
              <Tag 
                icon={gatewayStatus.connected ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={gatewayStatus.connected ? 'success' : 'error'}
                style={{ fontSize: 13, padding: '2px 8px' }}
              >
                {gatewayStatus.connected ? '已连接' : '未连接'}
              </Tag>
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>端口</Text>
              <br />
              <Text strong>{gatewayStatus.port}</Text>
            </div>
            
            <Divider type="vertical" style={{ height: 40 }} />
            
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>最后检测</Text>
              <br />
              <Text>{gatewayStatus.lastChecked}</Text>
            </div>
          </Space>
          
          <Space>
            <Button 
              icon={<LinkOutlined />}
              onClick={() => window.open(gatewayStatus.url, '_blank')}
              disabled={!gatewayStatus.connected}
            >
              打开 Gateway
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchGatewayStatus}
            >
              重新检测
            </Button>
          </Space>
        </div>
      </Card>

      {/* 实例管理卡片 */}
      <Card
        title={
          <Space>
            <span>📦 Gateway 下的实例</span>
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
              disabled={!gatewayStatus.connected}
            >
              创建实例
            </Button>
          </Space>
        }
      >
        {!gatewayStatus.connected && (
          <Alert
            message="Gateway 未连接"
            description="无法连接到 OpenClaw Gateway，请确保 Gateway 正在运行。实例管理功能可能不可用。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
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
          setWechatOutput([]);
          setIsExecuting(false);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsWechatModalVisible(false);
            setWechatQRURL('');
            setWechatLoginStatus('pending');
            setWechatOutput([]);
            setIsExecuting(false);
          }}>
            关闭
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ padding: '10px 0' }}>
          {/* 二维码显示区域 */}
          {wechatQRURL && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: 16,
              padding: 16,
              background: '#f0f2f5',
              borderRadius: 8
            }}>
              <img 
                src={wechatQRURL} 
                alt="微信ClawBot连接二维码" 
                style={{ 
                  maxWidth: '300px',
                  border: '3px solid #1890ff', 
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  📱 请使用微信扫描二维码
                </Tag>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                或在浏览器中打开：{wechatQRURL}
              </div>
            </div>
          )}
          
          {/* 实时终端输出 */}
          <div 
            ref={terminalRef}
            style={{ 
              background: '#1e1e1e', 
              borderRadius: 8, 
              padding: 16,
              fontFamily: '"Courier New", Monaco, Menlo, monospace',
              fontSize: 11,
              maxHeight: 500,
              overflow: 'auto',
              border: '1px solid #333'
            }}
          >
            <div style={{ 
              color: '#8c8c8c', 
              marginBottom: 12,
              borderBottom: '1px solid #333',
              paddingBottom: 8,
              position: 'sticky',
              top: 0,
              background: '#1e1e1e',
              zIndex: 1
            }}>
              <Text style={{ color: '#4ec9b0', fontSize: 13 }}>Terminal</Text>
              {' '}
              <Text style={{ color: '#8c8c8c', fontSize: 13 }}>- 微信ClawBot连接</Text>
              {isExecuting && <LoadingOutlined style={{ marginLeft: 8, color: '#1890ff' }} />}
            </div>
            
            {wechatOutput.length === 0 ? (
              <div style={{ color: '#8c8c8c', textAlign: 'center', padding: '40px 0' }}>
                <LoadingOutlined style={{ fontSize: 16 }} /> 正在启动登录命令...
              </div>
            ) : (
              <div style={{ lineHeight: '1.4' }}>
                {wechatOutput.map((line, index) => {
                  // 检测是否是ASCII二维码行
                  const isQRCodeLine = line.includes('█') || line.includes('▄') || line.includes('▀');
                  
                  return (
                    <div key={index} style={{ 
                      color: line.startsWith('✓') || line.startsWith('✅') ? '#4ec9b0' : 
                             line.startsWith('❌') ? '#f48771' :
                             line.startsWith('📱') ? '#dcdcaa' :
                             line.includes('二维码') ? '#569cd6' :
                             line.includes('http') ? '#9cdcfe' :
                             '#d4d4d4',
                      lineHeight: isQRCodeLine ? '1.0' : '1.6',
                      whiteSpace: isQRCodeLine ? 'pre' : 'pre-wrap',
                      wordBreak: 'break-all',
                      fontSize: isQRCodeLine ? 10 : 11,
                      letterSpacing: isQRCodeLine ? '0.1em' : 'normal'
                    }}>
                      {line || '\u00A0'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* 状态提示 */}
          {wechatLoginStatus === 'pending' && wechatOutput.length > 0 && !wechatQRURL && (
            <Alert
              message="等待生成二维码"
              description="正在启动微信登录，请稍候..."
              type="info"
              showIcon
              icon={<LoadingOutlined />}
              style={{ marginTop: 16 }}
            />
          )}
          
          {wechatLoginStatus === 'pending' && wechatOutput.length > 0 && wechatQRURL && (
            <Alert
              message="请使用微信扫码"
              description="二维码已生成，请打开微信扫一扫，扫描上方二维码或点击链接在浏览器中打开"
              type="info"
              showIcon
              icon={<WechatOutlined />}
              style={{ marginTop: 16 }}
            />
          )}
          
          {wechatLoginStatus === 'scanned' && (
            <Alert
              message="已检测到二维码"
              description="二维码已就绪，请使用微信扫描完成连接"
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          
          {wechatLoginStatus === 'success' && (
            <Alert
              message="🎉 连接成功"
              description="微信ClawBot已成功连接！对话框将自动关闭。"
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          
          {wechatLoginStatus === 'failed' && (
            <Alert
              message="连接失败"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>登录失败，您可以：</p>
                  <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                    <li>关闭对话框后重新点击"连接"按钮重试</li>
                    <li>在终端手动执行命令：</li>
                  </ul>
                  <Paragraph 
                    copyable={{ text: `openclaw --profile ${wechatInstance} channels login --channel openclaw-weixin` }}
                    style={{ 
                      margin: '8px 0 0 0', 
                      fontFamily: 'monospace',
                      background: '#f5f5f5',
                      padding: 8,
                      borderRadius: 4,
                      fontSize: 12
                    }}
                  >
                    openclaw --profile {wechatInstance} channels login --channel openclaw-weixin
                  </Paragraph>
                </div>
              }
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          
          {/* 手动执行提示 */}
          {!wechatQRURL && wechatOutput.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: '#f0f2f5', borderRadius: 4, fontSize: 12 }}>
              <div style={{ color: '#8c8c8c', marginBottom: 8 }}>💡 如果自动执行失败，请手动运行命令：</div>
              <Paragraph 
                copyable={{ text: `openclaw --profile ${wechatInstance} channels login --channel openclaw-weixin` }}
                style={{ 
                  margin: 0, 
                  fontFamily: 'monospace',
                  background: '#fff',
                  padding: 8,
                  borderRadius: 4,
                  border: '1px solid #d9d9d9'
                }}
              >
                openclaw --profile {wechatInstance} channels login --channel openclaw-weixin
              </Paragraph>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Instances;
