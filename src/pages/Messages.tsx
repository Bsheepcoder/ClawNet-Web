import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Space, List, Tag, Select, Empty } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ClearOutlined,
  DownloadOutlined 
} from '@ant-design/icons';

interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  content: string;
  timestamp: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filter, setFilter] = useState({ node: '', type: '' });
  const listRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 模拟一些测试消息
    setMessages([
      {
        id: '1',
        from: 'bot-1',
        to: 'user-1',
        type: 'text',
        content: '你好！有什么可以帮助你的吗？',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        from: 'user-1',
        to: 'bot-1',
        type: 'text',
        content: '我想查询今天的天气',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      // 连接 WebSocket
      const ws = new WebSocket('ws://localhost:3000/ws');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
        
        // 自动滚动到底部
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } else {
      // 断开 WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isMonitoring]);

  const handleClear = () => {
    setMessages([]);
  };

  const handleExport = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter.node && msg.from !== filter.node && msg.to !== filter.node) {
      return false;
    }
    if (filter.type && msg.type !== filter.type) {
      return false;
    }
    return true;
  });

  return (
    <Card
      title="📨 消息监控"
      extra={
        <Space>
          <Select
            placeholder="筛选节点"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilter({ ...filter, node: value || '' })}
          >
            <Select.Option value="bot-1">bot-1</Select.Option>
            <Select.Option value="bot-2">bot-2</Select.Option>
            <Select.Option value="user-1">user-1</Select.Option>
          </Select>

          <Select
            placeholder="筛选类型"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilter({ ...filter, type: value || '' })}
          >
            <Select.Option value="text">文本消息</Select.Option>
            <Select.Option value="image">图片消息</Select.Option>
            <Select.Option value="file">文件消息</Select.Option>
          </Select>

          <Button
            type={isMonitoring ? 'default' : 'primary'}
            icon={isMonitoring ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? '暂停监控' : '开始监控'}
          </Button>

          <Button icon={<ClearOutlined />} onClick={handleClear}>
            清空
          </Button>

          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
        </Space>
      }
    >
      {filteredMessages.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        <div
          ref={listRef}
          style={{
            height: 600,
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            padding: 16,
          }}
        >
          <List
            dataSource={filteredMessages}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Tag color="blue">{new Date(item.timestamp).toLocaleTimeString('zh-CN')}</Tag>
                    <span style={{ fontWeight: 'bold' }}>{item.from}</span>
                    <span>→</span>
                    <span style={{ fontWeight: 'bold' }}>{item.to}</span>
                    <Tag color="green">{item.type}</Tag>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                    {item.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};

export default Messages;
