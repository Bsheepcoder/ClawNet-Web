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
  Popconfirm,
  Tooltip,
  Badge,
  Descriptions,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import dayjs from 'dayjs';

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

const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInstances();
    // 每 30 秒自动刷新
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
    try {
      message.loading({ content: '正在创建实例...', key: 'create' });
      
      await api.post('/instances', {
        name: values.name,
        autoInstallWeixin: values.autoConfig?.includes('weixin'),
      });
      
      message.success({ content: '实例创建成功', key: 'create' });
      setIsModalVisible(false);
      form.resetFields();
      fetchInstances();
    } catch (error: any) {
      console.error('Failed to create instance:', error);
      message.error({ 
        content: `创建实例失败: ${error.response?.data?.error || error.message}`,
        key: 'create'
      });
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
              {instance.gateway?.running && (
                <Descriptions.Item label="PID">{instance.gateway.pid}</Descriptions.Item>
              )}
            </Descriptions>
          )}
          
          <Divider />
          
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ 警告：此操作将：
          </p>
          <ul style={{ color: '#ff4d4f', paddingLeft: 20 }}>
            <li>删除实例配置</li>
            <li>删除所有数据（包括微信登录信息）</li>
            <li>删除日志文件</li>
            <li>此操作<span style={{ fontWeight: 'bold' }}>不可恢复</span></li>
          </ul>
          
          {force && (
            <p style={{ color: '#ff4d4f', fontWeight: 'bold', marginTop: 16 }}>
              强制删除模式：将强制停止运行中的实例并删除
            </p>
          )}
        </div>
      ),
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.loading({ content: `正在删除实例 ${name}...`, key: 'delete' });
          
          // 如果是强制删除且实例正在运行，先停止
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

  const handleBatchStop = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要停止的实例');
      return;
    }

    Modal.confirm({
      title: '批量停止实例',
      icon: <ExclamationCircleOutlined />,
      content: `确定要停止选中的 ${selectedRowKeys.length} 个实例吗？`,
      okText: '停止',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          message.loading({ content: '正在批量停止实例...', key: 'batch-stop' });
          
          await Promise.all(
            selectedRowKeys.map(key => 
              api.post(`/instances/${key}/stop`).catch(err => {
                console.error(`Failed to stop ${key}:`, err);
                return err;
              })
            )
          );
          
          message.success({ content: '批量停止完成', key: 'batch-stop' });
          setSelectedRowKeys([]);
          fetchInstances();
        } catch (error: any) {
          message.error({ 
            content: `批量停止失败: ${error.message}`,
            key: 'batch-stop'
          });
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的实例');
      return;
    }

    Modal.confirm({
      title: '⚠️ 批量删除实例',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>确定要删除选中的 <strong>{selectedRowKeys.length}</strong> 个实例吗？</p>
          <p style={{ color: '#ff4d4f' }}>
            ⚠️ 此操作不可恢复！所有数据将被永久删除。
          </p>
        </div>
      ),
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.loading({ content: '正在批量删除实例...', key: 'batch-delete' });
          
          await Promise.all(
            selectedRowKeys.map(key => 
              api.delete(`/instances/${key}`).catch(err => {
                console.error(`Failed to delete ${key}:`, err);
                return err;
              })
            )
          );
          
          message.success({ content: '批量删除完成', key: 'batch-delete' });
          setSelectedRowKeys([]);
          fetchInstances();
        } catch (error: any) {
          message.error({ 
            content: `批量删除失败: ${error.message}`,
            key: 'batch-delete'
          });
        }
      },
    });
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
      width: 100,
      render: (wechat: any) => (
        <Tag color={wechat?.loggedIn ? 'success' : 'default'}>
          {wechat?.loggedIn ? '✅ 已登录' : '❌ 未登录'}
        </Tag>
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
            <Popconfirm
              title="停止实例"
              description="确定要停止此实例吗？"
              onConfirm={() => handleStop(record.name)}
              okText="停止"
              cancelText="取消"
            >
              <Button 
                type="link" 
                size="small"
                icon={<PauseCircleOutlined />}
                danger
              >
                停止
              </Button>
            </Popconfirm>
          ) : (
            <Tooltip title="启动实例">
              <Button 
                type="link" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.name)}
              >
                启动
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title="删除实例（不可恢复）">
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.name, record.status === 'running')}
            >
              删除
            </Button>
          </Tooltip>
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
            {selectedRowKeys.length > 0 && (
              <>
                <Button 
                  danger 
                  icon={<PauseCircleOutlined />}
                  onClick={handleBatchStop}
                >
                  批量停止 ({selectedRowKeys.length})
                </Button>
                <Button 
                  danger 
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </>
            )}
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
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            autoConfig: ['weixin', 'gateway', 'clawnet'],
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
            <Input 
              placeholder="例如：my-bot-1" 
              prefix={<span style={{ color: '#8c8c8c' }}>openclaw-</span>}
            />
          </Form.Item>

          <Form.Item 
            label="自动配置" 
            name="autoConfig"
            extra="选择需要自动执行的配置操作"
          >
            <Select mode="multiple" style={{ width: '100%' }}>
              <Select.Option value="weixin">
                🔌 自动安装微信插件
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

        <Divider />

        <div style={{ color: '#8c8c8c', fontSize: 12 }}>
          <p><strong>说明：</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <li>实例将自动分配端口（19000-19099）</li>
            <li>每个实例有独立的配置目录和数据存储</li>
            <li>实例创建后可以随时启动/停止</li>
            <li>删除实例将永久移除所有数据，请谨慎操作</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Instances;
