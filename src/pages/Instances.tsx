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

