import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  List,
  Tag,
  Select,
  Empty,
  Input,
  message,
  Divider,
  Badge,
  Tooltip,
  Alert
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClearOutlined,
  DownloadOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

interface Message {
  id: string;
  eventId?: string;
  from: string;
  to?: string;
  targets?: string[];
  type: string;
  payload: any;
  timestamp: string | number;
  status?: 'sent' | 'delivered' | 'failed';
}

interface Node {
  id: string;
  name: string;
  type: string;
  status: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filter, setFilter] = useState({ node: '', type: '' });
  const [selectedFromNode, setSelectedFromNode] = useState<string>('');
  const [selectedToNode, setSelectedToNode] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchNodes();
    fetchMessages();
    const interval = setInterval(() => {
      fetchNodes();
      fetchMessages();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [isMonitoring]);

  const fetchNodes = async () => {
    try {
      const response = await api.get('/nodes').catch(() => ({ data: { data: [] } }));
      setNodes(response.data?.data || []);
      if (nodes.length > 0 && !selectedFromNode) {
        setSelectedFromNode(response.data?.data?.[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages?limit=100').catch(() => ({ data: { data: [] } }));
      const messagesData = response.data?.data || [];
      setMessages(messagesData.map((m: any) => ({
        id: m.id,
        eventId: m.eventId,
        from: m.from,
        to: m.to,
        targets: m.targets,
        type: m.eventType || m.type,
        payload: m.payload,
        timestamp: m.timestamp,
        status: m.status
      })));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const connectWebSocket = () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsUrl = `${wsProtocol}//${wsHost}:3000?nodeId=web-client-${Date.now()}&token=clawnet-secret-token`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      message.success('已连接到消息监控');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' || data.type === 'event') {
          setMessages(prev => [...prev, {
            id: data.eventId || Date.now().toString(),
            eventId: data.eventId,
            from: data.from,
            to: data.to,
            targets: data.targets,
            type: data.type,
            payload: data.payload,
            timestamp: data.timestamp || Date.now(),
            status: 'delivered'
          }]);
        }
      } catch (e) {
        // 忽略解析错误
      }
    };

    wsRef.current.onerror = () => {
      message.error('WebSocket 连接错误');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // 发送消息（通过路由 API）
  const handleSendMessage = async () => {
    if (!selectedFromNode) {
      message.warning('请选择发送节点');
      return;
    }
    if (!messageContent.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    setSending(true);
    try {
      // 调用路由 API 发送消息
      const response = await api.post('/route', {
        from: selectedFromNode,
        type: 'message',
        payload: {
          text: messageContent,
          to: selectedToNode || undefined,
        }
      });

      if (response.data.success) {
        const result = response.data.data;

        // 添加到消息列表
        setMessages(prev => [...prev, {
          id: result.eventId,
          eventId: result.eventId,
          from: selectedFromNode,
          targets: result.targets,
          type: 'message',
          payload: { text: messageContent },
          timestamp: Date.now(),
          status: 'sent'
        }]);

        message.success(`消息已发送到 ${result.targets?.length || 0} 个节点`);
        setMessageContent('');
        // 刷新消息列表
        fetchMessages();
      } else {
        message.error(response.data.error || '发送失败');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      message.error(error.response?.data?.error || '发送消息失败');
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter.node && msg.from !== filter.node && !msg.targets?.includes(filter.node)) {
      return false;
    }
    if (filter.type && msg.type !== filter.type) {
      return false;
    }
    return true;
  });

  const handleExport = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clawnet-messages-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('消息已导出');
  };

  return (
    <div>
      {/* 说明 */}
      <Alert
        message="ClawNet 消息路由"
        description="通过关系网络路由消息。发送消息给节点A时，与A有关系的节点会根据权限接收消息。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 消息发送区 */}
      <Card
        title="📤 发送消息"
        style={{ marginBottom: 16 }}
        size="small"
      >
        <Space.Compact style={{ width: '100%' }}>
          <Select
            style={{ width: 180 }}
            placeholder="发送节点"
            value={selectedFromNode}
            onChange={setSelectedFromNode}
          >
            {nodes.map(node => (
              <Select.Option key={node.id} value={node.id}>
                <Space>
                  <Badge status={node.status === 'online' ? 'success' : 'default'} />
                  {node.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: 180 }}
            placeholder="目标节点（可选）"
            value={selectedToNode}
            onChange={setSelectedToNode}
            allowClear
          >
            {nodes.filter(n => n.id !== selectedFromNode).map(node => (
              <Select.Option key={node.id} value={node.id}>
                <Space>
                  <Badge status={node.status === 'online' ? 'success' : 'default'} />
                  {node.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
          <Input
            style={{ width: 'auto', flex: 1 }}
            placeholder="输入消息内容..."
            value={messageContent}
            onChange={e => setMessageContent(e.target.value)}
            onPressEnter={handleSendMessage}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSendMessage}
          >
            发送
          </Button>
        </Space.Compact>
        <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
          💡 不选择目标节点时，消息会自动路由到所有有关系的节点
        </div>
      </Card>

      {/* 消息监控区 */}
      <Card
        title={
          <Space>
            <span>📨 消息监控</span>
            <Tag color={isMonitoring ? 'green' : 'default'}>
              {isMonitoring ? '监控中' : '已暂停'}
            </Tag>
            <Tag color="blue">{filteredMessages.length} 条消息</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              style={{ width: 120 }}
              placeholder="筛选节点"
              value={filter.node}
              onChange={(value) => setFilter({ ...filter, node: value })}
              allowClear
            >
              {nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>
                  {node.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchMessages}
            >
              刷新
            </Button>
            <Button
              type={isMonitoring ? 'default' : 'primary'}
              icon={isMonitoring ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? '暂停' : '监控'}
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={() => setMessages([])}
            >
              清空
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
          </Space>
        }
      >
        {filteredMessages.length === 0 ? (
          <Empty
            description="暂无消息"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <p style={{ color: '#8c8c8c' }}>
              发送消息或开启监控来查看消息流
            </p>
          </Empty>
        ) : (
          <List
            ref={listRef}
            dataSource={filteredMessages}
            style={{ maxHeight: 500, overflow: 'auto' }}
            renderItem={(msg) => {
              const fromNode = nodes.find(n => n.id === msg.from);
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue">{msg.type}</Tag>
                        <Badge status={fromNode?.status === 'online' ? 'success' : 'default'} />
                        <span>From: {fromNode?.name || msg.from}</span>
                        {msg.targets && msg.targets.length > 0 && (
                          <>
                            <span>→</span>
                            <span>{msg.targets.map(t => nodes.find(n => n.id === t)?.name || t).join(', ')}</span>
                          </>
                        )}
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                          {typeof msg.timestamp === 'number'
                            ? dayjs(msg.timestamp).format('HH:mm:ss')
                            : msg.timestamp}
                        </span>
                      </Space>
                    }
                    description={
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload, null, 2)}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default Messages;
