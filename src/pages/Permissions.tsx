import React, { useState } from 'react';
import { Card, Form, Select, Button, Space, Alert, Divider, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const Permissions: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/check', {
        from: values.from,
        to: values.to,
        action: values.action,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Permission check failed:', error);
      setResult({ allowed: false, error: '检查失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="🔐 权限检查">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheck}
          initialValues={{
            action: 'message:send',
          }}
        >
          <Form.Item label="源节点" name="from" rules={[{ required: true }]}>
            <Input placeholder="例如：bot-1" />
          </Form.Item>

          <Form.Item label="目标节点" name="to" rules={[{ required: true }]}>
            <Input placeholder="例如：user-1" />
          </Form.Item>

          <Form.Item label="操作" name="action" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="message:send">发送消息</Select.Option>
              <Select.Option value="message:receive">接收消息</Select.Option>
              <Select.Option value="file:read">读取文件</Select.Option>
              <Select.Option value="file:write">写入文件</Select.Option>
              <Select.Option value="admin:manage">管理权限</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              检查权限
            </Button>
          </Form.Item>
        </Form>

        {result && (
          <>
            <Divider />
            <Alert
              message={result.allowed ? '✅ 允许' : '❌ 拒绝'}
              description={
                result.allowed ? (
                  <div>
                    <p>该操作被允许执行</p>
                    {result.reason && <p>原因：{result.reason}</p>}
                  </div>
                ) : (
                  <div>
                    <p>该操作被拒绝</p>
                    {result.error && <p>错误：{result.error}</p>}
                  </div>
                )
              }
              type={result.allowed ? 'success' : 'error'}
              icon={result.allowed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              showIcon
            />
          </>
        )}
      </Card>

      <Card title="📖 权限说明" style={{ marginTop: 16 }}>
        <div>
          <h4>权限类型</h4>
          <ul>
            <li><strong>message:send</strong> - 发送消息权限</li>
            <li><strong>message:receive</strong> - 接收消息权限</li>
            <li><strong>file:read</strong> - 读取文件权限</li>
            <li><strong>file:write</strong> - 写入文件权限</li>
            <li><strong>admin:manage</strong> - 管理权限</li>
          </ul>

          <h4>权限规则</h4>
          <ul>
            <li>角色权限：基于节点的角色类型</li>
            <li>关系权限：基于节点间的关系类型</li>
            <li>自定义权限：灵活的权限配置</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Permissions;
