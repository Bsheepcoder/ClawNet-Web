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
  Descriptions,
  Badge,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  WechatOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

interface Node {
  id: string;
  type: 'gateway' | 'bot' | 'user' | 'agent' | 'service';
  name: string;
  status: 'online' | 'offline' | 'running' | 'stopped';
  metadata?: {
    port?: number;
    description?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
}

const Nodes: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      // 只获取节点数据（不包括实例）
      // 一个实例对应一个节点，节点是通信单位
      const nodesRes = await api.get('/nodes').catch(() => ({ data: { data: [] } }));
      
      const nodeList = (nodesRes.data?.data || []).map((node: any) => ({
        ...node,
        type: node.type || 'bot',
        status: node.status || 'offline',
      }));
      
      setNodes(nodeList);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      message.error('加载节点失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async (values: any) => {
    try {
      await api.post('/nodes', {
        id: values.id,
        type: values.type,
        name: values.name,
        metadata: {
          description: values.description,
        },
      });
      message.success('节点添加成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchNodes();
    } catch (error) {
      console.error('Failed to add node:', error);
      message.error('添加节点失败');
    }
  };

  const handleDeleteNode = (node: Node) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除节点 "${node.name}" 吗？${
        node.type === 'instance' ? '\n\n⚠️ 注意：这只是从 ClawNet 中移除，不会删除实际的实例。' : ''
      }`,
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(`/nodes/${node.id}`);
          message.success('节点删除成功');
          fetchNodes();
        } catch (error) {
          console.error('Failed to delete node:', error);
          message.error('删除节点失败');
        }
      },
    });
  };

  const handleViewDetail = (node: Node) => {
    setSelectedNode(node);
    setIsDetailModalVisible(true);
  };

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      gateway: { color: 'gold', icon: <CloudServerOutlined />, text: 'Gateway' },
      bot: { color: 'purple', icon: <ApiOutlined />, text: '机器人' },
      user: { color: 'blue', icon: '👤', text: '用户' },
      agent: { color: 'green', icon: '🤖', text: '代理' },
      service: { color: 'orange', icon: '⚙️', text: '服务' },
    };
    const config = typeMap[type] || { color: 'default', icon: '📦', text: type };
    return (
      <Tag color={config.color} icon={typeof config.icon === 'string' ? undefined : config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: 'success' | 'processing' | 'default' | 'error'; text: string }> = {
      online: { status: 'success', text: '在线' },
      running: { status: 'processing', text: '运行中' },
      offline: { status: 'default', text: '离线' },
      stopped: { status: 'default', text: '已停止' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status} text={config.text} />;
  };

  const filteredNodes = nodeTypeFilter === 'all' 
    ? nodes 
    : nodes.filter(node => node.type === nodeTypeFilter);

  const columns = [
    {
      title: '节点 ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string, record: Node) => (
        <Space>
          {getTypeTag(record.type)}
          <span>{id}</span>
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
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
      width: 200,
      render: (_: any, record: Node) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button type="link" size="small">编辑</Button>
          <Button 
            type="link" 
            size="small" 
            danger
            onClick={() => handleDeleteNode(record)}
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
        title={
          <Space>
            <span>节点管理</span>
            <Tag color="blue">{nodes.length} 个节点</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={nodeTypeFilter}
              onChange={setNodeTypeFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">全部节点</Select.Option>
              <Select.Option value="gateway">Gateway</Select.Option>
              <Select.Option value="bot">机器人</Select.Option>
              <Select.Option value="user">用户</Select.Option>
              <Select.Option value="agent">代理</Select.Option>
              <Select.Option value="service">服务</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchNodes}>
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              添加节点
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredNodes} 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个节点`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 添加节点对话框 */}
      <Modal
        title="添加新节点"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddNode}
        >
          <Form.Item
            label="节点 ID"
            name="id"
            rules={[
              { required: true, message: '请输入节点 ID' },
              { pattern: /^[a-z0-9_-]+$/i, message: '只能包含字母、数字、下划线和连字符' },
            ]}
          >
            <Input placeholder="例如：my-bot-1" />
          </Form.Item>

          <Form.Item
            label="节点类型"
            name="type"
            rules={[{ required: true, message: '请选择节点类型' }]}
          >
            <Select placeholder="选择节点类型">
              <Select.Option value="bot">🤖 机器人</Select.Option>
              <Select.Option value="user">👤 用户</Select.Option>
              <Select.Option value="agent">🤖 代理</Select.Option>
              <Select.Option value="service">⚙️ 服务</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="节点名称"
            name="name"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input placeholder="例如：My Bot 1" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea 
              placeholder="节点描述（可选）" 
              rows={3}
            />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, color: '#8c8c8c', fontSize: 12 }}>
          💡 提示：OpenClaw 实例会自动作为节点显示在列表中，无需手动添加
        </div>
      </Modal>

      {/* 节点详情对话框 */}
      <Modal
        title={`节点详情: ${selectedNode?.name || ''}`}
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedNode(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedNode && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="节点 ID">{selectedNode.id}</Descriptions.Item>
                    <Descriptions.Item label="类型">
                      {getTypeTag(selectedNode.type)}
                    </Descriptions.Item>
                    <Descriptions.Item label="名称">{selectedNode.name}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {getStatusBadge(selectedNode.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {dayjs(selectedNode.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    {selectedNode.updatedAt && (
                      <Descriptions.Item label="更新时间">
                        {dayjs(selectedNode.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ),
              },
              {
                key: 'metadata',
                label: '元数据',
                children: selectedNode.type === 'instance' ? (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="端口">
                      {selectedNode.metadata?.port || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gateway">
                      <Tag color={selectedNode.metadata?.gateway?.running ? 'success' : 'default'}>
                        {selectedNode.metadata?.gateway?.running ? '运行中' : '已停止'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="微信登录">
                      <Tag 
                        color={selectedNode.metadata?.wechat?.loggedIn ? 'success' : 'default'}
                        icon={<WechatOutlined />}
                      >
                        {selectedNode.metadata?.wechat?.loggedIn ? '已登录' : '未登录'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="ClawNet">
                      <Tag 
                        color={selectedNode.metadata?.clawnet?.connected ? 'success' : 'default'}
                        icon={<ApiOutlined />}
                      >
                        {selectedNode.metadata?.clawnet?.connected ? '已连接' : '未连接'}
                      </Tag>
                    </Descriptions.Item>
                    {selectedNode.metadata?.wechat?.accountId && (
                      <Descriptions.Item label="微信账号">
                        {selectedNode.metadata.wechat.accountId}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ) : (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="描述">
                      {selectedNode.metadata?.description || '暂无描述'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'raw',
                label: '原始数据',
                children: (
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 16, 
                    borderRadius: 4,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedNode, null, 2)}
                  </pre>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Nodes;
