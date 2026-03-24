import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Segmented,
  Empty,
  Descriptions,
  Badge,
  Tooltip,
  Popconfirm,
  Divider,
  Alert
} from 'antd';
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import RelationGraph from '../components/RelationGraph';
import api from '../services/api';
import dayjs from 'dayjs';

// 关系类型
type RelationType = 'observe' | 'manage' | 'collaborate' | 'delegate';

// 权限类型
type Permission = 'read' | 'write' | 'admin';

interface Relation {
  id: string;
  from: string;
  to: string;
  type: RelationType;
  permissions: Permission[];
  metadata?: {
    ttl?: number;
    expiresAt?: string;
    isTemporary?: boolean;
  };
  createdAt: number;
  status?: 'active' | 'pending' | 'expired';
}

interface RelationRequest {
  id: string;
  from: string;
  to: string;
  type: RelationType;
  permissions: Permission[];
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

interface Node {
  id: string;
  name: string;
  type: string;
  status: string;
}

// 关系类型配置
const RELATION_TYPE_CONFIG: Record<RelationType, { color: string; icon: string; text: string; desc: string }> = {
  observe: { color: 'blue', icon: '👁️', text: '观察', desc: '可以观察目标节点的状态和消息' },
  manage: { color: 'orange', icon: '🔧', text: '管理', desc: '可以管理目标节点的配置和行为' },
  collaborate: { color: 'green', icon: '🤝', text: '协作', desc: '可以与目标节点协作处理任务' },
  delegate: { color: 'purple', icon: ' delegation', text: '代理', desc: '可以代表目标节点执行操作' }
};

// 权限配置
const PERMISSION_CONFIG: Record<Permission, { color: string; text: string }> = {
  read: { color: 'blue', text: '读取' },
  write: { color: 'green', text: '写入' },
  admin: { color: 'red', text: '管理' }
};

const Relations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('list');
  const [relations, setRelations] = useState<Relation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RelationRequest[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取关系列表
      const relationsRes = await api.get('/relations').catch(() => ({ data: { data: [] } }));
      setRelations(relationsRes.data?.data || []);

      // 获取节点列表（用于创建关系时选择）
      const nodesRes = await api.get('/nodes').catch(() => ({ data: { data: [] } }));
      setNodes(nodesRes.data?.data || []);

      // 获取待处理的关系请求
      // const requestsRes = await api.get('/relations/pending/current').catch(() => ({ data: { data: [] } }));
      // setPendingRequests(requestsRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建关系
  const handleCreateRelation = async (values: any) => {
    try {
      const response = await api.post('/relations', {
        from: values.from,
        to: values.to,
        type: values.type,
        permissions: values.permissions || ['read'],
      });

      if (response.data.success) {
        message.success('关系创建成功');
        setIsCreateModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(response.data.error || '创建失败');
      }
    } catch (error: any) {
      console.error('Failed to create relation:', error);
      message.error(error.response?.data?.error || '创建关系失败');
    }
  };

  // 删除关系
  const handleDeleteRelation = async (relationId: string) => {
    try {
      await api.delete(`/relations/${relationId}`);
      message.success('关系已删除');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete relation:', error);
      message.error('删除关系失败');
    }
  };

  // 获取关系类型标签
  const getRelationTypeTag = (type: RelationType) => {
    const config = RELATION_TYPE_CONFIG[type];
    return (
      <Tag color={config.color}>
        {config.icon} {config.text}
      </Tag>
    );
  };

  // 获取权限标签
  const getPermissionTags = (permissions: Permission[]) => {
    return (
      <Space size={4}>
        {permissions.map(p => (
          <Tag key={p} color={PERMISSION_CONFIG[p].color}>
            {PERMISSION_CONFIG[p].text}
          </Tag>
        ))}
      </Space>
    );
  };

  // 列表视图列定义
  const columns = [
    {
      title: '关系ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '源节点',
      dataIndex: 'from',
      key: 'from',
      width: 150,
      render: (from: string) => {
        const node = nodes.find(n => n.id === from);
        return (
          <Space>
            <Badge status={node?.status === 'online' ? 'success' : 'default'} />
            <span>{node?.name || from}</span>
          </Space>
        );
      },
    },
    {
      title: '→',
      key: 'arrow',
      width: 40,
      render: () => <LinkOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: '目标节点',
      dataIndex: 'to',
      key: 'to',
      width: 150,
      render: (to: string) => {
        const node = nodes.find(n => n.id === to);
        return (
          <Space>
            <Badge status={node?.status === 'online' ? 'success' : 'default'} />
            <span>{node?.name || to}</span>
          </Space>
        );
      },
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: RelationType) => getRelationTypeTag(type),
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 150,
      render: (permissions: Permission[]) => getPermissionTags(permissions),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Relation) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedRelation(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此关系吗？"
            description="删除后，节点间的通信将受影响"
            onConfirm={() => handleDeleteRelation(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 提示信息 */}
      <Alert
        message="ClawNet 关系管理"
        description={
          <div>
            <p><strong>关系类型说明：</strong></p>
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li><strong>观察 (observe)</strong>: 可以观察目标节点的状态和消息</li>
              <li><strong>管理 (manage)</strong>: 可以管理目标节点的配置和行为</li>
              <li><strong>协作 (collaborate)</strong>: 可以与目标节点协作处理任务和消息</li>
              <li><strong>代理 (delegate)</strong>: 可以代表目标节点执行操作</li>
            </ul>
            <p style={{ marginTop: 8 }}><strong>消息路由：</strong>发送消息给节点A时，与A有关系的节点B可以根据权限接收并处理该消息。</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card
        title={
          <Space>
            <span>Relations</span>
            <Tag color="blue">{relations.length} relations</Tag>
          </Space>
        }
        extra={
          <Space>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as 'graph' | 'list')}
              options={[
                {
                  value: 'graph',
                  icon: <AppstoreOutlined />,
                  label: '图谱视图',
                },
                {
                  value: 'list',
                  icon: <UnorderedListOutlined />,
                  label: '列表视图',
                },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              建立关系
            </Button>
          </Space>
        }
      >
        {viewMode === 'graph' ? (
          <RelationGraph
            nodes={nodes}
            relations={relations}
            onNodeClick={(node: Node) => {
              console.log('Node clicked:', node);
              setSelectedRelation(null);
              message.info(`点击节点: ${node.name}`);
            }}
            onEdgeClick={(relation: Relation) => {
              console.log('Edge clicked:', relation);
              setSelectedRelation(relation);
              message.info(`点击关系: ${relation.type}`);
            }}
          />
        ) : (
          <>
            {relations.length === 0 ? (
              <Empty
                description="暂无关系"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <p style={{ color: '#8c8c8c' }}>
                  建立节点间的关系，实现消息路由和协作
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                >
                  创建第一个关系
                </Button>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={relations}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 个关系`,
                }}
                scroll={{ x: 1200 }}
              />
            )}
          </>
        )}
      </Card>

      {/* 关系详情 */}
      {selectedRelation && (
        <Card
          title="关系详情"
          style={{ marginTop: 16 }}
          extra={
            <Button onClick={() => setSelectedRelation(null)}>关闭</Button>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="关系ID">{selectedRelation.id}</Descriptions.Item>
            <Descriptions.Item label="类型">
              {getRelationTypeTag(selectedRelation.type)}
            </Descriptions.Item>
            <Descriptions.Item label="源节点">{selectedRelation.from}</Descriptions.Item>
            <Descriptions.Item label="目标节点">{selectedRelation.to}</Descriptions.Item>
            <Descriptions.Item label="权限" span={2}>
              {getPermissionTags(selectedRelation.permissions)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {dayjs(selectedRelation.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 创建关系对话框 */}
      <Modal
        title="建立关系"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRelation}
          initialValues={{
            type: 'collaborate',
            permissions: ['read'],
          }}
        >
          <Form.Item
            label="源节点"
            name="from"
            rules={[{ required: true, message: '请选择源节点' }]}
          >
            <Select
              placeholder="选择发起关系的节点"
              showSearch
              optionFilterProp="children"
            >
              {nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>
                  <Space>
                    <Badge status={node.status === 'online' ? 'success' : 'default'} />
                    {node.name} ({node.type})
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="目标节点"
            name="to"
            rules={[{ required: true, message: '请选择目标节点' }]}
          >
            <Select
              placeholder="选择关系的目标节点"
              showSearch
              optionFilterProp="children"
            >
              {nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>
                  <Space>
                    <Badge status={node.status === 'online' ? 'success' : 'default'} />
                    {node.name} ({node.type})
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="关系类型"
            name="type"
            rules={[{ required: true, message: '请选择关系类型' }]}
            extra="选择节点间的关系类型"
          >
            <Select>
              {Object.entries(RELATION_TYPE_CONFIG).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tooltip title={config.desc}>
                    <span>{config.icon} {config.text} - {config.desc}</span>
                  </Tooltip>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="权限"
            name="permissions"
            extra="选择目标节点对源节点的权限"
          >
            <Select mode="multiple" placeholder="选择权限">
              {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={config.color}>{config.text}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ color: '#8c8c8c', fontSize: 12 }}>
          <p><strong>💡 提示：</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <li>建立关系后，节点间可以根据权限进行消息路由</li>
            <li>协作关系允许双向通信</li>
            <li>管理关系需要管理员权限</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Relations;
