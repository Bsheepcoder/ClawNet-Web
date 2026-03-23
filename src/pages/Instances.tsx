import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Instance {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'stopped';
  wechat?: {
    loggedIn: boolean;
  };
  createdAt: string;
}

const Instances: React.FC = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInstances();
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
      await api.post('/instances', {
        name: values.name,
        autoInstallWeixin: true,
      });
      message.success('实例创建成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchInstances();
    } catch (error) {
      console.error('Failed to create instance:', error);
      message.error('创建实例失败');
    }
  };

  const handleStart = async (name: string) => {
    try {
      await api.post(`/instances/${name}/start`);
      message.success('实例启动成功');
      fetchInstances();
    } catch (error) {
      console.error('Failed to start instance:', error);
      message.error('启动实例失败');
    }
  };

  const handleStop = async (name: string) => {
    try {
      await api.post(`/instances/${name}/stop`);
      message.success('实例已停止');
      fetchInstances();
    } catch (error) {
      console.error('Failed to stop instance:', error);
      message.error('停止实例失败');
    }
  };

  const handleDelete = async (name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除实例 "${name}" 吗？此操作不可恢复。`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/instances/${name}`);
          message.success('实例已删除');
          fetchInstances();
        } catch (error) {
          console.error('Failed to delete instance:', error);
          message.error('删除实例失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '实例名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <a onClick={() => navigate(`/instances/${name}`)}>{name}</a>
      ),
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
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
      dataIndex: 'wechat',
      key: 'wechat',
      render: (wechat: any) => (
        <Tag color={wechat?.loggedIn ? 'success' : 'default'}>
          {wechat?.loggedIn ? '✅ 已登录' : '❌ 未登录'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Instance) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate(`/instances/${record.name}`)}
          >
            详情
          </Button>
          {record.status === 'running' ? (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleStop(record.name)}
            >
              停止
            </Button>
          ) : (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleStart(record.name)}
            >
              启动
            </Button>
          )}
          <Button 
            type="link" 
            size="small" 
            danger
            onClick={() => handleDelete(record.name)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="📦 实例管理"
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
        <Table 
          columns={columns} 
          dataSource={instances} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>

      <Modal
        title="创建新实例"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
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
              { pattern: /^[a-z0-9_-]+$/i, message: '只能包含字母、数字、下划线和横线' }
            ]}
          >
            <Input placeholder="例如：my-bot-1" />
          </Form.Item>
          <Form.Item label="自动配置" name="autoConfig">
            <Select mode="multiple" style={{ width: '100%' }}>
              <Select.Option value="weixin">自动安装微信插件</Select.Option>
              <Select.Option value="gateway">自动启动 Gateway</Select.Option>
              <Select.Option value="clawnet">自动连接 ClawNet</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建实例</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Instances;
